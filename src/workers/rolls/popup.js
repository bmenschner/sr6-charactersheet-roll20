// BEGIN MODULE: workers/rolls/popup
function runSuccessProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);
  const parsedFields = parseTemplateFields(rawTemplate);
  const definition = resolveRollDefinition(parsedFields, parsePoolAttributeFromFields(parsedFields));

  getAttrs(["sr6_setting_popup_mods"], (values) => {
    const popupSetting = (values.sr6_setting_popup_mods || "eigen").toLowerCase();
    const useRoll20Fallback = popupSetting === "roll20";

    if (!useRoll20Fallback) {
      const popupFormPayload = buildPopupFormPayload(definition);
      setAttrsSilent({
        ...popupFormPayload,
        sr6_roll_popup_definition: definition.id,
        sr6_roll_popup_template: rawTemplate,
        sr6_roll_popup_row_prefix: repeatingRowPrefix || "",
        sr6_roll_popup_open: "1",
      });
      return;
    }

    startRoll(
      "&{template:default} {{name=Probenmodifikator}} {{Wert=[[?{Modifikator|0}]]}}",
      (queryResult) => {
        const queryRoll = queryResult && queryResult.results && queryResult.results.Wert;
        const popupState = {
          poolMod: parseNumber(queryRoll && queryRoll.result),
          rows: parseNumber(queryRoll && queryRoll.result) !== 0
            ? [{ label: "Popup-Modifikator", value: `${parseNumber(queryRoll && queryRoll.result)}` }]
            : [],
        };
        if (queryResult && queryResult.rollId) {
          finishRoll(queryResult.rollId);
        }
        runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
      }
    );
  });
}

function runTestPopupProbeRoll(eventInfo) {
  const rawTemplate = (eventInfo && eventInfo.htmlAttributes && eventInfo.htmlAttributes.value) || "";
  const repeatingRowPrefix = extractRepeatingRowPrefix(eventInfo);
  getAttrs(["sr6_test_roll_popup_mod"], (values) => {
    const popupPoolMod = parseNumber(values.sr6_test_roll_popup_mod);
    const popupState = {
      poolMod: popupPoolMod,
      rows: popupPoolMod !== 0 ? [{ label: "Popup-Modifikator", value: `${popupPoolMod}` }] : [],
    };
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeConfirm() {
  getAttrs([
    "sr6_roll_popup_definition",
    "sr6_roll_popup_template",
    "sr6_roll_popup_row_prefix",
    "sr6_roll_popup_value_1_number",
    "sr6_roll_popup_value_2_number",
    "sr6_roll_popup_value_3_number",
    "sr6_roll_popup_value_1_select_visibility",
    "sr6_roll_popup_value_2_select_visibility",
    "sr6_roll_popup_value_3_select_visibility",
    "sr6_roll_popup_value_1_select_movement",
    "sr6_roll_popup_value_2_select_movement",
    "sr6_roll_popup_value_3_select_movement",
    "sr6_roll_popup_value_1_select_spell_range",
    "sr6_roll_popup_value_2_select_spell_range",
    "sr6_roll_popup_value_3_select_spell_range",
    "sr6_roll_popup_value_1_select_matrix_access",
    "sr6_roll_popup_value_2_select_matrix_access",
    "sr6_roll_popup_value_3_select_matrix_access",
  ], (values) => {
    const definition = getRollDefinitionById(values.sr6_roll_popup_definition || "");
    const rawTemplate = values.sr6_roll_popup_template || "";
    const repeatingRowPrefix = values.sr6_roll_popup_row_prefix || "";
    const popupState = buildPopupStateFromValues(values, definition);

    setAttrsSilent({ sr6_roll_popup_open: "0" });
    runSuccessProbeFromContext(rawTemplate, repeatingRowPrefix, popupState);
  });
}

function runGlobalPopupProbeCancel() {
  setAttrsSilent({ sr6_roll_popup_open: "0" });
}
// END MODULE: workers/rolls/popup
