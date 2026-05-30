/**
 * Convert system file path → public URL path
 * Example:
 *  public/importFiles/file.csv → /importFiles/file.csv
 */

const normalizePublicFilePath = (filePath = "") => {
  if (!filePath) return "";

  const normalized = filePath.replace(/\\/g, "/");

  // remove everything before /public/
  const cleaned = normalized.replace(/^.*public\//, "");

  return `/${cleaned}`;
};

module.exports = { normalizePublicFilePath };
