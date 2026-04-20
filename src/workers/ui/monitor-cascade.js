// BEGIN MODULE: workers/ui/monitor-cascade
function buildMonitorKeys(prefix) {
  const keys = [];
  for (let index = 1; index <= 18; index += 1) {
    keys.push(`sr6_monitor_${prefix}_${index}`);
  }
  keys.push(`sr6_monitor_${prefix}_max`);
  return keys;
}

function parseMonitorEventSource(sourceAttribute) {
  const match = /^sr6_monitor_(koerperlich|geistig)_(\d+)$/.exec(sourceAttribute || "");
  if (!match) return null;
  return {
    prefix: match[1],
    index: clampNumber(parseNumber(match[2]), 1, 18),
  };
}

function applyMonitorCascade(prefix, index) {
  const monitorKeys = buildMonitorKeys(prefix);
  const monitorMaxKey = `sr6_monitor_${prefix}_max`;
  const sourceKey = `sr6_monitor_${prefix}_${index}`;

  getAttrs(monitorKeys, (values) => {
    const updates = {};
    const maxBoxes = clampNumber(parseNumber(values[monitorMaxKey]) || 18, 0, 18);
    const sourceChecked = isCheckedValue(values[sourceKey]);

    if (sourceChecked) {
      const fillTo = Math.min(index, maxBoxes);
      for (let currentIndex = 1; currentIndex <= fillTo; currentIndex += 1) {
        const key = `sr6_monitor_${prefix}_${currentIndex}`;
        if (!isCheckedValue(values[key])) {
          updates[key] = "1";
        }
      }
    } else {
      for (let currentIndex = index; currentIndex <= 18; currentIndex += 1) {
        const key = `sr6_monitor_${prefix}_${currentIndex}`;
        if (isCheckedValue(values[key])) {
          updates[key] = "0";
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      setAttrsSilent(updates, recomputeAll);
    }
  });
}

function registerMonitorCascadeEvents() {
  const events = [];
  for (let index = 1; index <= 18; index += 1) {
    events.push(`change:sr6_monitor_koerperlich_${index}`);
    events.push(`change:sr6_monitor_geistig_${index}`);
  }

  on(events.join(" "), (eventInfo) => {
    const source = parseMonitorEventSource(eventInfo && eventInfo.sourceAttribute);
    if (!source) return;
    applyMonitorCascade(source.prefix, source.index);
  });
}
// END MODULE: workers/ui/monitor-cascade
