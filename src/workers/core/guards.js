// BEGIN MODULE: workers/core/guards
function setAttrsSilent(payload) {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (Object.keys(payload).length === 0) {
    return;
  }
  setAttrs(payload, { silent: true });
}
// END MODULE: workers/core/guards
