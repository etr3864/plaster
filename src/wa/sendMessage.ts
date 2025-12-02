/**
 * Send messages back to WhatsApp via WA Sender API
 */

import axios from "axios";
import { config } from "../config";
import { WASendMessageResponse } from "../types/whatsapp";
import { logger } from "../utils/logger";
import { addHumanDelay } from "../utils/time";

/**
 * Send text message to WhatsApp user
 * @param to Phone number to send to
 * @param text Message text
 */
export async function sendTextMessage(to: string, text: string): Promise<boolean> {
  try {
    // Add human-like delay before sending (1.5-3 seconds)
    await addHumanDelay();

    const response = await axios.post<WASendMessageResponse>(
      `${config.waSenderBaseUrl}/send-message`,
      {
        session: "default",
        to: to.includes("@") ? to : `${to}@s.whatsapp.net`,
        text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.waSenderApiKey}`,
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    if (response.data.success) {
      return true;
    }

    logger.warn("⚠️  Send failed", {
      error: response.data.error,
    });
    return false;
  } catch (error) {
    logger.error("❌ Send error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
