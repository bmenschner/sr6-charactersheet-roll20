// BEGIN MODULE: workers/rolls/definitions/magic.js
// Roll-Definitionen fuer Magie: Zauber, Beschwoeren, Magie-Kernwerte und astrale Verteidigungs-/Widerstandsproben.
const SR6_ROLL_DEFINITIONS_MAGIC = [
{
    id: "spell",
    probeModel: "spell_probe",
    matchField: "",
    matchPoolPrefix: "sr6_magic_spruchzauberei",
    titleMode: "fixed",
    primaryFields: ["Zauber"],
    extraFields: ["Art", "Reichweite", "Typ", "Dauer", "Widerstand", "Entzug", "Schadenstyp", "Notiz"],
    contextFields: [
      { label: "Entzugswiderstand", attr: "sr6_magic_entzug_widerstand" },
    ],
    fixedTitle: "Spruchzauberei",
    popupFields: createSpellPopupFields(),
    titleFallback: "Zauber",
  },
{
    id: "summoning",
    probeModel: "summoning_probe",
    matchField: "",
    matchPoolPrefix: "sr6_magic_beschwoeren",
    titleMode: "fixed",
    primaryFields: ["Geist"],
    extraFields: ["Typ", "Stufe"],
    fixedTitle: "Beschwören",
    popupFields: createSummoningPopupFields(),
    titleFallback: "Geister",
  },
{
    id: "astral_defense",
    ...createDefenseProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_astrale_verteidigung",
      primaryContextLabel: "Astrale Verteidigung",
      comparisonContextLabel: "Astralkampf Verteidigungswert",
      comparisonContextSourceAttr: "sr6_magic_astralkampf_verteidigungswert",
      fixedTitle: "Astrale Verteidigung",
      titleFallback: "Magie: Kernwerte",
    }),
  },
{
    id: "astral_damage_resistance",
    ...createDefenseProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_astraler_schadenswiderstand",
      primaryContextLabel: "Astraler Schadenswiderstand",
      comparisonContextLabel: "Astralkampf Verteidigungswert",
      comparisonContextSourceAttr: "sr6_magic_astralkampf_verteidigungswert",
      fixedTitle: "Astraler Schadenswiderstand",
      titleFallback: "Magie: Kernwerte",
    }),
  },
{
    id: "magic_drain_resistance",
    ...createValueProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_entzug_widerstand",
      fixedTitle: "Entzugswiderstand",
      titleFallback: "Entzugswiderstand",
    }),
  },
{
    id: "magic_value",
    ...createValueProbeDefinition({
      matchField: "",
      matchPoolPrefix: "sr6_magic_",
      titleFallback: "Magie: Kernwerte",
    }),
  },
];
// END MODULE: workers/rolls/definitions/magic.js
