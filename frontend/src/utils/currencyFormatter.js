/**
 * Shared utility for currency and financial number formatting (INR / ₹)
 */

export function formatCurrency(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
}

export function formatK(val) {
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}k`;
  }
  return `₹${val || 0}`;
}
