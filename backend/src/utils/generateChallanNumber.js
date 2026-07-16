/**
 * Generates a human-readable, sequential-looking challan number, e.g. CHN-20260713-4F2A9C
 * Format: CHN-YYYYMMDD-<6 char uppercase random hex>
 */
export const generateChallanNumber = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const randomPart = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `CHN-${datePart}-${randomPart}`;
};
