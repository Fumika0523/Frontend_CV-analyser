const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { transform } = require("sucrase");
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const displayNames = {};
vm.runInNewContext(transform(read("utils/cvDisplayName.js"), { transforms: ["imports"] }).code, { exports: displayNames });
const files = ["pages/candidate/viewMyCVs.jsx", "pages/candidate/Dashboard/CVUpload.jsx"];
const cvs = [
  { _id: "new-cv", version: 3, originalFileName: "My résumé.pdf", fileName: "17_v3.pdf", filePath: "/uploads/cvs/17/17_v3.pdf" },
  { _id: "old-cv", version: 2, fileName: "17_v2.pdf", filePath: "/uploads/cvs/17/17_v2.pdf" },
];
function all(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(all)];
}
function text(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return node && typeof node === "object" ? React.Children.toArray(node.props?.children).map(text).join(" ") : "";
}
function harness(file, { token = "test-token", fail } = {}) {
  const uploader = file.includes("CVUpload");
  const slots = uploader ? [null, false, null, false, null, cvs] : [cvs, false, null, false];
  let cursor = 0;
  const calls = { get: [], opened: [], revoked: [], errors: [] };
  const exports = {};
  vm.runInNewContext(transform(read(file), { transforms: ["jsx", "imports"] }).code, {
    exports, Blob, console: { log() {}, error() {} },
    localStorage: { getItem: () => token },
    setTimeout: (fn) => fn(),
    window: {
      URL: { createObjectURL: () => "blob:authorized-cv", revokeObjectURL: (value) => calls.revoked.push(value) },
      open: (...args) => calls.opened.push(args),
    },
    require(name) {
      if (name === "react") return { ...React, useEffect() {}, useState() {
        const index = cursor++;
        return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
      } };
      if (name === "axios") return { get: async (...args) => {
        calls.get.push(args);
        if (fail) throw fail;
        return { data: new Blob(["%PDF-test"]) };
      } };
      if (name === "react-toastify") return { toast: { error: (message) => calls.errors.push(message) } };
      if (name === "next/router") return { useRouter: () => ({ push() {} }) };
      if (name.endsWith("/utils/cvDisplayName")) return displayNames;
      if (name.endsWith("/utils/constant")) return { url: "http://test.invalid" };
      if (name.includes("components/Layout")) return function Layout() { return null; };
      if (name.startsWith("react-icons/")) return require(name);
      throw new Error(name);
    },
  });
  return { calls, tree: exports.default({ isGuest: false }) };
}

test("both candidate CV lists show original names or version fallback, retaining version labels", () => {
  for (const file of files) {
    const { tree } = harness(file);
    assert.ok(text(tree).includes("My résumé.pdf"), file);
    assert.ok(text(tree).includes("CV Version 2.pdf"), file);
    assert.match(text(tree), /Version\s+3/, file);
    for (const cv of cvs) {
      assert.ok(!text(tree).includes(cv.fileName), file);
      assert.ok(!JSON.stringify(tree).includes(cv.filePath), file);
    }
    assert.equal(all(tree).filter((node) => node.type === "a").length, 0, "CV actions must not use static links");
  }
});

test("both CV lists preview through authenticated endpoint and release blob URLs", async () => {
  for (const file of files) {
    const { tree, calls } = harness(file);
    const view = all(tree).find((node) => node.type === "button" && text(node).trim() === "View CV");
    await view.props.onClick();
    assert.equal(calls.get[0][0], "http://test.invalid/cv/new-cv/download");
    assert.equal(calls.get[0][1].headers.Authorization, "Bearer test-token");
    assert.equal(calls.get[0][1].responseType, "blob");
    assert.equal(calls.opened[0][0], "blob:authorized-cv");
    assert.deepEqual(calls.revoked, ["blob:authorized-cv"]);
  }
});

test("CV access with missing token or forbidden response never opens a PDF or static URL", async () => {
  for (const file of files) {
    for (const options of [{ token: null }, { fail: { response: { status: 403 } } }]) {
      const { tree, calls } = harness(file, options);
      await all(tree).find((node) => node.type === "button" && text(node).trim() === "View CV").props.onClick();
      assert.equal(calls.opened.length, 0);
      assert.equal(calls.errors.length, 1);
      if (!options.token && "token" in options) assert.equal(calls.get.length, 0);
    }
  }
});

test("display fallback never reads internal metadata; original paths and controls are stripped", () => {
  for (const originalFileName of [undefined, null, "", "   ", "..", "/"]) {
    assert.equal(displayNames.cvDisplayName({ version: 7, originalFileName, fileName: "private.pdf", filePath: "/secret/private.pdf" }), "CV Version 7.pdf");
  }
  assert.equal(displayNames.cvDisplayName({ version: 4, originalFileName: "C:\\private\\My\u0000 CV.pdf" }), "My CV.pdf");
  assert.equal(displayNames.cvDisplayName({ originalFileName: "/private/My résumé.pdf" }), "My résumé.pdf");
});
