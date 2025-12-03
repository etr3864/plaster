/**
 * Meeting Validation
 * Validates incoming meeting data
 */

import { IncomingMeeting } from "./types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate phone number format
 * Accepts Israeli format: 05XXXXXXXX or 972XXXXXXXXX
 */
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  
  // Israeli mobile: 05X-XXXXXXX (10 digits)
  // Or international: 972XXXXXXXXX
  return /^(05\d{8}|972\d{9})$/.test(cleaned);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(date)) {
    return false;
  }

  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Validate time format (HH:MM)
 */
function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Normalize phone number to standard format (05XXXXXXXX)
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");
  
  // Convert 972XXXXXXXXX to 05XXXXXXXX
  if (cleaned.startsWith("972")) {
    cleaned = "0" + cleaned.substring(3);
  }
  
  return cleaned;
}

/**
 * Validate incoming meeting data
 */
export function validateMeeting(data: Partial<IncomingMeeting>): ValidationResult {
  // Check required fields
  if (!data.customer_phone) {
    return { valid: false, error: "Missing required field: customer_phone" };
  }

  if (!data.meeting_date) {
    return { valid: false, error: "Missing required field: meeting_date" };
  }

  if (!data.meeting_time) {
    return { valid: false, error: "Missing required field: meeting_time" };
  }

  // Validate phone
  if (!isValidPhone(data.customer_phone)) {
    return { 
      valid: false, 
      error: "Invalid phone format. Expected: 05XXXXXXXX or 972XXXXXXXXX" 
    };
  }

  // Validate date
  if (!isValidDate(data.meeting_date)) {
    return { 
      valid: false, 
      error: "Invalid date format. Expected: YYYY-MM-DD" 
    };
  }

  // Validate time
  if (!isValidTime(data.meeting_time)) {
    return { 
      valid: false, 
      error: "Invalid time format. Expected: HH:MM" 
    };
  }

  // Check if date is not in the past
  const meetingDate = new Date(`${data.meeting_date}T${data.meeting_time}`);
  const now = new Date();
  
  if (meetingDate < now) {
    return { 
      valid: false, 
      error: "Meeting date/time cannot be in the past" 
    };
  }

  return { valid: true };
}

