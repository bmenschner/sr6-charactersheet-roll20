// BEGIN MODULE: workers/core/helpers
function parseNumber(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isCheckedValue(value) {
  const normalized = `${value || ""}`.trim().toLowerCase();
  return normalized === "1" || normalized === "on" || normalized === "true" || normalized === "yes";
}

function mapTraditionsattributToKey(value) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "charisma") return "charisma";
  if (normalized === "intuition") return "intuition";
  if (normalized === "konstitution") return "konstitution";
  if (normalized === "logik") return "logik";
  if (normalized === "willenskraft") return "willenskraft";
  return "";
}
// END MODULE: workers/core/helpers
