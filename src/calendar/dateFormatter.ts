/**
 * Date Formatter
 * Converts dates and times to natural Hebrew format
 */

/**
 * Hebrew day names
 */
const hebrewDays: Record<string, string> = {
  Sunday: "יום ראשון",
  Monday: "יום שני",
  Tuesday: "יום שלישי",
  Wednesday: "יום רביעי",
  Thursday: "יום חמישי",
  Friday: "יום שישי",
  Saturday: "שבת",
};

/**
 * Convert date (YYYY-MM-DD) to Hebrew day name
 * Example: "2025-12-03" -> "יום רביעי"
 */
function getHebrewDayName(dateString: string): string {
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const englishDay = dayNames[dayIndex];
  return hebrewDays[englishDay];
}

/**
 * Format date as Hebrew date
 * Example: "2025-12-03" -> "3.12.2025"
 */
function formatHebrewDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${parseInt(day)}.${parseInt(month)}.${year}`;
}

/**
 * Format time to natural Hebrew
 * Example: "15:50" -> "15:50"
 * Example: "09:30" -> "9:30"
 */
function formatHebrewTime(timeString: string): string {
  const [hour, minute] = timeString.split(":");
  return `${parseInt(hour)}:${minute}`;
}

/**
 * Convert date and time to natural Hebrew format
 * Example: "2025-12-03", "15:50" -> "ביום רביעי, 3.12.2025 בשעה 15:50"
 */
export function formatMeetingDateTime(date: string, time: string): string {
  const dayName = getHebrewDayName(date);
  const hebrewDate = formatHebrewDate(date);
  const hebrewTime = formatHebrewTime(time);

  return `ב${dayName}, ${hebrewDate} בשעה ${hebrewTime}`;
}

/**
 * Get first name from full name
 * Handles both Hebrew and English names
 * Example: "איתן טורגמן" -> "איתן"
 * Example: "Eytan Turgeman" -> "איתן" (if needed)
 */
export function getFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  
  // Split by whitespace
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 0) {
    return "לקוח";
  }

  // Return first part (first name)
  return parts[0];
}

