/**
 * Generate the next integer identifier for an array of items.
 * @param {Array<object>} arr
 * @param {string} key
 * @returns {number}
 */
export function getNextId(arr, key) {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  return Math.max(...arr.map(i => Number(i[key] ?? 0))) + 1;
}

/**
 * Parse a potentially string boolean into a real boolean or undefined.
 * Accepts true/false/"true"/"false"/"1"/"0".
 * @param {any} v
 * @returns {boolean|undefined}
 */
export function parseBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    if (v.toLowerCase() === 'true' || v === '1') return true;
    if (v.toLowerCase() === 'false' || v === '0') return false;
  }
  return undefined;
}

/**
 * Coerce to integer if possible.
 * @param {any} v
 * @returns {number|undefined}
 */
export function toInt(v) {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? undefined : n;
}

