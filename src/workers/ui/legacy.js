// BEGIN MODULE: workers/ui/legacy
function normalizeLegacyCheckboxValues() {
  getAttrs(["sr6_combat_helm"], (values) => {
    if ((values.sr6_combat_helm || "").trim().toLowerCase() === "on") {
      setAttrsSilent({ sr6_combat_helm: "" });
    }
  });
}
// END MODULE: workers/ui/legacy
