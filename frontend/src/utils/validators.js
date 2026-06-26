// Lightweight client-side validators — instant feedback before the request hits the API.
// The backend re-validates everything authoritatively; these mirror those rules for UX.

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
export const isPincode = (v) => /^[0-9]{4,6}$/.test(String(v || '').trim());
export const isMobile = (v) => /^[6-9][0-9]{9}$/.test(String(v || '').replace(/[\s+]/g, '').replace(/^91/, ''));
export const minLen = (v, n) => String(v || '').length >= n;
export const required = (v) => String(v || '').trim().length > 0;

/**
 * Run a map of { fieldLabel: errorMessageOrNull } and return the first error, or null if all pass.
 * Usage: firstError({ 'Email': isEmail(x) ? null : 'Enter a valid email', ... })
 */
export const firstError = (checks) => Object.values(checks).find(Boolean) || null;

/** Pull a human-readable message out of an axios error, preferring server field-level errors. */
export const apiErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors)[0];
    if (first) return first;
  }
  return data?.message || err?.message || fallback;
};
