// const decleares a variable named formatLocation.
// (location) is the parameter that receives the location data
// => defines an arrow function
export const formatLocation = (location) => {
//This helps us avoid errors when the backend hasn't provided location information.
  if (!location) {
    return "";
  }

  if (typeof location === "string") {
    return location;
  }

  return [location.city, location.country]
  // .filter((value)=> Boolean(value))
  // means remove empty values from an array and keep the values that exist.
    .filter(Boolean)
    .join(", ");
};


/**
 The parseSalaryMin function extracts the first numerical salary value from a salary string. First, it checks whather the input is valid. Then, it removes commas using replace(), finds the first group of digits using a regular expression, and converts the result into a number. If no valid number is found, it returns null.
  */
export const parseSalaryMin = (salaryString) => {
  // Return null if salary is missing or not a string.
  if (!salaryString || typeof salaryString !== "string") {
    return null;
  }

  // Remove commas from the salary.
  //　/,/g means find every comma in the string.
  const cleanedSalary = salaryString.replace(/,/g, "");

  // Find the first number.
  const match = cleanedSalary.match(/\d+/);

  // Return null if no number exists.
  if (!match) {
    return null;
  }

  // Convert the number from a string to a number.
  return Number(match[0]);
};



/*
 This function checks whether a job meets the candidate's selected minimum salary.

 *First, if the candidate selects "Any salary" (0), the function returns true and keeps the job visible.

 Next, it converts the job salary into lowercase text and removes unnecessary spaces.
 If the salary is "Competitive", it returns true because we want to keep these jobs visible.
 Otherwise, it calls parseSalaryMin() to extract the minimum salary from the job's salary range.
 If no salary number is found, it returns false and excludes the job from the results.
 Finally, it compares the job's minimum salary with the candidate's selected minimum salary.
 If the job salary is equal to or higher than the selected salary, it returns true.Otherwise, it returns false.
 *
 * true  = Show the job
 * false = Hide the job
 */
export const passesSalaryFilter = (job, minSalary) => {
  // 0 means the candidate selected "Any salary".
  if (minSalary === 0) {
    return true;
  }

  // Get the job's salary as lowercase text.
  const salaryText = String(job.salary || "").trim().toLowerCase();

  // Keep jobs with a "Competitive" salary visible.
  if (salaryText === "competitive") {
    return true;
  }

  // Extract the minimum salary from the job.
  const jobMinSalary = parseSalaryMin(job.salary);

  // If no salary number exists, exclude the job.
  if (jobMinSalary === null) {
    return false;
  }

  // Check whether the job meets the selected salary.
  return jobMinSalary >= minSalary;
};


/*
 * Check whether a job's application deadline has passed.

   First, check whether the job has an application deadline.
   If no deadline exists, return false.

   Next, convert the deadline into a JavaScript Date.
   Compare it with the current date and time.

   If the deadline is earlier than now, return true.
   Otherwise, return false.

   true  = Job has expired.
   false = Job has not expired.
 */
export const isJobExpired = (job) => {
  if (!job.applicationEndDate) {
    return false;
  }

  return new Date(job.applicationEndDate) < new Date();
};

/**
 * Salary filter options.
 *
 * Shared by All Jobs and Latest Jobs.
 */
export const salaryFilterOptions = [
  { label: "Any salary", value: 0 },
  { label: "£15,000+", value: 15000 },
  { label: "£20,000+", value: 20000 },
  { label: "£25,000+", value: 25000 },
  { label: "£30,000+", value: 30000 },
  { label: "£35,000+", value: 35000 },
  { label: "£40,000+", value: 40000 },
  { label: "£50,000+", value: 50000 },
  { label: "£60,000+", value: 60000 },
  { label: "£70,000+", value: 70000 },
];


export const workModeOptions = [
  "Office",
  "Hybrid",
  "Remote",
];


/**
 * Check whether a job matches the candidate's filters.
 *
 * Returns:
 * true  = Show the job
 * false = Hide the job
 */
export const passesJobFilters = (job, filters) => {
  // Get the candidate's selected filters.
  const {
    searchTerm,
    locationFilter,
    minSalary,
    workModeFilter,
  } = filters;

  // Convert search values to lowercase.
  const searchValue = searchTerm.trim().toLowerCase();
  const locationValue = locationFilter.trim().toLowerCase();

  // Get searchable job information.
  const title = String(job.title || "").toLowerCase();

  const companyName = String(
    job.companyId?.companyName ||
    job.companyName ||
    ""
  ).toLowerCase();

  const skillsText = Array.isArray(job.keySkills)
    ? job.keySkills.join(" ").toLowerCase()
    : "";

  const locationText =
    formatLocation(job.location).toLowerCase();

  // Check keyword.
  const matchesSearch =
    !searchValue ||
    title.includes(searchValue) ||
    companyName.includes(searchValue) ||
    skillsText.includes(searchValue);

  // Check location.
  const matchesLocation =
    !locationValue ||
    locationText.includes(locationValue);

  // Check work mode.
  const matchesWorkMode =
    !workModeFilter ||
    String(job.workMode || "").toLowerCase() ===
      workModeFilter.toLowerCase();

  // Check whether applications are still open.
  const isAvailable =
    String(job.status || "").toLowerCase() === "open" &&
    !isJobExpired(job);

  // Return true only when all conditions pass.
  return (
    matchesSearch &&
    matchesLocation &&
    matchesWorkMode &&
    passesSalaryFilter(job, minSalary) &&
    isAvailable
  );
};
