const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { transform } = require("sucrase");
const React = require("react");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const helpers = { exports: {} };
vm.runInNewContext(transform(read("utils/createJobForm.js"), {
  transforms: ["imports"],
}).code, { exports: helpers.exports });
const page = read("pages/company/Dashboard/PostJob/postJobPage.jsx");
// Exercise the actual payload builder and PDF application callback without auth/network side effects.
const payloadCode = page.slice(page.indexOf("const convertCommaTextToArray"), page.indexOf("const getJobLocationError"));
const extractionCode = page.slice(page.indexOf("  const applyExtractedJobData ="), page.indexOf("  // ANALYSE JD PDF"));
const plain = (value) => JSON.parse(JSON.stringify(value));
function payload(form) {
  return plain(vm.runInNewContext(`${payloadCode}\nbuildJobPayload(form, selection)`, {
    ...helpers.exports, form, selection,
  }));
}
const selection = {
  location: { providerPlaceId: "verified-city", country: "United Kingdom", city: "London", locationType: "city" },
  token: "signed-location-token",
};
const baseForm = {
  title: "Engineer", companyUrl: " https://example.com ", category: "IT & Software",
  industry: "Technology", jobType: "Full-time", workMode: "Office", education: "GCSEs or equivalent",
  experience: "2 years", keySkills: "React, Node.js, , SQL", location: "untrusted text",
  responsibilities: "", requirements: "", roleSummary: "Build software", compensationBenefits: "Pension",
  applicationEndDate: "2026-12-01", salary: "Competitive", vacancies: "2",
};

test("multiline submission trims items, ignores empty lines and preserves sentence commas", () => {
  const result = payload({ ...baseForm,
    responsibilities: "  Build, test and ship features  \r\n\r\n  Support users\n \nReview code\rShare findings ",
    requirements: " Communicate clearly, including written updates\n\nKnow React ",
  });
  assert.deepEqual(result.responsibilities, ["Build, test and ship features", "Support users", "Review code", "Share findings"]);
  assert.deepEqual(result.requirements, ["Communicate clearly, including written updates", "Know React"]);
  assert.deepEqual(result.keySkills, ["React", "Node.js", "SQL"]);
  assert.deepEqual(result.location, selection.location);
  assert.equal(result.locationToken, selection.token);
  for (const key of ["title", "category", "industry", "jobType", "workMode", "education", "experience", "roleSummary", "compensationBenefits", "applicationEndDate", "salary"]) {
    assert.equal(result[key], baseForm[key]);
  }
  assert.equal(result.companyUrl, "https://example.com");
  assert.equal(result.vacancies, 2);
  assert.deepEqual(payload({ ...baseForm, responsibilities: "\n \r\n", requirements: " " }).responsibilities, []);
  assert.deepEqual(payload({ ...baseForm, requirements: "\n \r\n" }).requirements, []);
});

function applyPdf(jobData, locked = false) {
  let form;
  let locationText;
  let reviewNotes;
  vm.runInNewContext(`${extractionCode}\napplyExtractedJobData({ jobData });`, {
    ...helpers.exports, jobData, companyUrlLocked: locked,
    setFormData: (update) => { form = update(baseForm); },
    invalidateLocation: (text) => { locationText = text; },
    setLocationScope() {}, setMessage() {}, setAiReviewNotes: (notes) => { reviewNotes = plain(notes); }, setPdfAnalysed() {}, setTimeout() {},
  });
  return { form: plain(form), locationText, reviewNotes };
}

test("Gemini arrays and multiline strings round-trip as separate items", () => {
  for (const value of [[" Design, build and test ", "", "Review code\nSupport releases"], " Design, build and test\r\n\r\nReview code\nSupport releases"]) {
    const { form, locationText } = applyPdf({ responsibilities: value, requirements: value,
      education: "BSc in Computer Science or equivalent experience", keySkills: ["React", "SQL"], location: "London, UK" }, true);
    assert.equal(form.responsibilities, "Design, build and test\nReview code\nSupport releases");
    assert.equal(form.requirements, form.responsibilities);
    assert.equal(form.education, "BSc in Computer Science or equivalent experience");
    assert.equal(form.companyUrl, baseForm.companyUrl);
    assert.equal(locationText, "London, UK");
    assert.deepEqual(payload(form).requirements, ["Design, build and test", "Review code", "Support releases"]);
    assert.deepEqual(payload(form).keySkills, ["React", "SQL"]);
  }
  const { form } = applyPdf({});
  assert.equal(form.requirements, "");
  assert.equal(form.responsibilities, "");
});

const formModule = { exports: {} };
vm.runInNewContext(transform(read("pages/company/Dashboard/PostJob/postJobForm.jsx"), {
  transforms: ["jsx", "imports"],
}).code, { exports: formModule.exports, console: { log() {} }, require: (name) => {
  if (name === "react") return React;
  if (name.endsWith("createJobForm")) return helpers.exports;
  if (name.endsWith("LocationAutocomplete")) return () => null;
  throw new Error(`Unexpected import: ${name}`);
} });
function elements(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...React.Children.toArray(node.props?.children).flatMap(elements)];
}
test("Education dropdown supports every standard choice and preserves extracted qualifications", () => {
  for (const education of ["", ...helpers.exports.educationOptions, "BSc in Computer Science or equivalent experience"]) {
    let selected;
    const tree = formModule.exports.default({ formData: { ...baseForm, education },
      handleChange: (event) => { selected = event.target.value; }, jobLocation: selection });
    const field = elements(tree).find((element) => element.props?.name === "education");
    assert.equal(field.type, "select");
    assert.equal(field.props.required, true);
    assert.equal(field.props.value, education);
    assert.ok(elements(field).some((option) => option.type === "option" && option.props.value === education));
    field.props.onChange({ target: { name: "education", value: education } });
    assert.equal(selected, education);
    assert.equal(payload({ ...baseForm, education: selected }).education, education);
  }
});

test("modified page parses as JSX", () => {
  assert.doesNotThrow(() => transform(page, { transforms: ["jsx", "imports"] }));
});

test("Experience dropdown contains exactly the requested string values and submits each selection", () => {
  const expected = ["No experience required", "1+ year", "2+ years", "3+ years", "4+ years", "5+ years", "7+ years", "10+ years", "Not specified"];
  assert.deepEqual(plain(helpers.exports.experienceOptions), expected);
  for (const experience of ["", ...expected]) {
    let selected;
    const tree = formModule.exports.default({ formData: { ...baseForm, experience }, jobLocation: selection,
      handleChange: (event) => { selected = event.target.value; } });
    const field = elements(tree).find((element) => element.props?.name === "experience");
    assert.equal(field.type, "select");
    assert.equal(field.props.required, true);
    assert.equal(field.props.value, experience);
    assert.deepEqual(elements(field).filter((element) => element.type === "option").map((option) => option.props.value), ["", ...expected]);
    field.props.onChange({ target: { name: "experience", value: experience } });
    assert.equal(payload({ ...baseForm, experience: selected }).experience, experience);
  }
});

test("PDF maps only clear, supported experience requirements", () => {
  for (const [input, expected] of [
    ...helpers.exports.experienceOptions.map((value) => [value, value]),
    [" 2 years ", "2+ years"], ["At least 3 years of relevant experience", "3+ years"],
    ["Minimum of 5 years", "5+ years"], ["7 years or more", "7+ years"],
    ["No prior experience is required.", "No experience required"],
  ]) {
    const { form, reviewNotes } = applyPdf({ experience: input });
    assert.equal(form.experience, expected, input);
    assert.equal(payload(form).experience, expected);
    assert.deepEqual(reviewNotes, []);
  }
});

test("Ambiguous, absent and unsupported PDF experience requires a fresh recruiter selection", () => {
  for (const input of ["1-2 years", "2–3 years", "Senior", "Entry level", "6+ years", "8 years", "12 years",
    "2 years preferred", "3 years in Java or 5 years in Python", "More than 2 years", "Less than 1 year",
    "0 years", "18 months", "", null, undefined]) {
    const { form, reviewNotes } = applyPdf({ experience: input });
    assert.equal(form.experience, "", String(input));
    assert.ok(reviewNotes.some((note) => note.includes("before posting")));
    if (typeof input === "string" && input.trim()) {
      assert.ok(reviewNotes.some((note) => note.includes(input)));
    }
    assert.equal(payload({ ...form, experience: "Not specified" }).experience, "Not specified");
  }
});

test("Submission cannot open confirmation with an unreviewed experience value", () => {
  const submitCode = page.slice(page.indexOf("  const handleSubmit = (event) =>"), page.indexOf("  // STEP 2: CONFIRM"));
  for (const experience of ["", "Senior", "6+ years", ...helpers.exports.experienceOptions]) {
    let opened = false;
    let message;
    vm.runInNewContext(`${submitCode}\nhandleSubmit({ preventDefault() {} });`, {
      ...helpers.exports, formData: { ...baseForm, experience },
      setMessage: (value) => { message = value; }, validateLocationForSubmission: () => true,
      setShowPostModal: (value) => { opened = value; },
    });
    assert.equal(opened, helpers.exports.experienceOptions.includes(experience));
    if (!opened) assert.match(message, /select minimum relevant experience/);
  }
});

test("Job Details displays new selections and legacy strings verbatim", () => {
  const detailsModule = { exports: {} };
  vm.runInNewContext(transform(read("components/Jobs/JobDetailsModal.jsx"), {
    transforms: ["jsx", "imports"],
  }).code, { exports: detailsModule.exports, require: (name) => {
    if (name === "./jobUtils") return { formatLocation: () => "London, UK" };
    return require(name);
  } });
  const { renderToStaticMarkup } = require("react-dom/server");
  for (const experience of [...helpers.exports.experienceOptions, "1-2 years", "Senior engineer, 6 years preferred"]) {
    const html = renderToStaticMarkup(React.createElement(detailsModule.exports.default, {
      job: { title: "Engineer", experience },
    }));
    assert.ok(html.includes("Minimum relevant experience"));
    assert.ok(html.includes(experience));
    assert.equal(payload({ ...baseForm, experience }).experience, experience);
  }
});
