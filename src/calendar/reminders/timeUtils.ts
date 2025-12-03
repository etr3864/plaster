/**
 * Time Utilities for Meeting Reminders
 * Handles date/time calculations for reminder scheduling
 * 
 * IMPORTANT: All times are in Israel timezone (Asia/Jerusalem)
 * This handles DST (Daylight Saving Time) automatically
 */

import { toZonedTime, fromZonedTime } from "date-fns-tz";

const ISRAEL_TIMEZONE = "Asia/Jerusalem";

/**
 * Calculate difference between two dates in minutes
 * Returns positive if 'a' is after 'b'
 */
export function diffInMinutes(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 1000 / 60);
}

/**
 * Parse time string (HH:MM) and date (YYYY-MM-DD) to Date object in Israel timezone
 * Properly handles DST (Daylight Saving Time)
 * 
 * Example:
 * - Input: "15:50", "2025-12-03"
 * - Output: Date object representing 15:50 Israel time (converted to UTC internally)
 */
export function parseTimeToDate(time: string, date: string): Date {
  const [h, m] = time.split(":");
  const dateTimeString = `${date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
  
  // Convert Israel time to UTC (this handles DST automatically)
  return fromZonedTime(dateTimeString, ISRAEL_TIMEZONE);
}

/**
 * Get current time in Israel timezone
 * Use this instead of new Date() to ensure we're working with Israel time
 */
export function getNowInIsrael(): Date {
  return toZonedTime(new Date(), ISRAEL_TIMEZONE);
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

