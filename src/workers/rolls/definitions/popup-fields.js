// BEGIN MODULE: workers/rolls/definitions/popup-fields.js
// Gemeinsame Popup-Feldgruppen, die von mehreren Roll-Definitionen wiederverwendet werden.
const SR6_DEFAULT_POPUP_FIELDS = [
  {
    id: "pool_mod",
    slot: 1,
    label: "Popup-Modifikator",
    type: "number",
    affects: "pool",
    defaultValue: "0",
    includeInTemplate: true,
  },
];

function createRiggingVehiclePopupFields() {
  return [
    ...SR6_DEFAULT_POPUP_FIELDS,
    {
      id: "ammo_context",
      slot: 2,
      label: "Munition",
      type: "select",
      optionSet: "ammo",
      sourceAttr: "sr6_rigging_fahrzeug_waffe_munition",
      affects: ["attack_value", "damage"],
      includeInTemplate: true,
      defaultValue: "Standard",
      visibleWhenField: "Probe",
      visibleWhenValue: "weapon_attack",
    },
  ];
}
// END MODULE: workers/rolls/definitions/popup-fields.js
