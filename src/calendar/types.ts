/**
 * Calendar & Meeting Types
 */

export interface IncomingMeeting {
  customer_name: string;
  customer_phone: string;
  meeting_date: string; // YYYY-MM-DD
  meeting_time: string; // HH:MM
}

export interface MeetingFlags {
  sentDayReminder: boolean;
  sentBeforeReminder: boolean;
}

export interface Meeting {
  phone: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  createdAt: number;
  flags?: MeetingFlags;
}

export interface MeetingResponse {
  status: "ok" | "error";
  message: string;
  data?: Meeting;
}

