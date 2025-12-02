/**
 * Centralized logging utility
 * All logs are in English, structured, and consistent
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

// Check if DEBUG mode is enabled
const isDebugMode = process.env.DEBUG === "true";

export interface LogParams {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export function log({ level, message, context }: LogParams): void {
  // Skip DEBUG logs unless DEBUG mode is enabled
  if (level === "DEBUG" && !isDebugMode) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };

  // For now - console.log, in the future can send to logging system
  console.log(JSON.stringify(payload));
}

// Convenience functions
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log({ level: "DEBUG", message, context }),

  info: (message: string, context?: Record<string, unknown>) =>
    log({ level: "INFO", message, context }),

  warn: (message: string, context?: Record<string, unknown>) =>
    log({ level: "WARN", message, context }),

  error: (message: string, context?: Record<string, unknown>) =>
    log({ level: "ERROR", message, context }),
};
