// BEGIN MODULE: workers/core/guards
function setAttrsSilent(payload, callback) {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (Object.keys(payload).length === 0) {
    return;
  }
  if (typeof callback === "function") {
    setAttrs(payload, { silent: true }, callback);
    return;
  }
  setAttrs(payload, { silent: true });
}
// END MODULE: workers/core/guards
