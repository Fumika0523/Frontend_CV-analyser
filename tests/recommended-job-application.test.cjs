const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const pureModules = new Map();
function loadPure(file) {
  if (pureModules.has(file)) return pureModules.get(file);
  const exports = {};
  pureModules.set(file, exports);
  vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), { transforms: ["jsx", "imports"] }).code, {
    exports, URL,
    require(name) {
      if (name === "react" || name === "react-icons/fi") return require(name);
      if (name === "./jobUtils") return loadPure("components/Jobs/jobUtils.js");
      if (name === "./MatchScoreRing") return loadPure("components/Jobs/MatchScoreRing.jsx");
      throw new Error(name);
    },
  });
  return exports;
}
const { transform } = require("sucrase");

const jobs = [
  { jobId: "job-a", title: "Engineer A", matchScore: 83, companyName: "Example Employer",
    companyUrl: "https://example.com", keySkills: ["React"], salary: "£40,000–£50,000" },
  { jobId: "job-b", title: "Engineer B", matchScore: 61 },
];
const tick = () => new Promise((resolve) => setImmediate(resolve));

// Render the actual component with deferred HTTP responses and persistent hook
// values. This exercises click handlers before and after a React-style rerender.
function harness(isGuest = false, { noCv = false } = {}) {
  const slots = [];
  let cursor = 0;
  let mounted = false;
  const effects = [];
  const calls = { get: [], post: [], pending: [], success: [], error: [], scoreEnabled: [] };
  const storage = new Map(isGuest ? [["guest_session_id", "test-guest"]] : [["token", "test-token"]]);
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => {
        slots[index] = typeof value === "function" ? value(slots[index]) : value;
      }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect) { if (!mounted) effects.push(effect); },
  };
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, "../pages/candidate/Dashboard/MatchingJobs.js"), "utf8");
  vm.runInNewContext(transform(source, { transforms: ["jsx", "imports"] }).code, {
    exports,
    console: { error() {} },
    localStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    require(name) {
      if (name === "react") return hooks;
      if (name === "axios") return {
        get: async (endpoint) => { calls.get.push(endpoint); return { data: endpoint.endsWith("/job-a") ? { ...jobs[0], _id: "job-a" } : { matchedJobs: jobs } }; },
        post: (...args) => {
          calls.post.push(args);
          return new Promise((resolve, reject) => calls.pending.push({ resolve, reject }));
        },
      };
      if (name === "next/router") return { useRouter: () => ({ push() {} }) };
      if (name === "react-toastify") return { toast: {
        success: (message) => calls.success.push(message),
        error: (message) => calls.error.push(message),
      } };
      if (name.endsWith("/utils/constant")) return { url: "http://test.invalid" };
      if (name === "react-icons/fi") return require(name);
      if (name.endsWith("/QuickApplyModal")) return function QuickApplyModal() { return null; };
      if (name.endsWith("/JobDetailsModal")) return function JobDetailsModal() { return null; };
      if (name.endsWith("/JobCard")) return loadPure("components/Jobs/JobCard.jsx");
      if (name.endsWith("/jobDetailsMatchState")) return loadPure("components/Jobs/jobDetailsMatchState.js");
      if (name.endsWith("/MatchScoreRing")) return loadPure("components/Jobs/MatchScoreRing.jsx");
      if (name.endsWith("/JobMatchIndicator")) return loadPure("components/Jobs/JobMatchIndicator.jsx");
      if (name.endsWith("/useLatestJobScores")) return (_jobs, enabled) => {
        calls.scoreEnabled.push(enabled);
        return { status: enabled ? "ready" : "guest", cv: noCv ? null : { _id: "cv-latest" }, retry() {}, selectCv() {} };
      };
      if (name.endsWith("/MatchScoreModal")) return function MatchScoreModal() { return null; };
      if (name.endsWith("/otpModal")) return function OtpModal() { return null; };
      if (name.endsWith("/authModal")) return function AuthModal() { return null; };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return {
    calls, storage,
    render() { cursor = 0; return exports.default({ isGuest, guestMatches: isGuest ? jobs : undefined }); },
    async mount() {
      this.render();
      mounted = true;
      effects.forEach((effect) => effect());
      await tick();
      return this.render();
    },
  };
}
function all(node) {
  if (!node || typeof node !== "object") return [];
  if (["JobCard", "JobMatchIndicator", "MatchScoreRing"].includes(node.type?.name)) return [node, ...all(node.type(node.props))];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(all)];
}
function text(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (["JobCard", "JobMatchIndicator", "MatchScoreRing"].includes(node?.type?.name)) return text(node.type(node.props));
  return node && typeof node === "object"
    ? React.Children.toArray(node.props?.children).map(text).join(" ") : "";
}
const applyButtons = (tree) => all(tree).filter((node) => node.type === "button" && /Quick Apply|Applying\.\.\./.test(text(node)));
const cards = (tree) => all(tree).filter((node) => node.type === "article");
const review = (app) => all(app.render()).find((node) => node.type?.name === "QuickApplyModal");
function confirm(app, tree) {
  applyButtons(tree)[0].props.onClick();
  assert.equal(app.calls.post.length, 0, "opening Quick Apply must not submit");
  return review(app).props.onConfirm("selected-cv");
}

test("rapid double clicks send one POST and disable Apply while pending", async () => {
  const app = harness();
  const tree = await app.mount();
  applyButtons(tree)[0].props.onClick();
  assert.equal(app.calls.post.length, 0);
  const click = review(app).props.onConfirm;
  const first = click("selected-cv");
  await click("selected-cv"); // Same render: state alone cannot guard this second click.
  assert.equal(app.calls.post.length, 1);
  const [endpoint, body, config] = app.calls.post[0];
  assert.equal(endpoint, "http://test.invalid/applications/apply");
  assert.equal(body.jobId, "job-a");
  assert.equal(body.cvId, "selected-cv");
  assert.equal(config.headers.Authorization, "Bearer test-token");
  assert.ok(applyButtons(app.render()).every((button) => button.props.disabled));
  assert.equal(cards(app.render()).length, 2);
  app.calls.pending[0].resolve({ data: { message: "Applied" } });
  await first;
});

test("failed applications retain recommendations, show errors and allow retry", async () => {
  for (const [error, expected] of [
    [{ response: { data: { message: "Please upload a CV" } } }, "Please upload a CV"],
    [new Error("Network failure"), "Failed to apply"],
  ]) {
    const app = harness();
    const tree = await app.mount();
    const request = confirm(app, tree);
    app.calls.pending[0].reject(error);
    await request;
    assert.equal(cards(app.render()).length, 2);
    assert.deepEqual(app.calls.error, [expected]);
    assert.equal(app.calls.success.length, 0);
    assert.ok(applyButtons(app.render()).every((button) => !button.props.disabled));
    const retry = review(app).props.onConfirm("selected-cv");
    assert.equal(app.calls.post.length, 2);
    app.calls.pending[1].resolve({ data: { message: "Applied" } });
    await retry;
  }
});

test("successful application removes only that job and restores other Apply buttons", async () => {
  const app = harness();
  const tree = await app.mount();
  const request = confirm(app, tree);
  assert.equal(cards(app.render()).length, 2);
  app.calls.pending[0].resolve({ data: { message: "Application submitted successfully" } });
  await request;
  const next = app.render();
  assert.equal(cards(next).length, 1);
  assert.ok(text(next).includes("Engineer B"));
  assert.ok(!text(next).includes("Engineer A"));
  assert.ok(all(next).some((node) => node.props?.score === 61));
  assert.ok(applyButtons(next).every((button) => !button.props.disabled));
  assert.deepEqual(app.calls.success, ["Application submitted successfully"]);
  assert.equal(review(app), undefined);
});

test("job title and View Details open existing details; its action opens review without submitting", async () => {
  for (const label of ["Engineer A", "View Details"]) {
    const app = harness();
    const tree = await app.mount();
    const button = all(tree).find((node) => node.type === "button" && text(node).includes(label));
    await button.props.onClick();
    const details = all(app.render()).find((node) => node.type?.name === "JobDetailsModal");
    assert.equal(details.props.job.jobId, "job-a");
    details.props.applyButton.props.onClick();
    assert.ok(review(app));
    assert.equal(app.calls.post.length, 0);
  }
});

test("guests open signup without submitting an application", async () => {
  const app = harness(true);
  const tree = await app.mount();
  assert.equal(applyButtons(tree).length, 0);
  const signup = all(tree).find((node) => node.type === "button" && text(node).includes("Sign up to Apply"));
  signup.props.onClick();
  assert.deepEqual(app.calls.get, []);
  assert.equal(app.calls.post.length, 0);
  assert.ok(app.calls.scoreEnabled.every((enabled) => !enabled));
  assert.ok(all(app.render()).some((node) => node.props?.isOpen && node.props?.initialMode === "signup"));
});

test("recommended cards keep backend feed and score breakdown without adding batch-score requests", async () => {
  const app = harness();
  const tree = await app.mount();
  assert.equal(cards(tree).length, 2);
  const ring = all(tree).find((node) => node.type?.name === "MatchScoreRing" && node.props.score === 83);
  ring.props.onClick();
  const modal = all(app.render()).find((node) => node.type?.name === "MatchScoreModal");
  assert.equal(modal.props.data.matchScore, 83);
  assert.equal(modal.props.data.jobId, "job-a");
  assert.ok(app.calls.get[0].includes("/candidate/matched-jobs"));
  assert.equal(app.calls.post.length, 0);
});

test("recommended cards with no candidate CV show upload prompt instead of a fabricated score", async () => {
  const app = harness(false, { noCv: true });
  const tree = await app.mount();
  assert.ok(text(tree).includes("Upload CV to see your match"));
  assert.equal(all(tree).filter((node) => node.type?.name === "MatchScoreRing").length, 0);
  assert.equal(app.calls.post.length, 0);
});

test("recommended JD receives the original card match after loading the full job, without another score request", async () => {
  const app = harness();
  const tree = await app.mount();
  const title = all(tree).find((node) => node.type === "button" && text(node).includes("Engineer A"));
  await title.props.onClick();
  const details = all(app.render()).find((node) => node.type?.name === "JobDetailsModal");
  assert.equal(details.props.matchState.status, "ready");
  assert.equal(details.props.matchState.match.jobId, "job-a");
  assert.equal(details.props.matchState.match.matchScore, 83);
  assert.equal(details.props.job.companyName, "Example Employer");
  assert.equal(details.props.job.companyUrl, "https://example.com");
  assert.equal(app.calls.post.length, 0);
  assert.equal(app.calls.get.length, 2, "only recommendation feed and full JD are fetched");
});

test("recommended JD uses the restricted guest mode and identifies a candidate without a CV", async () => {
  for (const [guest, options, expected] of [[true, {}, "guest"], [false, { noCv: true }, "no-cv"]]) {
    const app = harness(guest, options);
    const tree = await app.mount();
    await all(tree).find((node) => node.type === "button" && text(node).includes("Engineer A")).props.onClick();
    const details = all(app.render()).find((node) => node.type?.name === "JobDetailsModal");
    assert.equal(details.props.matchState.status, expected);
    if (guest) {
      assert.equal(details.props.guestPreview, true);
      assert.equal(details.props.job.matchScore, 83);
      assert.deepEqual(app.calls.get, []);
    }
    assert.equal(app.calls.post.length, 0);
  }
});

test("guest cards hide employer data and the invitation carries the session through OTP", async () => {
  const app = harness(true);
  const tree = await app.mount();
  assert.doesNotMatch(text(tree), /Example Employer/);
  assert.equal(all(tree).filter((node) => node.type === "a").length, 0);
  assert.match(text(tree), /Engineer A.*83%.*£40,000–£50,000.*React/s);

  const ring = all(tree).find((node) => node.type?.name === "MatchScoreRing" && node.props.score === 83);
  ring.props.onClick();
  const invitation = all(app.render()).find((node) => node.type?.name === "MatchScoreModal");
  assert.equal(invitation.props.isGuest, true);
  invitation.props.onSignUp();
  const auth = all(app.render()).find((node) => node.type?.name === "AuthModal");
  assert.equal(auth.props.isOpen, true);
  assert.equal(auth.props.initialMode, "signup");
  auth.props.onOtpSent({ _id: "user", email: "test@example.invalid" });
  assert.equal(app.storage.get("guest_session_id"), "test-guest");
  const otp = all(app.render()).find((node) => node.type?.name === "OtpModal");
  otp.props.onVerified({ token: "verified-token" });
  assert.equal(app.storage.get("token"), "verified-token");
  assert.equal(app.storage.has("guest_session_id"), false);
});
