// BEGIN MODULE: worker helpers
// Parse helper mit Roll20-sicherem 0-Fallback.
function parseNumber(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Mappt die Dropdown-Werte der Tradition auf interne Attribut-Keys.
function mapTraditionsattributToKey(value) {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "charisma") return "charisma";
  if (normalized === "intuition") return "intuition";
  if (normalized === "konstitution") return "konstitution";
  if (normalized === "logik") return "logik";
  if (normalized === "willenskraft") return "willenskraft";
  return "";
}
// END MODULE: worker helpers
