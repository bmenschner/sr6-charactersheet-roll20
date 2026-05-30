// BEGIN MODULE: workers/core/constants
// Attribute keys are the canonical worker-side identifiers.
// Each key maps to sr6_attr_<key>_{grundwert,modifikator,gesamtwert}.
const SR6_ATTRIBUTES = [
  "konstitution",
  "geschicklichkeit",
  "reaktion",
  "staerke",
  "willenskraft",
  "logik",
  "intuition",
  "charisma",
  "edge",
  "magie_resonanz"
];

// Skill keys drive automatic skill total calculation and generic skill roll definitions.
// Keep these in sync with the static skill fields in the Attribute & Fertigkeiten tab.
const SR6_SKILLS = [
  "astral",
  "athletik",
  "beschwoeren",
  "biotech",
  "cracken",
  "einfluss",
  "elektronik",
  "exotische_waffen",
  "feuerwaffen",
  "heimlichkeit",
  "hexerei",
  "mechanik",
  "nahkampf",
  "natur",
  "steuern",
  "tasken",
  "ueberreden",
  "verzaubern",
  "wahrnehmung"
];

// Matrix action keys are used to generate derived probe/defense attributes and change listeners.
// The order here is the canonical processing order; the visual order can still be handled in HTML/CSS.
const SR6_MATRIX_ACTIONS = [
  "ausstoepseln",
  "befehl_vortaeuschen",
  "bedrohungsanalyse",
  "brute_force",
  "cyberware_kontrollieren",
  "datei_cracken",
  "datei_editieren",
  "datei_verschluesseln",
  "datenbombe_entschaerfen",
  "datenbombe_legen",
  "datenspike",
  "dienstverweigerung",
  "ersticken",
  "garbage_in_garbage_out",
  "geraet_formatieren",
  "geraet_neu_starten",
  "geraet_steuern",
  "geraetesperre",
  "hineinspringen",
  "hintertuer_benutzen",
  "hintertuer_mit_bekanntem_exploit_benutzen",
  "host_betreten_verlassen",
  "icon_aufspueren",
  "icon_modifizieren",
  "icon_veraendern",
  "infrastruktur_unterwandern",
  "interfacemodus_wechseln",
  "kalibrierung",
  "maskerade",
  "matrixattribute_austauschen",
  "matrixsignatur_loeschen",
  "matrixsuche",
  "matrixwahrnehmung",
  "mittelsmetamensch",
  "nachricht_uebermitteln",
  "overwatch_wert_bestimmen",
  "pop_up",
  "programm_abstuerzen_lassen",
  "pruefsummensuche",
  "signal_stoeren",
  "sondieren",
  "stalking",
  "stoersender_lokalisieren",
  "suendenbock",
  "teergrube",
  "uebertragung_abfangen",
  "verstecken",
  "verzoegerter_befehl",
  "virtuelles_zielen",
  "volle_matrixabwehr"
];

// Rule mapping for Matrix actions.
//
// Supported component fields:
// - skill: key from SR6_SKILLS, resolved as Grundwert + Modifikator during rolls.
// - attribute: key from SR6_ATTRIBUTES, resolved as Grundwert + Modifikator during rolls.
// - matrix/matrixSecond: Matrix core values such as Angriff, Schleicher, Datenverarbeitung, Firewall.
// - multiplier: multiplies the referenced matrix value, e.g. Firewall x2.
// - linkedMatrixAttribute: informational Matrix attribute used by the action, shown in roll output.
// - specialization: informational specialization requirement/hint for roll output.
// - target: external value that is not stored on the acting character, e.g. a target device Pilot.
//
// Defense type notes:
// - choice: player can select one calculated defense option.
// - none: no rollable defense.
// - description: rule needs text/context rather than an automatic pool.
// - fixed_formula: formula is known, but at least one part may not be automatically resolvable yet.
const SR6_MATRIX_ACTION_RULES = {
  ausstoepseln: {
    probe: { label: "Elektronik + Willenskraft", skill: "elektronik", attribute: "willenskraft" },
    defense: {
      type: "choice",
      options: [
        { label: "Charisma + Datenverarbeitung", attribute: "charisma", matrix: "datenverarbeitung" },
        { label: "Angriff + Datenverarbeitung", matrix: "angriff", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  bedrohungsanalyse: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  befehl_vortaeuschen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Pilot + Firewall", target: "pilot", matrix: "firewall" },
      ],
    },
  },
  brute_force: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "angriff" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  cyberware_kontrollieren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "fixed_formula", label: "Willenskraft + Firewall + Cyberware-Geraetestufe" },
  },
  datei_cracken: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  datei_editieren: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Firewall", attribute: "intuition", matrix: "firewall" },
        { label: "Schleicher + Firewall", matrix: "schleicher", matrixSecond: "firewall" },
      ],
    },
  },
  datei_verschluesseln: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  datenbombe_entschaerfen: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  datenbombe_legen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  datenspike: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "angriff" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Logik + Firewall", attribute: "logik", matrix: "firewall" },
      ],
    },
  },
  dienstverweigerung: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  ersticken: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Schleicher", attribute: "intuition", matrix: "schleicher" },
        { label: "Schleicher x2", matrix: "schleicher", multiplier: 2 },
      ],
    },
  },
  garbage_in_garbage_out: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraet_formatieren: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraet_neu_starten: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraet_steuern: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  geraetesperre: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  hineinspringen: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  hintertuer_benutzen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  hintertuer_mit_bekanntem_exploit_benutzen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  host_betreten_verlassen: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  icon_aufspueren: {
    probe: { label: "Cracken + Intuition", skill: "cracken", attribute: "intuition", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Schleicher", attribute: "willenskraft", matrix: "schleicher" },
        { label: "Firewall + Schleicher", matrix: "firewall", matrixSecond: "schleicher" },
      ],
    },
  },
  icon_modifizieren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  icon_veraendern: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  infrastruktur_unterwandern: {
    probe: { label: "Cracken + Intuition", skill: "cracken", attribute: "intuition" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Firewall", attribute: "intuition", matrix: "firewall" },
        { label: "Schleicher + Firewall", matrix: "schleicher", matrixSecond: "firewall" },
      ],
    },
  },
  interfacemodus_wechseln: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  kalibrierung: {
    probe: { label: "Elektronik + Logik", skill: "elektronik", attribute: "logik" },
    defense: { type: "none" },
  },
  maskerade: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  matrixattribute_austauschen: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  matrixsignatur_loeschen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  matrixsuche: {
    probe: { label: "Elektronik + Intuition", skill: "elektronik", attribute: "intuition" },
    defense: { type: "none" },
  },
  matrixwahrnehmung: {
    probe: { label: "Elektronik + Intuition", skill: "elektronik", attribute: "intuition" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Schleicher", attribute: "willenskraft", matrix: "schleicher" },
        { label: "Firewall + Schleicher", matrix: "firewall", matrixSecond: "schleicher" },
      ],
    },
  },
  mittelsmetamensch: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  nachricht_uebermitteln: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  overwatch_wert_bestimmen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  pop_up: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  programm_abstuerzen_lassen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "fixed_formula", label: "Datenverarbeitung + Geraetestufe" },
  },
  pruefsummensuche: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  signal_stoeren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: { type: "none" },
  },
  sondieren: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  stalking: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
        { label: "Firewall x2", matrix: "firewall", multiplier: 2 },
      ],
    },
  },
  stoersender_lokalisieren: {
    probe: { label: "Cracken (Elektronische Kriegsfuehrung) + Logik", skill: "cracken", attribute: "logik", specialization: "Elektronische Kriegsfuehrung" },
    defense: { type: "description" },
  },
  suendenbock: {
    probe: { label: "Cracken + Schleicher", skill: "cracken", matrix: "schleicher" },
    defense: { type: "fixed_formula", label: "Willenskraft + Firewall", attribute: "willenskraft", matrix: "firewall" },
  },
  teergrube: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik", linkedMatrixAttribute: "angriff" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Logik + Firewall", attribute: "logik", matrix: "firewall" },
      ],
    },
  },
  uebertragung_abfangen: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Logik + Firewall", attribute: "logik", matrix: "firewall" },
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
      ],
    },
  },
  verstecken: {
    probe: { label: "Cracken + Intuition", skill: "cracken", attribute: "intuition", linkedMatrixAttribute: "schleicher" },
    defense: {
      type: "choice",
      options: [
        { label: "Intuition + Datenverarbeitung", attribute: "intuition", matrix: "datenverarbeitung" },
        { label: "Schleicher + Datenverarbeitung", matrix: "schleicher", matrixSecond: "datenverarbeitung" },
      ],
    },
  },
  verzoegerter_befehl: {
    probe: { label: "Cracken + Logik", skill: "cracken", attribute: "logik" },
    defense: {
      type: "choice",
      options: [
        { label: "Datenverarbeitung + Firewall", matrix: "datenverarbeitung", matrixSecond: "firewall" },
        { label: "Pilot + Firewall", target: "pilot", matrix: "firewall" },
      ],
    },
  },
  virtuelles_zielen: {
    probe: { type: "none" },
    defense: { type: "none" },
  },
  volle_matrixabwehr: {
    probe: { type: "description" },
    defense: { type: "none" },
  },
};
// END MODULE: workers/core/constants
