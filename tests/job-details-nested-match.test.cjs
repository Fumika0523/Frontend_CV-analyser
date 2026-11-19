const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { transform } = require("sucrase");

const job = {
  _id: "job-a", jobId: "job-a", title: "Software Engineer", companyName: "Example Company",
  companyUrl: "https://example.com", location: { city: "London", country: "United Kingdom" },
  salary: "Competitive", jobType: "Full-time", workMode: "Remote", experience: "2+ years",
  applicationEndDate: "2099-12-31", roleSummary: "Build useful software.",
  keySkills: ["React", "SQL"], requirements: ["Communicate clearly"], responsibilities: ["Build and test"],
};
const match = {
  matchScore: 0, matchedSkills: ["React"], missingSkills: ["SQL"], locationMatch: false,
};

test("guest job details keep the genuine score and role facts and open the registration invitation", () => {
  let signups = 0;
  const app = harness({
    guestPreview: true,
    job: { ...job, matchScore: 67, roleSummary: "Contact the employer at hiring@example.com" },
    matchState: { status: "guest" },
    onGuestSignup: () => { signups += 1; },
  });
  app.render();
  assert.match(app.text(), /Software Engineer.*67%.*Competitive.*React/s);
  assert.doesNotMatch(app.text(), /Example Company|Company website|Contact the employer|Build and test/);
  assert.equal(app.entries().some(({ element }) => element?.props?.href), false);
  app.click(app.breakdownTrigger());
  assert.match(app.text(), /Unlock Your Full Match Analysis/);
  assert.match(app.text(), /Create a free account to see your matching and missing skills, unlock employer details and apply for jobs\./);
  assert.doesNotMatch(app.text(), /Matching Skills|Missing Skills/);
  app.click(app.button("Maybe Later"));
  assert.equal(app.breakdown(), undefined);
  app.click(app.breakdownTrigger());
  app.click(app.button("Sign Up — Free"));
  assert.equal(signups, 1);
  app.unmount();
});

// An isolated hook/DOM harness executes both real modal components, including
// their document listeners and refs. It does not make API or browser requests.
function harness(initial = {}) {
  const listeners = [];
  const instances = new Map();
  const nodes = new Map();
  const modules = new Map();
  let current;
  let queuedEffects = [];
  let dirty = false;
  let tree;
  const calls = { close: 0, upload: 0, retry: 0, apply: 0 };
  const document = {
    body: { style: { overflow: "auto" } },
    activeElement: null,
    addEventListener(type, fn, options) {
      listeners.push({ type, fn, capture: options === true || Boolean(options?.capture) });
    },
    removeEventListener(type, fn, options) {
      const capture = options === true || Boolean(options?.capture);
      const index = listeners.findIndex((entry) => entry.type === type && entry.fn === fn && entry.capture === capture);
      if (index !== -1) listeners.splice(index, 1);
    },
    contains(node) { return Boolean(node?.isConnected); },
  };
  const outsideTrigger = { isConnected: true, focus() { document.activeElement = this; } };
  outsideTrigger.focus();
  const hooks = {
    ...React,
    useState(initialValue) {
      const owner = current;
      const index = owner.cursor++;
      if (!(index in owner.slots)) owner.slots[index] = typeof initialValue === "function" ? initialValue() : initialValue;
      return [owner.slots[index], (value) => {
        const next = typeof value === "function" ? value(owner.slots[index]) : value;
        if (!Object.is(next, owner.slots[index])) { owner.slots[index] = next; dirty = true; }
      }];
    },
    useRef(initialValue) {
      const index = current.cursor++;
      return current.slots[index] ||= { current: initialValue };
    },
    useEffect(effect, deps) {
      const owner = current;
      const index = owner.cursor++;
      const old = owner.slots[index];
      if (!old || !deps || deps.some((value, i) => !Object.is(value, old.deps?.[i]))) {
        queuedEffects.push(() => {
          old?.cleanup?.();
          owner.slots[index] = { deps, cleanup: effect() };
        });
      }
    },
    useCallback(fn) { return fn; },
  };
  hooks.useLayoutEffect = hooks.useEffect;
  function load(file) {
    const absolute = path.resolve(__dirname, "..", file);
    if (modules.has(absolute)) return modules.get(absolute);
    const exports = {};
    modules.set(absolute, exports);
    vm.runInNewContext(transform(fs.readFileSync(absolute, "utf8"), { transforms: ["jsx", "imports"] }).code, {
      exports, document, URL, setTimeout: (fn) => { fn(); return 1; }, clearTimeout() {},
      window: { requestAnimationFrame: (fn) => { fn(); return 1; }, cancelAnimationFrame() {} },
      require(name) {
        if (name === "react") return hooks;
        if (name.startsWith("react-icons/")) return require(name);
        if (name.startsWith(".")) {
          let target = path.resolve(path.dirname(absolute), name);
          if (!path.extname(target)) target += fs.existsSync(`${target}.jsx`) ? ".jsx" : ".js";
          return load(path.relative(path.resolve(__dirname, ".."), target));
        }
        throw new Error(`Unexpected modal dependency: ${name}`);
      },
    });
    return exports;
  }
  const Component = load("components/Jobs/JobDetailsModal.jsx").default;
  const props = {
    job, matchState: { status: "ready", match, contextKey: "cv-a:job-a" },
    onClose: () => calls.close++, onUploadCv: () => calls.upload++, onRetryMatch: () => calls.retry++,
    applyButton: React.createElement("button", { onClick: () => calls.apply++ }, "Quick Apply"),
    ...initial,
  };
  function flattened(root) {
    if (!root) return [];
    return [root, ...(root.children || []).flatMap(flattened)];
  }
  function elementText(root) {
    if (!root) return "";
    if (typeof root.value === "string" || typeof root.value === "number") return String(root.value);
    return (root.children || []).map(elementText).filter(Boolean).join(" ");
  }
  function makeDom(element, key, parent) {
    let node = nodes.get(key);
    if (!node) {
      node = {
        isConnected: true, style: {}, attributes: {},
        focus() { document.activeElement = this; },
        contains(target) { for (let value = target; value; value = value.parentElement) if (value === this) return true; return false; },
        getAttribute(name) { return this.attributes[name] ?? this.props?.[name] ?? null; },
        setAttribute(name, value) { this.attributes[name] = value; },
        removeAttribute(name) { delete this.attributes[name]; },
        getClientRects() { return [{}]; },
        querySelectorAll() {
          return flattened(this.wrapper).filter((entry) => entry.dom && entry.dom !== this &&
            ["button", "a", "input", "select", "textarea"].includes(entry.element?.type) &&
            !entry.element.props.disabled && entry.element.props.tabIndex !== -1).map((entry) => entry.dom);
        },
        querySelector() { return this.querySelectorAll()[0] || null; },
      };
      nodes.set(key, node);
    }
    node.isConnected = true;
    node.ownerDocument = document;
    node.parentElement = parent;
    node.tagName = String(element.type).toUpperCase();
    node.props = element.props;
    node.disabled = Boolean(element.props.disabled);
    node.tabIndex = element.props.tabIndex ?? (["button", "a", "input", "select", "textarea"].includes(element.type) ? 0 : -1);
    if (element.ref && typeof element.ref === "object") element.ref.current = node;
    return node;
  }
  function build(value, key, parent) {
    if (value === null || value === undefined || typeof value === "boolean") return null;
    if (typeof value === "string" || typeof value === "number") return { value, children: [] };
    if (typeof value.type === "function" && ["JobDetailsModal", "MatchScoreModal", "MatchScoreRing", "Fact", "BulletSection"].includes(value.type.name)) {
      let instance = instances.get(key);
      if (!instance) { instance = { slots: [], cursor: 0 }; instances.set(key, instance); }
      instance.seen = true;
      instance.cursor = 0;
      const previous = current;
      current = instance;
      const output = value.type(value.props);
      current = previous;
      return { element: value, children: [build(output, `${key}/component`, parent)] };
    }
    const dom = typeof value.type === "string" ? makeDom(value, key, parent) : null;
    const wrapper = { element: value, dom, children: React.Children.toArray(value.props?.children).map((child, index) => build(child, `${key}/${index}`, dom || parent)) };
    if (dom) dom.wrapper = wrapper;
    return wrapper;
  }
  function render() {
    for (let attempt = 0; attempt < 8; attempt++) {
      dirty = false;
      queuedEffects = [];
      nodes.forEach((node) => { node.isConnected = false; });
      instances.forEach((instance) => { instance.seen = false; });
      tree = build(React.createElement(Component, props), "root", null);
      for (const [key, instance] of instances) if (!instance.seen) {
        instance.slots.forEach((slot) => slot?.cleanup?.());
        instances.delete(key);
      }
      queuedEffects.forEach((effect) => effect());
      if (!dirty) break;
    }
    return tree;
  }
  function click(wrapper) {
    wrapper.dom?.focus();
    wrapper.element.props.onClick?.({ currentTarget: wrapper.dom, target: wrapper.dom, preventDefault() {}, stopPropagation() {} });
    return render();
  }
  return {
    calls, props, document, outsideTrigger, render, click,
    entries: () => flattened(tree),
    text: () => elementText(tree),
    button(label) { return flattened(tree).find((entry) => entry.element?.type === "button" &&
      (entry.element.props["aria-label"] === label || elementText(entry) === label)); },
    breakdownTrigger() { return flattened(tree).find((entry) => entry.element?.type === "button" &&
      (entry.element.props["aria-label"] === "View match breakdown" || elementText(entry) === "View match breakdown")); },
    breakdown() { return flattened(tree).find((entry) => entry.element?.type?.name === "MatchScoreModal"); },
    jdOverlay() { return flattened(tree).find((entry) => entry.element?.props?.["aria-labelledby"] === "job-details-title"); },
    key(key, shiftKey = false) {
      const event = { key, shiftKey, target: document.activeElement, defaultPrevented: false, immediateStopped: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; },
        stopImmediatePropagation() { this.immediateStopped = true; this.propagationStopped = true; } };
      const ordered = [...listeners.filter((entry) => entry.capture), ...listeners.filter((entry) => !entry.capture)];
      for (const entry of ordered) {
        if (event.immediateStopped || (event.propagationStopped && !entry.capture)) break;
        if (entry.type === "keydown") entry.fn(event);
      }
      render();
      return event;
    },
    unmount() {
      [...instances.values()].reverse().forEach((instance) => instance.slots.forEach((slot) => slot?.cleanup?.()));
      instances.clear();
      nodes.forEach((node) => { node.isConnected = false; });
    },
  };
}

test("Job Details uses passed zero/low scores and preserves full JD content and external apply action", () => {
  for (const value of [0, 20, 85]) {
    const app = harness({ matchState: { status: "ready", match: { ...match, matchScore: value }, contextKey: "cv-a:job-a" } });
    app.render();
    assert.ok(app.breakdownTrigger());
    assert.ok(app.text().replaceAll(" ", "").includes(`${value}%`));
    for (const content of ["Software Engineer", "Example Company", "Competitive", "Remote", "Minimum relevant experience", "2+ years", "Build useful software.", "Communicate clearly", "Build and test", "Apply by"]) assert.ok(app.text().includes(content), content);
    assert.equal(app.calls.apply, 0);
    app.click(app.button("Quick Apply"));
    assert.equal(app.calls.apply, 1);
    app.unmount();
  }
});

test("breakdown receives existing match data and renders above the underlying Job Details dialog", () => {
  const app = harness();
  app.render();
  app.click(app.breakdownTrigger());
  const nested = app.breakdown();
  assert.ok(nested);
  assert.equal(nested.element.props.nested, true);
  assert.equal(nested.element.props.data.matchScore, 0);
  assert.deepEqual(Array.from(nested.element.props.data.matchedSkills), ["React"]);
  assert.deepEqual(Array.from(nested.element.props.data.missingSkills), ["SQL"]);
  assert.equal(nested.element.props.data.locationMatch, false);
  const top = app.entries().find((entry) => entry.element?.props?.role === "dialog" && entry !== app.jdOverlay());
  assert.ok(top);
  assert.ok(/z-\[70\]|z-\[60\]|z-\[80\]/.test(top.element.props.className));
  assert.equal(app.calls.close, 0);
  app.unmount();
});

test("one Escape closes only the nested breakdown, restores trigger focus, and keeps body locked", () => {
  const app = harness();
  app.render();
  const trigger = app.breakdownTrigger();
  app.click(trigger);
  assert.equal(app.document.activeElement, app.button("Close match details").dom);
  assert.equal(app.document.body.style.overflow, "hidden");
  app.key("Escape");
  assert.equal(app.breakdown(), undefined);
  assert.equal(app.calls.close, 0);
  assert.equal(app.document.activeElement, app.breakdownTrigger().dom);
  assert.equal(app.document.body.style.overflow, "hidden");
  app.key("Escape");
  assert.equal(app.calls.close, 1);
  app.unmount();
  assert.equal(app.document.body.style.overflow, "auto");
});

test("nested close button and backdrop do not close Job Details or release its scroll lock", () => {
  for (const viaBackdrop of [false, true]) {
    const app = harness();
    app.render();
    app.click(app.breakdownTrigger());
    if (viaBackdrop) {
      const overlay = app.entries().find((entry) => entry.element?.props?.role === "dialog" && entry !== app.jdOverlay());
      const handler = overlay.element.props.onMouseDown || overlay.element.props.onClick;
      assert.equal(typeof handler, "function");
      handler({ currentTarget: overlay.dom, target: overlay.dom, stopPropagation() {} });
      app.render();
    } else app.click(app.button("Close"));
    assert.equal(app.breakdown(), undefined);
    assert.equal(app.calls.close, 0);
    assert.equal(app.document.body.style.overflow, "hidden");
    assert.equal(app.document.activeElement, app.breakdownTrigger().dom);
    app.unmount();
    assert.equal(app.document.body.style.overflow, "auto");
  }
});

test("Tab and Shift+Tab remain in the top nested dialog", () => {
  const app = harness();
  app.render();
  app.click(app.breakdownTrigger());
  const overlay = app.entries().find((entry) => entry.element?.props?.role === "dialog" && entry !== app.jdOverlay());
  const focusable = overlay.dom.querySelectorAll("button,a");
  assert.ok(focusable.length >= 2);
  focusable.at(-1).focus();
  app.key("Tab");
  assert.equal(app.document.activeElement, focusable[0]);
  focusable[0].focus();
  app.key("Tab", true);
  assert.equal(app.document.activeElement, focusable.at(-1));
  assert.equal(app.calls.close, 0);
  app.unmount();
});

test("underlying JD backdrop is paused and panel is hidden/inert while breakdown is open", () => {
  const app = harness();
  app.render();
  app.click(app.breakdownTrigger());
  const jd = app.jdOverlay();
  jd.element.props.onMouseDown({ currentTarget: jd.dom, target: jd.dom });
  assert.equal(app.calls.close, 0);
  assert.ok(app.breakdown());
  assert.ok(app.entries().some((entry) => entry.element?.props?.["aria-hidden"] === "true" && entry.element.props.inert !== undefined));
  app.click(app.button("Close match details"));
  assert.equal(app.breakdown(), undefined);
  assert.equal(app.calls.close, 0);
  assert.ok(!app.entries().some((entry) => entry.element?.props?.inert !== undefined));
  app.unmount();
});

test("guest/no-CV/loading/unavailable states never display a fabricated zero score", () => {
  for (const status of ["guest", "no-cv", "loading", "unavailable"]) {
    const app = harness({ matchState: { status, contextKey: "cv-a:job-a" } });
    app.render();
    assert.equal(app.breakdownTrigger(), undefined, status);
    assert.ok(!app.text().includes("0%"), status);
    assert.equal(app.entries().some((entry) => entry.element?.props?.role === "progressbar"), false, status);
    if (status === "no-cv") {
      const upload = app.button("Upload a CV to see your match");
      assert.ok(upload);
      app.click(upload);
      assert.equal(app.calls.upload, 1);
    }
    if (status === "loading") {
      assert.ok(/calculating|loading/i.test(app.text()));
      assert.ok(app.entries().some((entry) => entry.element?.props?.role === "status"));
    }
    if (status === "unavailable") {
      assert.ok(app.text().includes("Match score unavailable"));
      app.click(app.button("Retry"));
      assert.equal(app.calls.retry, 1);
    }
    assert.ok(app.button("Quick Apply"));
    app.unmount();
  }
});

test("a changed CV/job score context closes stale breakdown and displays the current score", () => {
  const app = harness();
  app.render();
  app.click(app.breakdownTrigger());
  app.props.matchState = { status: "ready", contextKey: "cv-b:job-a", match: { ...match, matchScore: 20 } };
  app.render();
  assert.equal(app.breakdown(), undefined);
  assert.ok(app.breakdownTrigger());
  assert.ok(/\b20\s*%/.test(app.text()));
  assert.equal(app.calls.close, 0);
  app.unmount();
});

test("premium match labels use presentation boundaries without changing the passed score or breakdown", () => {
  for (const [value, strength] of [[0, "Lower match"], [59, "Lower match"], [60, "Good match"], [79, "Good match"], [80, "Strong match"], [100, "Strong match"]]) {
    const app = harness({ matchState: { status: "ready", match: { ...match, matchScore: value }, contextKey: `cv-a:job-a:${value}` } });
    app.render();
    assert.ok(app.text().includes("YOUR CV MATCH"));
    assert.ok(app.text().includes("Based on your current CV"));
    assert.ok(app.text().includes(strength), `${value}: ${strength}`);
    assert.ok(app.text().replaceAll(" ", "").includes(`${value}%`));
    const progress = app.entries().find((entry) => entry.element?.props?.role === "progressbar");
    assert.ok(progress);
    assert.equal(progress.element.props["aria-valuenow"], value);
    assert.equal(progress.element.props["aria-valuemin"], 0);
    assert.equal(progress.element.props["aria-valuemax"], 100);
    assert.ok(app.entries().some((entry) => entry.element?.props?.style?.width === `${value}%`));
    app.click(app.breakdownTrigger());
    assert.equal(app.breakdown().element.props.data.matchScore, value);
    assert.equal(app.breakdown().element.props.data.locationMatch, match.locationMatch);
    assert.deepEqual(Array.from(app.breakdown().element.props.data.matchedSkills), match.matchedSkills);
    app.unmount();
  }
});

test("absent, non-numeric and out-of-range scores remain unavailable rather than being clamped or fabricated", () => {
  for (const value of [undefined, null, NaN, Infinity, -1, 101, "85"]) {
    const app = harness({ matchState: { status: "ready", match: { ...match, matchScore: value }, contextKey: "cv-a:job-a" } });
    app.render();
    assert.ok(app.text().includes("Match score unavailable"));
    assert.equal(app.breakdownTrigger(), undefined);
    assert.equal(app.entries().some((entry) => entry.element?.props?.role === "progressbar"), false);
    assert.ok(!app.text().includes("0%"));
    app.unmount();
  }
});
