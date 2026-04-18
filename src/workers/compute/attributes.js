// BEGIN MODULE: workers/compute/attributes
function appendAttributeRequestKeys(requestKeys) {
  SR6_ATTRIBUTES.forEach((attributeName) => {
    requestKeys.push(`sr6_attr_${attributeName}_grundwert`);
    requestKeys.push(`sr6_attr_${attributeName}_modifikator`);
  });
}

function computeAttributeTotals(values, updates, totals) {
  SR6_ATTRIBUTES.forEach((attributeName) => {
    const baseKey = `sr6_attr_${attributeName}_grundwert`;
    const modifierKey = `sr6_attr_${attributeName}_modifikator`;
    const totalKey = `sr6_attr_${attributeName}_gesamtwert`;
    const total = parseNumber(values[baseKey]) + parseNumber(values[modifierKey]);

    totals[attributeName] = total;
    updates[totalKey] = String(total);
  });
}
// END MODULE: workers/compute/attributes
