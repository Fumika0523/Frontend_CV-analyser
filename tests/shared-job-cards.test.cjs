const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { transform } = require("sucrase");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "../components/Jobs", file), "utf8"), { transforms: ["jsx", "imports"] }).code, {
    exports, URL, require: (name) => name.startsWith("./") ? load(`${name.slice(2)}${name.endsWith("Utils") ? ".js" : ".jsx"}`) : require(name),
  });
  return exports;
}
const JobCard = load("JobCard.jsx").default;
const MatchScoreRing = load("MatchScoreRing.jsx").default;
const JobMatchIndicator = load("JobMatchIndicator.jsx").default;
function all(node) {
  if (!node || typeof node !== "object") return [];
  if (["JobCard", "JobMatchIndicator", "MatchScoreRing"].includes(node.type?.name)) return [node, ...all(node.type(node.props))];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(all)];
}
function text(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return node && typeof node === "object" ? React.Children.toArray(node.props?.children).map(text).filter(Boolean).join(" ") : "";
}

test("shared circular score supports zero and keeps the 75/50 colour boundaries", () => {
  for (const [value, colour] of [[0, "slate"], [49, "slate"], [50, "amber"], [74, "amber"], [75, "emerald"], [100, "emerald"]]) {
    let clicked = 0;
    const tree = MatchScoreRing({ score: value, label: "Match score", onClick: () => clicked++ });
    assert.equal(tree.props["aria-label"], `Match score: ${value}%. View breakdown`);
    const circles = all(tree).filter((node) => node.type === "circle");
    assert.equal(circles.length, 2);
    assert.ok(circles[1].props.className.includes(`stroke-${colour}-`));
    assert.ok(text(tree).includes(`${value}%`));
    tree.props.onClick();
    assert.equal(clicked, 1);
  }
  for (const missing of [undefined, null, NaN, "85"]) assert.equal(MatchScoreRing({ score: missing }), null);
});

test("shared card keeps compact facts, dates, skill tags, status and separate details/apply actions", () => {
  let details = 0;
  let apply = 0;
  const job = { title: "Developer", companyName: "Example", companyUrl: "https://example.com", location: "London, UK",
    salary: "Competitive", workMode: "Remote", jobType: "Full-time", status: "Open",
    keySkills: ["React", "SQL", "Node", "Python", "Testing"], createdAt: "2026-11-01", applicationEndDate: "2099-12-31" };
  const tree = JobCard({ job, onViewDetails: () => details++,
    matchIndicator: React.createElement(MatchScoreRing, { score: 0, label: "Match score", onClick() {} }),
    applyButton: React.createElement("button", { onClick: () => apply++ }, "Quick Apply") });
  const html = renderToStaticMarkup(tree);
  for (const content of ["Developer", "Example", "London, UK", "Competitive", "Remote", "Full-time", "Posted", "Apply by", "React", "+1 more", "View Details", "Quick Apply", "0%", "Open"]) assert.ok(html.includes(content), content);
  assert.equal(apply, 0);
  const buttons = all(tree).filter((node) => node.type === "button");
  buttons.find((node) => text(node) === "Developer").props.onClick();
  buttons.find((node) => text(node) === "View Details").props.onClick();
  assert.equal(details, 2);
  buttons.find((node) => text(node) === "Quick Apply").props.onClick();
  assert.equal(apply, 1);
  const website = all(tree).find((node) => node.type === "a");
  assert.equal(website.props.rel, "noopener noreferrer");
  assert.equal(website.props.target, "_blank");
});

test("shared score states never fabricate zero and no-CV upload stays an explicit action", () => {
  let uploads = 0;
  const missing = JobMatchIndicator({ job: {}, scoring: { status: "ready", cv: null }, onUpload: () => uploads++ });
  assert.equal(text(missing), "Upload CV to see your match");
  missing.props.onClick();
  assert.equal(uploads, 1);
  const loading = JobMatchIndicator({ job: {}, scoring: { status: "loading", cv: null, scoreFor: () => undefined } });
  assert.equal(loading.props.role, "status");
  assert.ok(!text(loading).includes("0%"));
  let retries = 0;
  const failed = JobMatchIndicator({ job: {}, scoring: { status: "error", retry: () => retries++ } });
  failed.props.onClick();
  assert.equal(retries, 1);
  assert.ok(!text(failed).includes("0%"));
});

test("shared cards reject unsafe company links and keep long content inside wrapping columns", () => {
  for (const companyUrl of ["javascript:alert(1)", "https://user:secret@example.com"]) {
    const tree = JobCard({ job: { title: "A long developer role", companyName: "Example", companyUrl, location: "A".repeat(150), status: "Open" } });
    assert.equal(all(tree).filter((node) => node.type === "a").length, 0);
    assert.ok(all(tree).some((node) => node.props?.className === "min-w-0 [overflow-wrap:anywhere]"));
  }
});
