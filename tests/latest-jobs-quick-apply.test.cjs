const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { transform } = require("sucrase");
const tick = () => new Promise((resolve) => setImmediate(resolve));
const makeJob = (index, extra = {}) => ({
  _id: `job-${index}`, title: `Engineer ${index}`, companyId: { companyName: "Example" },
  status: "Open", createdAt: new Date(Date.now() - index * 1000).toISOString(),
  applicationEndDate: "2099-01-01", location: { city: "London", country: "United Kingdom" },
  jobType: "Full-time", workMode: "Remote", salary: "£30,000", ...extra,
});
const latestCv = { _id: "cv-latest", version: 2, originalFileName: "My CV.pdf", filePath: "/private/path.pdf", rawText: "PRIVATE CV CONTENT" };
const expand = (node) => {
  while (["JobMatchIndicator", "MatchScoreRing"].includes(node?.type?.name)) node = node.type(node.props);
  return node;
};
const all = (original) => {
  const node = expand(original);
  return !node || typeof node !== "object" ? [] : [node, ...React.Children.toArray(node.props?.children).flatMap(all)];
};
const text = (node) => typeof node === "string" || typeof node === "number" ? String(node)
  : node && typeof node === "object" ? (expand(node) !== node ? text(expand(node)) : React.Children.toArray(node.props?.children).map(text).filter(Boolean).join(" ")) : "";
const named = (tree, name) => all(tree).find((node) => node.type?.name === name);
const cards = (tree) => all(tree).filter((node) => node.type?.name === "JobCard");
const scoreText = (card) => text(card.props.matchIndicator);

function harness(options = {}) {
  const jobs = options.jobs || [makeJob(0), makeJob(1), makeJob(2)];
  const server = options.server || { applications: [] };
  const calls = { get: [], batch: [], apply: [], batchPending: [], applyPending: [], alerts: [], routes: [] };
  let token = options.guest ? null : "test-token";
  let cursor = 0;
  let effects = [];
  const slots = [];
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useEffect(fn, deps) {
      const index = cursor++;
      const old = slots[index];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) {
        effects.push(() => { old?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
      }
    },
  };
  const batchData = (body) => ({ data: { matches: body.jobIds.map((jobId) => ({
    jobId, matchScore: body.cvId === "cv-upload" ? 20 : [0, 40, 85][Number(jobId.split("-")[1]) % 3],
    matchedSkills: ["React"], missingSkills: ["SQL"], locationMatch: false,
  })) } });
  const axios = {
    get: async (...args) => {
      calls.get.push(args);
      if (args[0].endsWith("/all-jobs")) return { data: jobs };
      if (args[0].endsWith("/applications")) return { data: server.applications };
      if (args[0].endsWith("/cv/my-cvs")) {
        if (options.cvError) throw options.cvError;
        return { data: options.cvs || [latestCv] };
      }
      throw new Error(`Unexpected GET: ${args[0]}`);
    },
    post: (endpoint, body, config) => {
      if (endpoint.endsWith("/preview-matches")) {
        calls.batch.push({ endpoint, body, config });
        if (options.batchError) return Promise.reject(options.batchError);
        if (options.deferScores) return new Promise((resolve, reject) => calls.batchPending.push({ resolve, reject, body }));
        return Promise.resolve(options.invalidScores ? { data: { matches: [] } } : batchData(body));
      }
      if (endpoint.endsWith("/apply")) {
        calls.apply.push({ endpoint, body, config });
        const request = options.deferApply
          ? new Promise((resolve, reject) => calls.applyPending.push({ resolve, reject }))
          : options.applyError ? Promise.reject(options.applyError) : Promise.resolve({ data: { message: "Application submitted", application: { status: "pending" } } });
        return request.then((response) => {
          server.applications.push({ jobId: body.jobId, status: response.data.application.status });
          return response;
        });
      }
      throw new Error(`Unexpected POST: ${endpoint}`);
    },
  };
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    modules.set(file, exports);
    vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), { transforms: ["jsx", "imports"] }).code, {
      exports, console: { log() {}, error() {} },
      localStorage: { getItem: () => token, removeItem: () => { token = null; } },
      alert: (message) => calls.alerts.push(message),
      require(name) {
        if (name === "react") return hooks;
        if (name === "axios") return axios;
        if (name === "next/router") return { useRouter: () => ({ push: (route) => calls.routes.push(route) }) };
        if (name === "react-toastify") return { toast: { info: (value) => calls.alerts.push(value), success: (value) => calls.alerts.push(value), error: (value) => calls.alerts.push(value) } };
        if (name.endsWith("/utils/constant")) return { url: "http://test.invalid" };
        if (name.endsWith("/useLatestJobScores")) return load("components/Jobs/useLatestJobScores.js");
        if (name.endsWith("/jobDetailsMatchState")) return load("components/Jobs/jobDetailsMatchState.js");
        if (name.endsWith("/JobMatchIndicator")) return load("components/Jobs/JobMatchIndicator.jsx");
        if (name === "./MatchScoreRing") return load("components/Jobs/MatchScoreRing.jsx");
        if (name.endsWith("/jobUtils")) return load("components/Jobs/jobUtils.js");
        if (name.endsWith("/JobCard")) return function JobCard() { return null; };
        if (name.endsWith("/JobDetailsModal")) return function JobDetailsModal() { return null; };
        if (name.endsWith("/QuickApplyModal")) return function QuickApplyModal() { return null; };
        if (name.endsWith("/CVUploadModal")) return function CVUploadModal() { return null; };
        if (name.endsWith("/MatchScoreModal")) return function MatchScoreModal() { return null; };
        if (name.endsWith("/LocationAutocomplete")) return function LocationAutocomplete() { return null; };
        if (name.endsWith("/Layout/Layout")) return function Layout() { return null; };
        if (name === "react-icons/fi") return require(name);
        throw new Error(`Unexpected dependency: ${name}`);
      },
    });
    return exports;
  }
  const component = load(options.allJobs ? "pages/candidate/Dashboard/ApplyJobs.js" : "pages/candidate/Dashboard/LatestJobs.jsx").default;
  return {
    calls, server, options, batchData,
    render() { cursor = 0; effects = []; const tree = component(); effects.forEach((fn) => fn()); return tree; },
    async settle() { for (let i = 0; i < 7; i++) { this.render(); await tick(); } return this.render(); },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}
const review = (app) => named(app.render(), "QuickApplyModal");
const openReview = (app, card) => { card.props.applyButton.props.onClick(); return review(app); };

test("public listings, newest-first order and 14-day/availability filters are unchanged; low/zero scores remain visible", async () => {
  const jobs = [makeJob(2), makeJob(0), makeJob(1), makeJob(3, { createdAt: new Date(Date.now() - 15 * 86400000).toISOString() }),
    makeJob(4, { status: "Closed" }), makeJob(5, { applicationEndDate: "2000-01-01" })];
  const app = harness({ jobs });
  const tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job._id), ["job-0", "job-1", "job-2"]);
  assert.ok(scoreText(cards(tree)[0]).includes("0%"));
  assert.ok(scoreText(cards(tree)[1]).includes("40%"));
  assert.equal(app.calls.get.find(([endpoint]) => endpoint.endsWith("/all-jobs")).length, 1, "public request stays unauthenticated and unchanged");
  assert.equal(app.calls.batch[0].body.jobIds.length, 3);
  assert.equal(app.calls.batch[0].config.headers.Authorization, "Bearer test-token");
  assert.ok(!JSON.stringify(tree).includes("PRIVATE CV CONTENT"));
  app.unmount();
});

test("121 visible jobs are scored in bounded batches without dropping cards or repeating requests", async () => {
  const app = harness({ jobs: Array.from({ length: 121 }, (_, i) => makeJob(i)) });
  const tree = await app.settle();
  assert.equal(cards(tree).length, 121);
  assert.deepEqual(app.calls.batch.map(({ body }) => body.jobIds.length), [50, 50, 21]);
  for (const { body } of app.calls.batch) assert.equal(new Set(body.jobIds).size, body.jobIds.length);
  await app.settle();
  assert.equal(app.calls.batch.length, 3);
  assert.equal(app.calls.get.filter(([endpoint]) => endpoint.endsWith("/my-cvs")).length, 1);
  app.unmount();
});

test("keyword, salary, location and work-mode filters keep their existing behaviour and cached scores", async () => {
  const app = harness({ jobs: [makeJob(0, { title: "Alpha", workMode: "Remote", salary: "£30,000" }), makeJob(1, { title: "Beta", workMode: "Office", salary: "£50,000", location: "Paris, France" })] });
  let tree = await app.settle();
  all(tree).find((node) => node.props?.id === "job-search").props.onChange({ target: { value: "Alpha" } });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Alpha"]);
  all(tree).find((node) => node.props?.id === "job-search").props.onChange({ target: { value: "" } });
  tree = await app.settle();
  all(tree).find((node) => node.props?.id === "salary-filter").props.onChange({ target: { value: "40000" } });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Beta"]);
  all(tree).find((node) => node.props?.id === "salary-filter").props.onChange({ target: { value: "0" } });
  tree = await app.settle();
  const mode = all(tree).find((node) => node.type === "select" && node.props.id !== "salary-filter");
  mode.props.onChange({ target: { value: "Remote" } });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Alpha"]);
  all(tree).find((node) => node.type === "select" && node.props.id !== "salary-filter").props.onChange({ target: { value: "" } });
  tree = await app.settle();
  named(tree, "LocationAutocomplete").props.onChange({ displayName: "Paris" });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Beta"]);
  assert.equal(app.calls.batch.length, 1);
  app.unmount();
});

test("score indicator opens correct breakdown including genuine zero and location mismatch", async () => {
  const app = harness();
  const tree = await app.settle();
  expand(cards(tree)[0].props.matchIndicator).props.onClick();
  const breakdown = named(app.render(), "MatchScoreModal");
  assert.equal(breakdown.props.data.matchScore, 0);
  assert.equal(breakdown.props.data.title, "Engineer 0");
  assert.equal(breakdown.props.data.locationMatch, false);
  assert.deepEqual(Array.from(breakdown.props.data.missingSkills), ["SQL"]);
  assert.equal(app.calls.batch.length, 1);
  app.unmount();
});

test("guests have public listings and signup flow without personalised requests", async () => {
  const app = harness({ guest: true });
  const tree = await app.settle();
  assert.equal(cards(tree).length, 3);
  assert.ok(cards(tree).every((card) => card.props.matchIndicator === null));
  cards(tree)[0].props.applyButton.props.onClick();
  assert.deepEqual(app.calls.routes, ["/signup"]);
  assert.equal(app.calls.batch.length, 0);
  assert.equal(app.calls.apply.length, 0);
  assert.equal(app.calls.get.length, 1);
  app.unmount();
});

test("candidate with no CV sees upload action and can open review without applying", async () => {
  const app = harness({ cvs: [] });
  const tree = await app.settle();
  assert.ok(cards(tree).every((card) => scoreText(card) === "Upload CV to see your match"));
  expand(cards(tree)[0].props.matchIndicator).props.onClick();
  assert.equal(named(app.render(), "CVUploadModal").props.isOpen, true);
  named(app.render(), "CVUploadModal").props.onClose();
  assert.equal(openReview(app, cards(app.render())[0]).props.initialCv, null);
  assert.equal(app.calls.batch.length, 0);
  assert.equal(app.calls.apply.length, 0);
  app.unmount();
});

test("scoring loading/errors/missing data do not hide jobs or invent zero scores, and retry is explicit", async () => {
  const app = harness({ deferScores: true });
  let tree = await app.settle();
  assert.equal(cards(tree).length, 3);
  assert.ok(cards(tree).every((card) => scoreText(card).includes("Calculating match")));
  assert.ok(cards(tree).every((card) => !scoreText(card).includes("0%")));
  app.calls.batchPending[0].reject(new Error("Network failure"));
  tree = await app.settle();
  assert.ok(cards(tree).every((card) => scoreText(card).includes("Match unavailable")));
  await app.settle();
  assert.equal(app.calls.batch.length, 1);
  app.options.deferScores = false;
  expand(cards(tree)[0].props.matchIndicator).props.onClick();
  tree = await app.settle();
  assert.equal(app.calls.batch.length, 2);
  assert.ok(scoreText(cards(tree)[0]).includes("0%"));
  app.unmount();
  const malformed = harness({ invalidScores: true });
  tree = await malformed.settle();
  assert.ok(cards(tree).every((card) => scoreText(card).includes("Match unavailable")));
  malformed.unmount();
});

test("unauthorised CV or batch access keeps public jobs and stops personalised scoring", async () => {
  for (const options of [{ cvError: { response: { status: 403 } } }, { batchError: { response: { status: 401 } } }]) {
    const app = harness(options);
    const tree = await app.settle();
    assert.equal(cards(tree).length, 3);
    assert.ok(cards(tree).every((card) => scoreText(card).includes("Match unavailable")));
    const count = app.calls.batch.length;
    await app.settle();
    assert.equal(app.calls.batch.length, count);
    app.unmount();
  }
});

test("new upload refreshes all scores, ignores old CV responses and shares the new result with review", async () => {
  const app = harness({ deferScores: true });
  let tree = await app.settle();
  openReview(app, cards(tree)[0]).props.onCvUploaded({ _id: "cv-upload", originalFileName: "New CV.pdf", filePath: "/private/new.pdf" });
  tree = await app.settle();
  assert.ok(cards(tree).every((card) => !scoreText(card).includes("%")));
  assert.equal(app.calls.batch[1].body.cvId, "cv-upload");
  app.calls.batchPending[1].resolve(app.batchData(app.calls.batchPending[1].body));
  tree = await app.settle();
  assert.ok(cards(tree).every((card) => scoreText(card).includes("20%")));
  app.calls.batchPending[0].resolve(app.batchData(app.calls.batchPending[0].body));
  tree = await app.settle();
  assert.ok(cards(tree).every((card) => scoreText(card).includes("20%")));
  assert.equal((await review(app).props.loadMatch("job-0", "cv-upload")).matchScore, 20);
  assert.equal(app.calls.batch.length, 2);
  assert.ok(!JSON.stringify(review(app).props.initialCv).includes("filePath"));
  app.unmount();
});

test("card/details open Quick Apply without submission and reuse an in-flight batch preview", async () => {
  const app = harness({ deferScores: true });
  const tree = await app.settle();
  cards(tree)[0].props.onViewDetails();
  const details = named(app.render(), "JobDetailsModal");
  details.props.applyButton.props.onClick();
  assert.equal(review(app).props.job.jobId, "job-0");
  assert.equal(app.calls.apply.length, 0);
  const pending = review(app).props.loadMatch("job-0", latestCv._id);
  assert.equal(app.calls.batch.length, 1);
  app.calls.batchPending[0].resolve(app.batchData(app.calls.batchPending[0].body));
  assert.equal((await pending).matchScore, 0);
  app.unmount();
});

test("Confirm submits selected CV once, retains listing, updates status and restores it after refresh", async () => {
  const app = harness({ deferApply: true });
  const tree = await app.settle();
  const modal = openReview(app, cards(tree)[0]);
  const first = modal.props.onConfirm("cv-selected");
  await modal.props.onConfirm("cv-selected");
  assert.equal(app.calls.apply.length, 1);
  assert.equal(app.calls.apply[0].body.jobId, "job-0");
  assert.equal(app.calls.apply[0].body.cvId, "cv-selected");
  assert.equal(app.calls.apply[0].config.headers.Authorization, "Bearer test-token");
  app.calls.applyPending[0].resolve({ data: { message: "Applied", application: { status: "pending" } } });
  assert.equal(await first, true);
  const after = app.render();
  assert.equal(cards(after).length, 3);
  assert.ok(text(cards(after)[0].props.applyButton).includes("Application Submitted"));
  assert.equal(cards(after)[0].props.applyButton.props.disabled, true);
  await modal.props.onConfirm("cv-selected");
  assert.equal(app.calls.apply.length, 1);
  const refreshed = harness({ server: app.server });
  const refreshedTree = await refreshed.settle();
  assert.equal(cards(refreshedTree).length, 3);
  assert.equal(cards(refreshedTree)[0].props.applyButton.props.disabled, true);
  assert.ok(text(cards(refreshedTree)[0].props.applyButton).includes("Application Submitted"));
  app.unmount();
  refreshed.unmount();
});

test("failed application leaves job and review available for retry", async () => {
  const app = harness({ applyError: { response: { status: 500, data: { message: "Try again" } } } });
  const tree = await app.settle();
  const modal = openReview(app, cards(tree)[0]);
  assert.equal(await modal.props.onConfirm(latestCv._id), false);
  assert.equal(cards(app.render()).length, 3);
  assert.ok(review(app));
  assert.equal(review(app).props.submitting, false);
  app.options.applyError = null;
  assert.equal(await review(app).props.onConfirm(latestCv._id), true);
  assert.equal(app.calls.apply.length, 2);
  app.unmount();
});

test("newly displayed jobs request only missing scores while previous results are reused", async () => {
  const app = harness({ jobs: [makeJob(0, { title: "Alpha" }), makeJob(1, { title: "Beta" })] });
  const initial = app.render();
  all(initial).find((node) => node.props?.id === "job-search").props.onChange({ target: { value: "Alpha" } });
  let tree = await app.settle();
  assert.deepEqual(Array.from(app.calls.batch[0].body.jobIds), ["job-0"]);
  all(tree).find((node) => node.props?.id === "job-search").props.onChange({ target: { value: "" } });
  tree = await app.settle();
  assert.equal(cards(tree).length, 2);
  assert.equal(app.calls.batch.length, 2);
  assert.deepEqual(Array.from(app.calls.batch[1].body.jobIds), ["job-1"]);
  app.unmount();
});

test("standalone missing-CV upload starts scoring with the returned CV ID", async () => {
  const app = harness({ cvs: [] });
  const tree = await app.settle();
  expand(cards(tree)[0].props.matchIndicator).props.onClick();
  const modal = named(app.render(), "CVUploadModal");
  assert.equal(modal.props.uploadOnly, true);
  modal.props.onUploadSuccess({ _id: "cv-upload", originalFileName: "New CV.pdf" });
  const updated = await app.settle();
  assert.ok(cards(updated).every((card) => scoreText(card).includes("20%")));
  assert.equal(app.calls.batch[0].body.cvId, "cv-upload");
  assert.equal(named(updated, "CVUploadModal").props.isOpen, false);
  assert.equal(app.calls.get.filter(([endpoint]) => endpoint.endsWith("/my-cvs")).length, 1);
  app.unmount();
});

test("All Jobs reuses batch scoring including old listings, low scores, zero and country mismatch", async () => {
  const app = harness({ allJobs: true, jobs: [makeJob(0), makeJob(1, { createdAt: new Date(Date.now() - 30 * 86400000).toISOString() })] });
  const tree = await app.settle();
  assert.equal(cards(tree).length, 2, "All Jobs must not adopt Latest Jobs' 14-day rule");
  assert.ok(scoreText(cards(tree)[0]).includes("0%"));
  assert.ok(scoreText(cards(tree)[1]).includes("40%"));
  assert.equal(app.calls.get.filter(([endpoint]) => endpoint.endsWith("/my-cvs")).length, 1);
  expand(cards(tree)[0].props.matchIndicator).props.onClick();
  const breakdown = named(app.render(), "MatchScoreModal");
  assert.equal(breakdown.props.data.matchScore, 0);
  assert.equal(breakdown.props.data.locationMatch, false);
  assert.deepEqual(Array.from(breakdown.props.data.missingSkills), ["SQL"]);
  app.unmount();
});

test("All Jobs preserves search, location, salary and work-mode filters without resending cached scores", async () => {
  const app = harness({ allJobs: true, jobs: [makeJob(0, { title: "Alpha" }), makeJob(1, { title: "Beta", workMode: "Office", salary: "£50,000", location: "Paris, France" })] });
  let tree = await app.settle();
  const keyword = all(tree).find((node) => node.type === "input" && node.props.type === "text");
  keyword.props.onChange({ target: { value: "Beta" } });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Beta"]);
  all(tree).find((node) => node.type === "input" && node.props.type === "text").props.onChange({ target: { value: "" } });
  tree = await app.settle();
  const selects = all(tree).filter((node) => node.type === "select");
  const salary = selects.find((node) => typeof node.props.value === "number");
  salary.props.onChange({ target: { value: "40000" } });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Beta"]);
  all(tree).find((node) => node.type === "select" && typeof node.props.value === "number").props.onChange({ target: { value: "0" } });
  tree = await app.settle();
  all(tree).find((node) => node.type === "select" && typeof node.props.value === "string").props.onChange({ target: { value: "Remote" } });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Alpha"]);
  all(tree).find((node) => node.type === "select" && typeof node.props.value === "string").props.onChange({ target: { value: "" } });
  tree = await app.settle();
  named(tree, "LocationAutocomplete").props.onChange({ displayName: "Paris" });
  tree = await app.settle();
  assert.deepEqual(cards(tree).map((card) => card.props.job.title), ["Beta"]);
  assert.equal(app.calls.batch.length, 1);
  app.unmount();
});

test("All Jobs keeps 101 cards with batches of at most 50, and score failures do not hide them", async () => {
  const app = harness({ allJobs: true, jobs: Array.from({ length: 101 }, (_, index) => makeJob(index)) });
  const tree = await app.settle();
  assert.equal(cards(tree).length, 101);
  assert.deepEqual(app.calls.batch.map(({ body }) => body.jobIds.length), [50, 50, 1]);
  app.unmount();
  const failed = harness({ allJobs: true, batchError: new Error("Scoring failed") });
  assert.equal(cards(await failed.settle()).length, 3);
  assert.ok(cards(failed.render()).every((card) => scoreText(card).includes("Match unavailable")));
  failed.unmount();
});

test("All Jobs guest browse never requests personalised data; no-CV candidate gets the existing uploader", async () => {
  const guest = harness({ allJobs: true, guest: true });
  const guestTree = await guest.settle();
  assert.equal(cards(guestTree).length, 3);
  assert.equal(guest.calls.get.length, 1);
  assert.equal(guest.calls.batch.length, 0);
  cards(guestTree)[0].props.applyButton.props.onClick();
  assert.deepEqual(guest.calls.routes, ["/signup"]);
  guest.unmount();
  const missing = harness({ allJobs: true, cvs: [] });
  const tree = await missing.settle();
  assert.ok(scoreText(cards(tree)[0]).includes("Upload CV to see your match"));
  expand(cards(tree)[0].props.matchIndicator).props.onClick();
  const uploader = named(missing.render(), "CVUploadModal");
  assert.equal(uploader.props.isOpen, true);
  uploader.props.onUploadSuccess({ _id: "cv-upload", originalFileName: "New CV.pdf" });
  const updated = await missing.settle();
  assert.ok(cards(updated).every((card) => scoreText(card).includes("20%")));
  assert.equal(missing.calls.apply.length, 0);
  missing.unmount();
});

test("All Jobs details apply opens review; only confirmation submits selected CV and repeat clicks are guarded", async () => {
  const app = harness({ allJobs: true, deferApply: true });
  const tree = await app.settle();
  cards(tree)[0].props.onViewDetails();
  named(app.render(), "JobDetailsModal").props.applyButton.props.onClick();
  const modal = review(app);
  assert.ok(modal);
  assert.equal(app.calls.apply.length, 0);
  assert.equal((await modal.props.loadMatch("job-0", latestCv._id)).matchScore, 0);
  const pending = modal.props.onConfirm("cv-selected");
  await modal.props.onConfirm("cv-selected");
  assert.equal(app.calls.apply.length, 1);
  assert.equal(app.calls.apply[0].body.cvId, "cv-selected");
  app.calls.applyPending[0].resolve({ data: { application: { status: "pending" } } });
  assert.equal(await pending, true);
  assert.equal(cards(app.render()).length, 3);
  assert.equal(cards(app.render())[0].props.applyButton.props.disabled, true);
  assert.ok(text(cards(app.render())[0].props.applyButton).includes("Application Submitted"));
  const refreshed = harness({ allJobs: true, server: app.server });
  assert.equal(cards(await refreshed.settle())[0].props.applyButton.props.disabled, true);
  app.unmount();
  refreshed.unmount();
});

test("All Jobs failed confirmation keeps review, card and retry available", async () => {
  const app = harness({ allJobs: true, applyError: { response: { status: 500 } } });
  const tree = await app.settle();
  const modal = openReview(app, cards(tree)[0]);
  assert.equal(await modal.props.onConfirm(latestCv._id), false);
  assert.equal(cards(app.render()).length, 3);
  assert.equal(review(app).props.submitting, false);
  app.options.applyError = null;
  assert.equal(await review(app).props.onConfirm(latestCv._id), true);
  app.unmount();
});

test("Latest and All Jobs pass cached card breakdowns to JD without extra requests, including a new CV", async () => {
  for (const allJobs of [false, true]) {
    const app = harness({ allJobs });
    let tree = await app.settle();
    const count = app.calls.batch.length;
    cards(tree)[0].props.onViewDetails();
    let details = named(app.render(), "JobDetailsModal");
    assert.equal(details.props.matchState.status, "ready");
    assert.equal(details.props.matchState.match.matchScore, 0);
    assert.equal(details.props.matchState.match.locationMatch, false);
    assert.deepEqual(Array.from(details.props.matchState.match.matchedSkills), ["React"]);
    assert.deepEqual(Array.from(details.props.matchState.match.missingSkills), ["SQL"]);
    assert.equal(app.calls.batch.length, count);
    details.props.applyButton.props.onClick();
    assert.ok(review(app));
    assert.equal(app.calls.apply.length, 0);
    review(app).props.onCvUploaded({ _id: "cv-upload", originalFileName: "New CV.pdf" });
    tree = await app.settle();
    review(app).props.onClose();
    cards(tree)[0].props.onViewDetails();
    details = named(app.render(), "JobDetailsModal");
    assert.equal(details.props.matchState.match.matchScore, 20);
    assert.ok(details.props.matchState.contextKey.includes("cv-upload"));
    assert.ok(scoreText(cards(app.render())[0]).includes("20%"));
    assert.equal(app.calls.batch.length, count + 1, "opening JD must not add a scoring request");
    assert.equal(cards(app.render()).length, 3, "low-score jobs must remain listed");
    app.unmount();
  }
});

test("Latest and All Jobs pass explicit guest/no-CV/loading/unavailable states to JD", async () => {
  for (const allJobs of [false, true]) {
    for (const [options, expected] of [
      [{ guest: true }, "guest"], [{ cvs: [] }, "no-cv"],
      [{ deferScores: true }, "loading"], [{ batchError: new Error("Unavailable") }, "unavailable"],
    ]) {
      const app = harness({ allJobs, ...options });
      const tree = await app.settle();
      cards(tree)[0].props.onViewDetails();
      const details = named(app.render(), "JobDetailsModal");
      assert.equal(details.props.matchState.status, expected);
      assert.equal(details.props.matchState.match, undefined);
      if (expected === "no-cv") {
        details.props.onUploadCv();
        assert.equal(named(app.render(), "CVUploadModal").props.isOpen, true);
      }
      if (expected === "guest") assert.equal(app.calls.batch.length, 0);
      app.unmount();
    }
  }
});
