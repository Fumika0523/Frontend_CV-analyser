export const experienceOptions = [
  "No experience required",
  "1+ year",
  "2+ years",
  "3+ years",
  "4+ years",
  "5+ years",
  "7+ years",
  "10+ years",
  "Not specified",
];

// Only map explicit, supported durations. Ranges, seniority labels, preferences,
// missing data and unsupported thresholds require a recruiter decision.
export const mapExtractedExperience = (value) => {
  if (typeof value !== "string") return "";
  const text = value.trim().toLowerCase().replace(/\s+/g, " ");
  const exact = experienceOptions.find((option) => option.toLowerCase() === text);
  if (exact) return exact;
  if (/^no (?:prior |previous |relevant )?experience (?:is )?required\.?$/.test(text)) {
    return "No experience required";
  }
  const duration = text.match(/^(?:(?:at least|minimum(?: of)?) )?(\d+)\+? years?(?: (?:minimum|or more))?(?: (?:of )?(?:(?:relevant|professional) )?experience)?\.?$/);
  if (!duration) return "";
  const years = Number(duration[1]);
  const option = `${years}+ ${years === 1 ? "year" : "years"}`;
  return experienceOptions.includes(option) ? option : "";
};

// Education remains a plain string, as expected by the job API.
export const educationOptions = [
  "No formal qualifications required",
  "GCSEs or equivalent",
  "A-Levels or equivalent",
  "Diploma / vocational qualification",
  "Bachelor's degree",
  "Phd / Doctorate",
  "Other / equivalent experience",
];

export const convertLinesToArray = (value = "") =>
  value.split(/\r\n|\n|\r/).map((item) => item.trim()).filter(Boolean);

// Keep Gemini's array boundaries and any commas within each item.
export const extractedItemsToText = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => typeof item === "string")
    .flatMap((item) => convertLinesToArray(item))
    .join("\n");
