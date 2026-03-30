// The user's local timezone for scheduling digests
export const USER_TIMEZONE = "America/Chicago";

/**
 * Get the current date in the user's timezone (YYYY-MM-DD format).
 * Used for digest storage keys to ensure consistency with local-time scheduling.
 */
export function getTodayInUserTZ(): string {
  return getDateInUserTZ();
}

/**
 * Get a date in the user's timezone (YYYY-MM-DD format).
 * Accepts an explicit date so callers can iterate across local calendar days.
 */
export function getDateInUserTZ(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: USER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Get the current hour in the user's timezone (0-23).
 * Used to determine which digest period is active.
 */
export function getCurrentHourInUserTZ(): number {
  return getHourInUserTZ();
}

/**
 * Get the hour for a specific instant in the user's timezone (0-23).
 */
export function getHourInUserTZ(date = new Date()): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: USER_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(date);
  // "en-US" with hour12: false returns "24" for midnight; normalize to 0
  const hour = parseInt(formatted, 10);
  return hour === 24 ? 0 : hour;
}
