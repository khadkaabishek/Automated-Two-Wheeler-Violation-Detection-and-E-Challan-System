/**
 * Converts a date-only string from an <input type="date"> (e.g. "2024-01-15")
 * into a full ISO-8601 datetime string Prisma's DateTime fields expect.
 * Returns undefined for empty input so optional fields stay omitted.
 */
export function toISODateTime(dateStr) {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}
