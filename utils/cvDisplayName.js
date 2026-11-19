// Display metadata only: never fall back to generated names or storage paths.
export const cvDisplayName = (cv) => {
  const name = typeof cv?.originalFileName === "string"
    ? cv.originalFileName.split(/[\\/]/).pop()
      .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069<>:"|?*]/g, "")
      .trim().slice(0, 255)
    : "";
  const version = Number.isInteger(cv?.version) && cv.version > 0 ? cv.version : 1;
  return name && !/^\.+$/.test(name) ? name : `CV Version ${version}.pdf`;
};
