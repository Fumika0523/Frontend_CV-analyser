const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { renderToString } = require("react-dom/server");
const { transform } = require("sucrase");

function load(file, dependencies, globals = {}) {
  const source = readFileSync(path.join(__dirname, "..", file), "utf8");
  const exports = {};
  vm.runInNewContext(transform(source, { transforms: ["jsx", "imports"] }).code, {
    exports, AbortController, React, ...globals,
    require: (name) => {
      if (name.endsWith(".css")) return {};
      assert.ok(name in dependencies, name);
      return dependencies[name];
    },
  });
  return exports;
}

const signIn = "/?auth=signin";
const jobs = Array.from({ length: 5 }, (_, index) => ({ jobId: index }));

function harness({ token, guestId, allowGuest = true } = {}) {
  const storage = new Map();
  if (token) storage.set("token", token);
  if (guestId) storage.set("guest_session_id", guestId);
  const redirects = [];
  const requests = [];
  const router = { replace: (destination) => redirects.push(destination) };
  let get = () => { throw new Error("Unexpected request"); };
  let session;
  let renderIndex = 0;
  let effect;
  let refresh;
  let expiry;
  const hooks = {
    ...React,
    useState: (initial) => renderIndex++ === 0
      ? [session ?? initial, (value) => { session = value; }]
      : [0, () => {}],
    useRef: () => ({}),
    useEffect: (fn) => { effect = fn; },
    useCallback: (fn) => fn,
  };
  const dependencies = {
    react: hooks,
    "next/router": { useRouter: () => router },
    axios: { get: (...args) => { requests.push(args); return get(...args); } },
    "../../utils/constant": { url: "http://test.invalid" },
  };
  const guard = load("components/Auth/CandidateRouteGuard.jsx", dependencies, {
    localStorage: {
      getItem: (key) => storage.get(key),
      removeItem: (key) => storage.delete(key),
    },
    window: { addEventListener() {}, removeEventListener() {} },
    setTimeout: (callback) => { expiry = callback; },
    clearTimeout() {},
  }).default;
  const render = () => {
    renderIndex = 0;
    return guard({
      allowGuest,
      children: (verified, refreshSession) => {
        refresh = refreshSession;
        return verified;
      },
    });
  };
  return { render, mount: () => effect(), redirects, requests, storage,
    respond: (handler) => { get = handler; }, refresh: () => refresh(),
    expire: () => expiry() };
}

const tick = () => new Promise((resolve) => setImmediate(resolve));
const reject = (status) => async () => { throw { response: { status } }; };

test("visitors and unverified guest IDs cannot mount candidate pages", async () => {
  for (const options of [{}, { guestId: "missing-cv" }, { guestId: "valid-cv", allowGuest: false }]) {
    const app = harness(options);
    app.respond(reject(404));
    assert.equal(app.render().type, "p");
    const cleanup = app.mount();
    await tick();
    assert.equal(app.render().type, "p");
    assert.deepEqual(app.redirects, [signIn]);
    assert.equal(app.requests.length, options.guestId === "missing-cv" ? 1 : 0);
    cleanup();
  }
});

test("guest CV is verified by the matching API and renders at most three preview jobs", async () => {
  const app = harness({ guestId: "uploaded-cv" });
  app.respond(async () => ({ data: { matchedJobs: jobs } }));
  app.render();
  const cleanup = app.mount();
  await tick();
  assert.equal(app.requests[0][0], "http://test.invalid/guest/matched-jobs");
  assert.equal(app.requests[0][1].params.guestSessionId, "uploaded-cv");
  const session = app.render();
  assert.equal(session.role, "guest");
  assert.deepEqual(session.matchedJobs, jobs.slice(0, 3));
  assert.deepEqual(app.redirects, []);
  cleanup();
});

test("candidate content stays hidden until the backend confirms the role", async () => {
  const app = harness({ token: "stored-token", allowGuest: false });
  let resolve;
  app.respond(() => new Promise((done) => { resolve = done; }));
  assert.equal(app.render().props.children, "Checking authentication...");
  const cleanup = app.mount();
  assert.equal(app.render().type, "p");
  assert.equal(app.requests[0][0], "http://test.invalid/auth/session");
  assert.equal(app.requests[0][1].headers.Authorization, "Bearer stored-token");
  resolve({ data: { user: { role: "candidate" } } });
  await tick();
  assert.equal(app.render().role, "candidate");
  app.refresh();
  assert.equal(app.render().type, "p");
  cleanup();
});

test("company and expired sessions are redirected even if a guest CV ID is present", async () => {
  for (const [get, destination] of [
    [async () => ({ data: { user: { role: "company" } } }), "/company/dashboard"],
    [reject(401), signIn],
  ]) {
    const app = harness({ token: "stored-token", guestId: "uploaded-cv" });
    app.respond(get);
    app.render();
    const cleanup = app.mount();
    await tick();
    assert.equal(app.render().type, "p");
    assert.deepEqual(app.redirects, [destination]);
    assert.equal(app.requests.length, 1);
    assert.equal(app.storage.has("token"), destination !== signIn);
    cleanup();
  }
});

test("a mounted candidate dashboard hides content and rechecks the session at expiry", async () => {
  const app = harness({ token: "stored-token" });
  app.respond(async () => ({ data: { user: { role: "candidate" }, expiresAt: Date.now() + 30000 } }));
  app.render();
  const cleanup = app.mount();
  await tick();
  assert.equal(app.render().role, "candidate");
  app.expire();
  assert.equal(app.render().type, "p");
  cleanup();
  app.respond(reject(401));
  const cleanupAfterExpiry = app.mount();
  await tick();
  assert.deepEqual(app.redirects, [signIn]);
  assert.equal(app.storage.has("token"), false);
  cleanupAfterExpiry();
});

test("Next guards direct candidate URLs and exposes the guest exception only on the dashboard", () => {
  const router = { pathname: "/", asPath: "/" };
  function Page() { return React.createElement("div", null, "Page content"); }
  const guard = load("components/Auth/CandidateRouteGuard.jsx", {
    react: React, axios: {}, "next/router": { useRouter: () => router },
    "../../utils/constant": { url: "http://test.invalid" },
  }).default;
  const App = load("pages/_app.js", {
    "react-toastify": { ToastContainer: () => null },
    "next/router": { useRouter: () => router },
    "../components/Auth/CandidateRouteGuard": guard,
  }).default;

  for (const pathname of [
    "/candidate", "/candidate/dashboard", "/candidate/Dashboard/LatestJobs",
    "/candidate/Dashboard/ApplyJobs", "/candidate/Dashboard/CVUpload",
    "/candidate/Dashboard/MatchingJobs", "/candidate/Dashboard/AppliedJobs",
    "/candidate/Dashboard/MyApplication/MyApplication",
    "/candidate/Dashboard/MyApplication/MyApplicationPage",
    "/candidate/viewMyCVs", "/candidate/skills",
  ]) {
    Object.assign(router, { pathname, asPath: pathname });
    const page = App({ Component: Page, pageProps: {} }).props.children[0];
    assert.equal(page.type, guard, pathname);
    assert.equal(page.props.allowGuest, pathname === "/candidate/dashboard", pathname);
    assert.doesNotMatch(renderToString(page), /Page content/);
  }
  Object.assign(router, { pathname: "/", asPath: "/" });
  assert.match(renderToString(React.createElement(App, { Component: Page })), /Page content/);
});

test("the dashboard renders only matching preview content for a verified guest", () => {
  const Dashboard = load("pages/candidate/dashboard.js", {
    react: React,
    "../../components/Layout/Layout": ({ children }) => children,
    "./Dashboard/MatchingJobs": ({ isGuest, guestMatches }) => isGuest ? `Guest matches ${guestMatches.length}` : "Candidate matches",
    "./Dashboard/ApplyJobs": () => "All jobs",
    "./Dashboard/MyApplication/MyApplication": () => "My applications",
  }).default;
  const render = (candidateSession) => renderToString(React.createElement(Dashboard, { candidateSession }));
  const guest = render({ role: "guest", matchedJobs: jobs.slice(0, 3) });
  assert.match(guest, /Guest matches 3/);
  assert.doesNotMatch(guest, /Candidate matches|All jobs|My applications/);
  const candidate = render({ role: "candidate" });
  assert.match(candidate, /Candidate matches/);
  assert.match(candidate, /All jobs/);
  assert.match(candidate, /My applications/);
});
