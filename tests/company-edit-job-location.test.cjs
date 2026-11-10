const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { transform } = require("sucrase");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const tick = () => new Promise((resolve) => setImmediate(resolve));
const city = {
  city: "London", country: "United Kingdom", locationType: "city",
  displayName: "London, United Kingdom", providerPlaceId: "saved-city",
};
const country = {
  city: "", country: "United Kingdom", locationType: "country",
  displayName: "United Kingdom", providerPlaceId: "saved-country",
};
const county = {
  city: "", county: "Surrey", country: "United Kingdom", locationType: "county",
  displayName: "Surrey, United Kingdom", providerPlaceId: "saved-county",
};
const region = {
  city: "", region: "England", country: "United Kingdom", locationType: "region",
  displayName: "England, United Kingdom", providerPlaceId: "saved-region",
};
const baseJob = {
  _id: "job-1", title: "Engineer", salary: "Competitive", jobType: "Full-time",
  workMode: "Office", education: "Bachelor's degree", experience: "2+ years",
  category: "IT & Software", industry: "Technology", keySkills: ["React", "SQL"],
  requirements: ["Know React", "Communicate clearly"], responsibilities: ["Build software", "Review code"],
  roleSummary: "Build products", compensationBenefits: "Pension", vacancies: 2,
  applicationEndDate: "2026-12-01T00:00:00.000Z", filledPositions: 1,
  status: "Open", companyId: "company-1", createdBy: "user-1", location: city,
};
const suggestion = (location = city) => ({
  displayLabel: location.displayName, location: { ...location }, token: "signed-selection-token",
});
const change = (name, value) => ({ target: { name, value } });

// Exercise the actual hook with persistent state and authenticated, mocked HTTP.
// No server, provider request or database writes are needed.
function harness(job = baseJob, { token = "session-token", role = "company" } = {}) {
  const slots = [];
  const effects = [];
  let cursor = 0;
  let mounted = false;
  const calls = { get: [], put: [], errors: [], alerts: [], redirects: [] };
  const router = { replace: (url) => calls.redirects.push(url) };
  let putResponse = async (_url, payload) => ({ data: { job: { ...job, ...payload } } });
  const exports = {};
  vm.runInNewContext(transform(read("pages/company/Dashboard/PostedJobs/usePostedJobs.js"), {
    transforms: ["imports"],
  }).code, {
    exports,
    localStorage: { getItem: () => token },
    alert: (message) => calls.alerts.push(message),
    console: { error: (...args) => calls.errors.push(args) },
    require(name) {
      if (name === "react") return {
        useState(initial) {
          const index = cursor++;
          if (!(index in slots)) slots[index] = initial;
          return [slots[index], (value) => {
            slots[index] = typeof value === "function" ? value(slots[index]) : value;
          }];
        },
        useEffect(effect) { if (!mounted) effects.push(effect); },
      };
      if (name === "next/router") return { useRouter: () => router };
      if (name === "axios") return {
        get: async (...args) => {
          calls.get.push(args);
          return { data: args[0].endsWith("/user-profile") ? { user: { role } } : [job] };
        },
        put: (...args) => { calls.put.push(args); return putResponse(...args); },
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return {
    calls,
    render() { cursor = 0; return exports.default(); },
    async mount() {
      this.render();
      mounted = true;
      effects.forEach((effect) => effect());
      await tick();
      return this.render();
    },
    async open() {
      (await this.mount()).openModal(job);
      this.render().setIsEditing(true);
      return this.render();
    },
    respondWith(response) { putResponse = response; },
  };
}

test("saved city, country, county, region and legacy locations prepopulate without requesting suggestions", async () => {
  for (const location of [city, country, county, region, "London, United Kingdom"]) {
    const job = { ...baseJob, location, workMode: location === city ? "Office" : "Remote" };
    const app = harness(job);
    const state = await app.open();
    assert.equal(state.editForm.location, typeof location === "string" ? location : location.displayName);
    assert.equal(state.locationScope, location === country ? "country" : "locality");
    assert.equal(state.locationWasEdited, false);
    assert.equal(state.editLocation, null);
    assert.equal(state.editForm.applicationEndDate, "2026-12-01");
    assert.equal(state.editForm.education, job.education);
    assert.equal(state.editForm.experience, job.experience);
    assert.equal(state.editForm.keySkills, "React, SQL");
    assert.deepEqual(app.calls.get.map(([url]) => url), [
      "http://localhost:8002/user-profile", "http://localhost:8002/my-jobs",
    ]);
  }
});

test("unchanged saved locations omit location and token while other editable fields save with authentication", async () => {
  for (const location of [city, country, county, region, "London, United Kingdom"]) {
    const job = { ...baseJob, location, workMode: "Remote" };
    const app = harness(job);
    await app.open();
    const changes = {
      title: "Senior Engineer", salary: "Competitive", jobType: "Part-time", workMode: "Remote",
      education: "Master's degree", experience: "5+ years", category: "Engineering", industry: "Software",
      roleSummary: "Lead delivery", compensationBenefits: "Pension and leave", applicationEndDate: "2026-12-15",
      vacancies: "3", keySkills: " React, TypeScript, ", requirements: "Know TypeScript, Communicate clearly",
      responsibilities: "Build features, Review code", companyId: "forged", createdBy: "forged",
      filledPositions: "999", status: "Closed", postedByName: "forged",
    };
    for (const [name, value] of Object.entries(changes)) app.render().handleEditChange(change(name, value));
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 1);
    const [endpoint, payload, config] = app.calls.put[0];
    assert.equal(endpoint, "http://localhost:8002/jobs/job-1");
    assert.equal(config.headers.Authorization, "Bearer session-token");
    for (const key of ["location", "locationToken", "companyId", "createdBy", "filledPositions", "status", "postedByName"]) {
      assert.equal(Object.hasOwn(payload, key), false, key);
    }
    for (const key of ["title", "salary", "jobType", "workMode", "education", "experience", "category", "industry",
      "roleSummary", "compensationBenefits", "applicationEndDate"]) assert.equal(payload[key], changes[key], key);
    assert.equal(payload.vacancies, 3);
    assert.deepEqual(plain(payload.keySkills), ["React", "TypeScript"]);
    assert.deepEqual(plain(payload.requirements), ["Know TypeScript", "Communicate clearly"]);
    assert.deepEqual(plain(payload.responsibilities), ["Build features", "Review code"]);
    assert.deepEqual(plain(app.render().selectedJob.location), location);
    assert.equal(app.render().isEditing, false);
    assert.deepEqual(app.calls.alerts, []);
  }
});

test("changed signed city and Remote country/county/region selections include their tokens and display the saved canonical result", async () => {
  for (const location of [city, country, county, region]) {
    const app = harness({ ...baseJob, workMode: "Remote" });
    await app.open();
    if (location === country) app.render().handleLocationScopeChange(change("scope", "country"));
    app.render().handleEditLocationChange(suggestion(location));
    const canonical = { ...location, displayName: `Verified ${location.displayName}` };
    app.respondWith(async () => ({ data: { job: { ...baseJob, workMode: "Remote", location: canonical } } }));
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 1);
    assert.deepEqual(plain(app.calls.put[0][1].location), location);
    assert.equal(app.calls.put[0][1].locationToken, "signed-selection-token");
    const state = app.render();
    assert.equal(state.editForm.location, canonical.displayName);
    assert.deepEqual(plain(state.jobs[0].location), canonical);
    assert.equal(state.editLocation, null);
    assert.equal(state.locationWasEdited, false);
    assert.equal(state.locationError, "");
  }
});

test("typing, clearing and programmatic location edits cannot reuse an old selection or silently keep the saved location", async () => {
  for (const text of ["Arbitrary City, UK", "", city.displayName]) {
    const app = harness();
    await app.open();
    app.render().handleEditLocationChange(suggestion());
    // The real picker emits a null selection whenever text changes.
    app.render().handleEditLocationChange({ displayLabel: text, location: null, token: null });
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 0);
    assert.match(app.render().locationError, /select.*Geoapify/);
    app.render().handleEditLocationChange(suggestion());
    app.render().handleEditChange(change("location", "Tampered text"));
    assert.equal(app.render().editLocation, null);
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 0);
  }
});

test("incomplete selections, scope mismatches and stale display text are blocked before PUT", async () => {
  const valid = suggestion();
  for (const selection of [null, { ...valid, token: "" }, { ...valid, location: city.displayName },
    { ...valid, location: [] }, { ...valid, location: { ...city, country: "" } },
    { ...valid, location: { ...city, providerPlaceId: "" } },
    { ...valid, location: { ...city, city: "" } }, suggestion(country),
    { ...valid, displayLabel: "" }]) {
    const app = harness();
    await app.open();
    app.render().handleEditLocationChange(selection);
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 0);
    assert.ok(app.render().locationError);
  }
  const app = harness();
  await app.open();
  app.render().handleEditLocationChange(suggestion());
  // Defensive check for a programmatic change outside the picker callback.
  app.render().editForm.location = "Stale display text";
  await app.render().handleSave();
  assert.equal(app.calls.put.length, 0);
  assert.match(app.render().locationError, /select.*Geoapify/);
  app.render().openModal(baseJob);
  app.render().editForm.location = "Changed without a selection";
  await app.render().handleSave();
  assert.equal(app.calls.put.length, 0);
  assert.equal(app.render().locationWasEdited, true);
});

test("changing search area invalidates the selection and remounts the signed picker", async () => {
  const app = harness({ ...baseJob, workMode: "Remote" });
  await app.open();
  app.render().handleEditLocationChange(suggestion());
  const revision = app.render().locationPickerRevision;
  app.render().handleLocationScopeChange(change("scope", "locality"));
  assert.equal(app.render().locationPickerRevision, revision, "same scope is a no-op");
  app.render().handleLocationScopeChange(change("scope", "country"));
  assert.equal(app.render().editLocation, null);
  assert.ok(app.render().locationPickerRevision > revision);
  await app.render().handleSave();
  assert.equal(app.calls.put.length, 0);
  app.render().handleEditLocationChange(suggestion(city));
  await app.render().handleSave();
  assert.equal(app.calls.put.length, 0, "a city cannot be used in country scope");
  app.render().handleEditLocationChange(suggestion(country));
  await app.render().handleSave();
  assert.equal(app.calls.put.length, 1);
});

test("Office and Hybrid require cities but undoing an incompatible mode change preserves the original country without reselection", async () => {
  for (const mode of ["Office", "Hybrid"]) {
    const app = harness({ ...baseJob, location: country, workMode: "Remote" });
    await app.open();
    app.render().handleEditChange(change("workMode", mode));
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 0);
    assert.match(app.render().locationError, /require a city/);
    assert.equal(app.render().locationWasEdited, false);
    app.render().handleEditChange(change("workMode", "Remote"));
    assert.equal(app.render().locationScope, "country");
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 1);
    assert.equal(Object.hasOwn(app.calls.put[0][1], "location"), false);
  }
  const app = harness({ ...baseJob, workMode: "Remote" });
  await app.open();
  app.render().handleLocationScopeChange(change("scope", "country"));
  app.render().handleEditLocationChange(suggestion(country));
  app.render().handleEditChange(change("workMode", "Hybrid"));
  assert.equal(app.render().editLocation, null);
  await app.render().handleSave();
  assert.equal(app.calls.put.length, 0);
  app.render().handleEditLocationChange(suggestion(city));
  await app.render().handleSave();
  assert.equal(app.calls.put[0][1].workMode, "Hybrid");
});

test("rejected location tokens clear the selection, preserve the draft and allow reselection without logging tokens", async () => {
  for (const code of ["EXPIRED_LOCATION_TOKEN", "INVALID_LOCATION_TOKEN", "MISSING_LOCATION_TOKEN",
    "LOCATION_TOKEN_MISMATCH", "LOCATION_NOT_VERIFIED", "INCOMPATIBLE_LOCATION", "INVALID_LOCATION"]) {
    const app = harness();
    await app.open();
    app.render().handleEditChange(change("title", "Keep this draft"));
    app.render().handleEditLocationChange(suggestion());
    const revision = app.render().locationPickerRevision;
    app.respondWith(async () => { throw {
      response: { status: 400, data: { code } },
      config: { headers: { Authorization: "PRIVATE-BEARER" }, data: "PRIVATE-LOCATION-TOKEN" },
    }; });
    await app.render().handleSave();
    const state = app.render();
    assert.equal(state.editForm.title, "Keep this draft");
    assert.equal(state.editForm.location, city.displayName);
    assert.equal(state.selectedJob.title, baseJob.title);
    assert.equal(state.isEditing, true);
    assert.equal(state.saving, false);
    assert.equal(state.editLocation, null);
    assert.ok(state.locationPickerRevision > revision);
    assert.match(state.locationError, code === "EXPIRED_LOCATION_TOKEN" ? /expired/ : /could not be confirmed/);
    await state.handleSave();
    assert.equal(app.calls.put.length, 1, "the rejected token cannot be resubmitted");
    assert.doesNotMatch(JSON.stringify(app.calls.errors), /PRIVATE-|signed-selection-token|session-token/);
    app.render().handleEditLocationChange({ ...suggestion(), token: "fresh-token" });
    app.respondWith(async (_url, payload) => ({ data: { job: { ...baseJob, title: payload.title } } }));
    await app.render().handleSave();
    assert.equal(app.calls.put.length, 2);
    assert.equal(app.calls.put[1][1].locationToken, "fresh-token");
    assert.equal(app.render().selectedJob.title, "Keep this draft");
  }
});

test("unauthorized and provider failures retain the draft, report errors and restore Save", async () => {
  for (const [status, message, code] of [[401, "Unauthorized"], [403, "Not authorized"],
    [503, "Location verification is temporarily unavailable.", "LOCATION_PROVIDER_UNAVAILABLE"]]) {
    const app = harness();
    await app.open();
    app.render().handleEditLocationChange(suggestion());
    app.respondWith(async () => { throw { response: { status, data: { message, code } } }; });
    await app.render().handleSave();
    assert.equal(app.render().isEditing, true);
    assert.equal(app.render().saving, false);
    assert.equal(app.render().editLocation.token, "signed-selection-token");
    assert.equal(app.render().selectedJob.title, baseJob.title);
    assert.deepEqual(app.calls.alerts, [message]);
  }
});

test("cancel/reopen restores saved state and authentication checks remain in place", async () => {
  const app = harness();
  await app.open();
  app.render().handleEditLocationChange(suggestion(country));
  const revision = app.render().locationPickerRevision;
  app.render().openModal(baseJob);
  assert.equal(app.render().locationWasEdited, false);
  assert.equal(app.render().editForm.location, city.displayName);
  assert.ok(app.render().locationPickerRevision > revision);
  app.render().closeModal();
  assert.equal(app.render().selectedJob, null);
  assert.equal(app.render().editForm, null);
  const guest = harness(baseJob, { token: null });
  await guest.mount();
  assert.equal(guest.calls.get.length, 0);
  assert.deepEqual(guest.calls.redirects, ["/"]);
  const candidate = harness(baseJob, { role: "candidate" });
  await candidate.mount();
  assert.equal(candidate.calls.get.length, 1);
  assert.deepEqual(candidate.calls.redirects, ["/"]);
});

test("Edit Job renders the existing signed autocomplete with the saved value, scope and reset key", async () => {
  function LocationAutocomplete() { return null; }
  const exports = {};
  vm.runInNewContext(transform(read("pages/company/Dashboard/PostedJobs/PostedJobs.jsx"), {
    transforms: ["jsx", "imports"],
  }).code, {
    exports,
    require(name) {
      if (name === "react" || name.startsWith("react-icons/")) return require(name);
      if (name.endsWith("/LocationAutocomplete")) return LocationAutocomplete;
      throw new Error(name);
    },
  });
  const elements = (node) => !node || typeof node !== "object" ? []
    : [node, ...React.Children.toArray(node.props?.children).flatMap(elements)];
  const app = harness({ ...baseJob, location: country, workMode: "Remote" });
  const state = await app.open();
  const nodes = elements(exports.default(state));
  const picker = nodes.find((node) => node.type === LocationAutocomplete);
  assert.equal(picker.props.mode, "job");
  assert.equal(picker.props.value, country.displayName);
  assert.equal(picker.props.scope, "country");
  assert.ok(picker.key.endsWith(`job-1-country-${state.locationPickerRevision}`));
  assert.equal(picker.props.onChange, state.handleEditLocationChange);
  assert.equal(nodes.find((node) => node.props?.id === "edit-job-location-scope").props.value, "country");
});
