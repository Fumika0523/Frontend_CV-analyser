const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { transform } = require("sucrase");
const displayNames = {};
vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "../utils/cvDisplayName.js"), "utf8"), {
  transforms: ["imports"],
}).code, { exports: displayNames });
const tick = () => new Promise((resolve) => setImmediate(resolve));
function all(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(all)];
}
function text(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return node && typeof node === "object" ? React.Children.toArray(node.props?.children).map(text).filter(Boolean).join(" ") : "";
}
const button = (tree, label) => all(tree).find((node) => node.type === "button" && (text(node) === label || node.props["aria-label"] === label));
const latest = { _id: "cv-new", version: 2, originalFileName: "latest.pdf", fileName: "17_v2.pdf", filePath: "/uploads/private.pdf" };
const job = { jobId: "job-a", title: "Engineer", companyName: "Example", companyUrl: "https://example.com" };

function harness({ cvs = [latest], failList, failScore, failFile, token = "test-token", deferScore = false,
  deferFile = false, blockedPopup = false, failNavigation = false, previewScore } = {}) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let props;
  const calls = { get: [], post: [], confirm: [], pending: [], revoke: [], download: [],
    opened: [], tabs: [], blobs: [], events: [], filePending: [], closedModal: 0 };
  const intervals = new Map();
  const listeners = new Map();
  const dom = {
    activeElement: null,
    body: { style: {}, appendChild() {} },
    addEventListener: (type, fn) => listeners.set(type, fn),
    removeEventListener: (type, fn) => { if (listeners.get(type) === fn) listeners.delete(type); },
    createElement: () => ({ click() { calls.download.push(this.download); }, remove() {} }),
  };
  let nextInterval = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], (value) => { slots[i] = typeof value === "function" ? value(slots[i]) : value; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ||= { current: initial }; },
    useEffect(fn, deps) {
      const i = cursor++;
      const old = slots[i];
      if (!old || deps.some((value, index) => !Object.is(value, old.deps[index]))) {
        effects.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
      }
    },
  };
  const exports = {};
  class TestURL extends URL {
    static createObjectURL(blob) { calls.blobs.push(blob); return `blob:protected-cv-${calls.blobs.length}`; }
    static revokeObjectURL(value) { calls.revoke.push(value); }
  }
  const axios = {
    get: async (...args) => {
      calls.get.push(args);
      if (args[0].endsWith("/my-cvs")) { if (failList) throw failList; return { data: cvs }; }
      calls.events.push("file-request");
      if (failFile) throw failFile;
      if (deferFile) return new Promise((resolve, reject) => calls.filePending.push({ resolve, reject }));
      return { data: new Blob(["%PDF-test"]) };
    },
    post: (...args) => {
      calls.post.push(args);
      if (failScore) return Promise.reject(failScore);
      if (deferScore) return new Promise((resolve, reject) => calls.pending.push({ resolve, reject }));
      return Promise.resolve({ data: { matchScore: previewScore ?? (args[1].cvId === "cv-upload" ? 20 : 85) } });
    },
  };
  vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "../components/Jobs/QuickApplyModal.jsx"), "utf8"), {
    transforms: ["jsx", "imports"],
  }).code, {
    exports, URL: TestURL, Blob, setTimeout: (fn) => fn(),
    setInterval: (fn) => { const id = ++nextInterval; intervals.set(id, fn); return id; },
    clearInterval: (id) => intervals.delete(id),
    window: { open: (...args) => {
      calls.events.push("open-tab");
      calls.opened.push(args);
      if (blockedPopup) return null;
      const tab = {
        closed: false, opener: "original-tab", document: { title: "", body: { textContent: "" } },
        close() { this.closed = true; },
        location: { replace(value) {
          if (failNavigation) throw new Error("Unable to load preview tab");
          this.href = value;
        } },
      };
      calls.tabs.push(tab);
      return tab;
    } },
    localStorage: { getItem: () => token },
    document: dom,
    require(name) {
      if (name === "react") return hooks;
      if (name === "axios") return axios;
      if (name === "react-icons/fi") return require(name);
      if (name.endsWith("/utils/constant")) return { url: "http://test.invalid" };
      if (name.endsWith("/utils/cvDisplayName")) return displayNames;
      if (name === "./CVUploadModal") return function CVUploadModal() { return null; };
      throw new Error(name);
    },
  });
  props = { job, submitting: false, onClose() { calls.closedModal++; }, onConfirm: async (cvId) => { calls.confirm.push(cvId); return true; } };
  return {
    calls, exports, props, dom,
    render() { cursor = 0; effects = []; const tree = exports.default(props); effects.forEach((effect) => effect()); return tree; },
    async settle() { let tree; for (let i = 0; i < 4; i++) { tree = this.render(); await tick(); } return this.render(); },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
    pollPreviews() { [...intervals.values()].forEach((fn) => fn()); },
    get watchers() { return intervals.size; },
    pressEscape() { listeners.get("keydown")?.({ key: "Escape" }); },
  };
}
const upload = (tree) => all(tree).find((node) => node.type?.name === "CVUploadModal");

test("review loads latest CV and backend score; company link and exactly three CV actions are secure", async () => {
  const app = harness({ cvs: [latest, { _id: "older" }] });
  const tree = await app.settle();
  assert.ok(text(tree).includes("latest.pdf"));
  assert.ok(text(tree).includes("85%"));
  assert.equal(app.calls.get[0][1].headers.Authorization, "Bearer test-token");
  assert.equal(app.calls.post[0][0], "http://test.invalid/applications/preview-match");
  assert.equal(app.calls.post[0][1].cvId, latest._id);
  assert.equal(app.calls.confirm.length, 0);
  const link = all(tree).find((node) => node.type === "a");
  assert.equal(link.props.href, "https://example.com/");
  assert.equal(link.props.rel, "noopener noreferrer");
  assert.equal(link.props.target, "_blank");
  button(tree, "CV actions").props.onClick();
  assert.deepEqual(all(app.render()).filter((node) => node.props?.role === "menuitem").map(text), ["Preview CV", "Download CV", "Upload new CV"]);
  assert.ok(!JSON.stringify(tree).includes("/uploads/private.pdf"));
  for (const unsafe of ["javascript:alert(1)", "data:text/html,hello", "https://user:password@example.com"]) assert.equal(app.exports.safeCompanyUrl(unsafe), null);
  app.unmount();
});

test("original CV filename is displayed without generated storage names or paths", async () => {
  const app = harness({ cvs: [{ ...latest, originalFileName: "My résumé 2026.pdf" }] });
  const tree = await app.settle();
  assert.ok(text(tree).includes("My résumé 2026.pdf"));
  assert.ok(!text(tree).includes(latest.fileName));
  assert.ok(!text(tree).includes(latest.filePath));
  assert.equal(app.exports.cvDisplayName({ ...latest, originalFileName: "C:\\fakepath\\My CV\u0000?.pdf" }), "My CV.pdf");
  assert.equal(app.exports.cvDisplayName({ ...latest, originalFileName: "/home/private/My CV.pdf" }), "My CV.pdf");
  app.unmount();
});

test("older CVs display and download as CV Version N.pdf without internal filename fallback", async () => {
  for (const originalFileName of [undefined, "", "  ", null, "..", "/"]) {
    const app = harness({ cvs: [{ ...latest, originalFileName }] });
    let tree = await app.settle();
    assert.ok(text(tree).includes("CV Version 2.pdf"));
    assert.ok(!text(tree).includes(latest.fileName));
    assert.ok(!text(tree).includes(latest.filePath));
    button(tree, "CV actions").props.onClick();
    await button(app.render(), "Download CV").props.onClick();
    assert.deepEqual(app.calls.download, ["CV Version 2.pdf"]);
    assert.equal(app.exports.cvDisplayName({}), "CV Version 1.pdf");
    app.unmount();
  }
});

test("new upload selects its ID, invalidates prior score, keeps low score eligible and confirms once", async () => {
  const app = harness();
  let tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  button(app.render(), "Upload new CV").props.onClick();
  assert.equal(upload(app.render()).props.uploadOnly, true);
  upload(app.render()).props.onUploadSuccess({ _id: "cv-upload", originalFileName: "replacement.pdf", fileName: "17_v3.pdf" });
  assert.equal(button(app.render(), "Confirm & Apply").props.disabled, true);
  tree = await app.settle();
  assert.ok(text(tree).includes("20%"));
  assert.ok(text(tree).includes("replacement.pdf"));
  assert.ok(!text(tree).includes("17_v3.pdf"));
  assert.equal(button(tree, "Confirm & Apply").props.disabled, false);
  assert.equal(app.calls.post.at(-1)[1].cvId, "cv-upload");
  const click = button(tree, "Confirm & Apply").props.onClick;
  await Promise.all([click(), click()]);
  assert.deepEqual(app.calls.confirm, ["cv-upload"]);
  app.unmount();
});

test("stale preview response cannot overwrite the newly selected CV score", async () => {
  const app = harness({ deferScore: true });
  await app.settle();
  upload(app.render()).props.onUploadSuccess({ _id: "cv-upload", originalFileName: "replacement.pdf", fileName: "17_v3.pdf" });
  await app.settle();
  app.calls.pending[1].resolve({ data: { matchScore: 20 } });
  let tree = await app.settle();
  assert.ok(text(tree).includes("20%"));
  app.calls.pending[0].resolve({ data: { matchScore: 99 } });
  tree = await app.settle();
  assert.ok(text(tree).includes("20%"));
  assert.ok(!text(tree).includes("99%"));
  app.unmount();
});

test("preview opens PDF in new tab synchronously; download stays separate and authenticated", async () => {
  const app = harness();
  let tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  await button(app.render(), "Preview CV").props.onClick();
  tree = app.render();
  assert.deepEqual(app.calls.events, ["open-tab", "file-request"]);
  assert.deepEqual(app.calls.opened[0], ["", "_blank"]);
  assert.equal(app.calls.tabs[0].opener, null);
  assert.equal(app.calls.tabs[0].location.href, "blob:protected-cv-1");
  assert.equal(app.calls.blobs[0].type, "application/pdf");
  assert.equal(app.calls.closedModal, 0);
  assert.ok(button(tree, "Confirm & Apply"));
  assert.equal(all(tree).filter((node) => node.type === "iframe").length, 0);
  assert.equal(app.calls.revoke.length, 0);
  button(tree, "CV actions").props.onClick();
  await button(app.render(), "Download CV").props.onClick();
  assert.deepEqual(app.calls.download, ["latest.pdf"]);
  assert.equal(app.calls.opened.length, 1, "download must not open a preview tab");
  for (const [endpoint, config] of app.calls.get.slice(1)) {
    assert.equal(endpoint, "http://test.invalid/cv/cv-new/download");
    assert.equal(config.responseType, "blob");
    assert.equal(config.headers.Authorization, "Bearer test-token");
  }
  app.calls.tabs[0].close();
  app.pollPreviews();
  assert.ok(app.calls.revoke.includes("blob:protected-cv-1"));
  assert.equal(app.watchers, 0);
  app.unmount();
});

test("pending preview shows loading and guards repeat clicks before rerender", async () => {
  const app = harness({ deferFile: true });
  let tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  const click = button(app.render(), "Preview CV").props.onClick;
  const pending = click();
  await click();
  assert.equal(app.calls.opened.length, 1);
  assert.equal(app.calls.tabs[0].document.body.textContent, "Loading your CV...");
  assert.ok(text(app.render()).includes("Loading CV..."));
  assert.equal(button(app.render(), "CV actions").props.disabled, true);
  app.calls.filePending[0].resolve({ data: new Blob(["%PDF-test"]) });
  await pending;
  assert.equal(button(app.render(), "CV actions").props.disabled, false);
  app.calls.tabs[0].close();
  app.pollPreviews();
  app.unmount();
});

test("blocked popup shows actionable error without requesting the PDF", async () => {
  const app = harness({ blockedPopup: true });
  const tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  await button(app.render(), "Preview CV").props.onClick();
  assert.ok(text(app.render()).includes("Please allow popups"));
  assert.equal(app.calls.events.includes("file-request"), false);
  assert.equal(app.calls.closedModal, 0);
  assert.equal(button(app.render(), "CV actions").props.disabled, false);
  app.unmount();
});

test("failed PDF request or preview navigation closes blank tab and cleans up any URL", async () => {
  for (const options of [
    { failFile: { response: { status: 401 } } },
    { failFile: new Error("Network unavailable") },
    { failNavigation: true },
  ]) {
    const app = harness(options);
    const tree = await app.settle();
    button(tree, "CV actions").props.onClick();
    await button(app.render(), "Preview CV").props.onClick();
    assert.equal(app.calls.tabs[0].closed, true);
    assert.ok(all(app.render()).some((node) => node.props?.role === "alert"));
    assert.equal(app.calls.revoke.length, app.calls.blobs.length);
    assert.equal(app.calls.closedModal, 0);
    app.unmount();
  }
});

test("closing a pending tab or Quick Apply leaves no orphaned loading preview", async () => {
  for (const closeModal of [false, true]) {
    const app = harness({ deferFile: true });
    const tree = await app.settle();
    button(tree, "CV actions").props.onClick();
    const pending = button(app.render(), "Preview CV").props.onClick();
    if (closeModal) app.unmount();
    else app.calls.tabs[0].close();
    app.calls.filePending[0].resolve({ data: new Blob(["%PDF-test"]) });
    await pending;
    assert.equal(app.calls.tabs[0].closed, true);
    assert.equal(app.calls.blobs.length, 0);
    assert.equal(app.watchers, 0);
    if (!closeModal) app.unmount();
  }
});

test("loaded preview survives CV changes and modal unmount until preview tab closes", async () => {
  const app = harness();
  let tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  await button(app.render(), "Preview CV").props.onClick();
  upload(app.render()).props.onUploadSuccess({ _id: "cv-upload", originalFileName: "replacement.pdf" });
  tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  await button(app.render(), "Preview CV").props.onClick();
  assert.equal(app.calls.get.at(-1)[0], "http://test.invalid/cv/cv-upload/download");
  assert.equal(app.calls.tabs[1].location.href, "blob:protected-cv-2");
  app.unmount();
  app.pollPreviews();
  assert.equal(app.calls.tabs[0].closed, false);
  assert.equal(app.calls.revoke.length, 0);
  app.calls.tabs[0].close();
  app.pollPreviews();
  assert.deepEqual(app.calls.revoke, ["blob:protected-cv-1"]);
  assert.equal(app.watchers, 1);
  app.calls.tabs[1].close();
  app.pollPreviews();
  assert.deepEqual(app.calls.revoke, ["blob:protected-cv-1", "blob:protected-cv-2"]);
  assert.equal(app.watchers, 0);
});

test("missing CV, unauthorized session and score errors block confirmation", async () => {
  for (const options of [
    { cvs: [] }, { token: null }, { failList: { response: { status: 401 } } },
    { failScore: { response: { status: 403 } } }, { failScore: new Error("Score unavailable") },
  ]) {
    const app = harness(options);
    const tree = await app.settle();
    assert.equal(button(tree, "Confirm & Apply").props.disabled, true);
    await button(tree, "Confirm & Apply").props.onClick();
    assert.equal(app.calls.confirm.length, 0);
    assert.ok(all(tree).some((node) => node.props?.role === "alert"));
    app.unmount();
  }
});

test("protected CV errors show a message and failed confirmation can be retried", async () => {
  const app = harness({ failFile: { response: { status: 403 } } });
  let tree = await app.settle();
  button(tree, "CV actions").props.onClick();
  await button(app.render(), "Preview CV").props.onClick();
  assert.ok(text(app.render()).includes("Please sign in again"));
  app.props.onConfirm = async () => false;
  await button(app.render(), "Confirm & Apply").props.onClick();
  assert.ok(text(app.render()).includes("Application was not submitted"));
  app.props.onConfirm = async (id) => { app.calls.confirm.push(id); return true; };
  await button(app.render(), "Confirm & Apply").props.onClick();
  assert.deepEqual(app.calls.confirm, [latest._id]);
  app.unmount();
});

test("reused uploader in upload-only mode never fetches or displays static CV links", () => {
  const exports = {};
  const effects = [];
  const getCalls = [];
  let index = 0;
  const initial = [null, false, null, false, null, [latest]];
  vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "../pages/candidate/Dashboard/CVUpload.jsx"), "utf8"), {
    transforms: ["jsx", "imports"],
  }).code, {
    exports,
    require(name) {
      if (name === "react") return { ...React, useState: () => [initial[index++], () => {}], useEffect: (fn) => effects.push(fn) };
      if (name === "axios") return { get: (...args) => getCalls.push(args) };
      if (name === "next/router") return { useRouter: () => ({}) };
      if (name === "react-toastify") return { toast: {} };
      if (name.includes("utils/constant")) return { url: "http://test.invalid" };
      if (name.includes("utils/cvDisplayName")) return displayNames;
      if (name.startsWith("react-icons/")) return require(name);
      throw new Error(name);
    },
  });
  const tree = exports.default({ uploadOnly: true, isGuest: false });
  effects.forEach((fn) => fn());
  assert.equal(getCalls.length, 0);
  assert.equal(all(tree).filter((node) => node.type === "a").length, 0);
  assert.ok(text(tree).includes("Upload CV"));
});

test("score progress keeps existing 75/50 colour boundaries and displays actual backend value", async () => {
  for (const [value, colour] of [[85, "emerald"], [75, "emerald"], [74, "amber"], [50, "amber"], [49, "slate"], [0, "slate"]]) {
    const app = harness({ previewScore: value });
    const tree = await app.settle();
    const progress = all(tree).find((node) => node.props?.role === "progressbar");
    assert.equal(progress.props["aria-valuenow"], value);
    assert.ok(all(progress).some((node) => node.props?.className?.includes(`bg-${colour}-`)));
    assert.ok(all(progress).some((node) => node.props?.style?.width === `${value}%`));
    assert.ok(text(tree).includes(`${value}%`));
    assert.equal(button(tree, "Confirm & Apply").props.disabled, false);
    app.unmount();
  }
});

test("CV menu supports arrow, Home/End and Escape navigation without calling application actions", async () => {
  const app = harness();
  let tree = await app.settle();
  let focusReturned = 0;
  const trigger = button(tree, "CV actions");
  trigger.ref.current = { focus: () => { focusReturned++; } };
  trigger.props.onKeyDown({ key: "ArrowDown", preventDefault() {} });
  tree = app.render();
  const menu = all(tree).find((node) => node.props?.role === "menu");
  assert.ok(menu);
  assert.equal(all(menu).filter((node) => node.props?.role === "menuitem").length, 3);
  const items = [0, 1, 2].map(() => ({ focus() { app.dom.activeElement = this; } }));
  app.dom.activeElement = items[0];
  for (const [key, index] of [["ArrowDown", 1], ["End", 2], ["Home", 0], ["ArrowUp", 2]]) {
    let prevented = false;
    menu.props.onKeyDown({ key, preventDefault() { prevented = true; }, currentTarget: { querySelectorAll: () => items } });
    assert.equal(prevented, true);
    assert.equal(app.dom.activeElement, items[index]);
  }
  app.pressEscape();
  assert.equal(all(app.render()).some((node) => node.props?.role === "menu"), false);
  assert.equal(focusReturned, 1);
  assert.equal(app.calls.confirm.length, 0);
  assert.equal(app.calls.opened.length, 0);
  app.unmount();
});

test("Cancel uses the existing close action and footer keeps submission loading/disabled states", async () => {
  const app = harness();
  let tree = await app.settle();
  const footer = all(tree).find((node) => node.type === "footer");
  assert.ok(footer);
  button(footer, "Cancel").props.onClick();
  assert.equal(app.calls.closedModal, 1);
  app.props.submitting = true;
  tree = app.render();
  assert.equal(button(tree, "Cancel").props.disabled, true);
  assert.equal(button(tree, "Close Quick Apply").props.disabled, true);
  assert.equal(button(tree, "Applying...").props.disabled, true);
  assert.equal(app.calls.confirm.length, 0);
  app.unmount();
});

test("Latest Jobs can share authenticated CV and score requests; new upload keeps submission tied to its score", async () => {
  const app = harness();
  const previews = [];
  const uploads = [];
  app.props.initialCv = latest;
  app.props.loadMatch = async (jobId, cvId) => {
    previews.push({ jobId, cvId });
    return { matchScore: cvId === latest._id ? 0 : 20 };
  };
  app.props.onCvUploaded = (cv) => uploads.push(cv._id);
  let tree = await app.settle();
  assert.ok(text(tree).includes("0%"));
  assert.equal(app.calls.get.length, 0);
  assert.equal(app.calls.post.length, 0);
  upload(tree).props.onUploadSuccess({ _id: "cv-upload", originalFileName: "New CV.pdf" });
  tree = await app.settle();
  assert.deepEqual(uploads, ["cv-upload"]);
  assert.deepEqual(previews.map((value) => value.cvId), [latest._id, "cv-upload"]);
  assert.ok(text(tree).includes("20%"));
  await button(tree, "Confirm & Apply").props.onClick();
  assert.deepEqual(app.calls.confirm, ["cv-upload"]);
  assert.equal(app.calls.get.length, 0);
  assert.equal(app.calls.post.length, 0);
  app.unmount();
});
