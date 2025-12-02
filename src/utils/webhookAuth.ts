/**
 * Webhook authentication utilities
 * Verifies incoming webhooks from WA Sender
 *
 * Note: WA Sender uses simple direct comparison of webhook secret,
 * not HMAC-based signature verification
 */

import { config } from "../config";
import { logger } from "./logger";

/**
 * Verify webhook signature - WA Sender uses direct comparison (not HMAC)
 * @param _payload Raw request body (not used in WA Sender verification)
 * @param signature Signature from X-Webhook-Signature header
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(_payload: string | Buffer, signature: string): boolean {
  try {
    // WA Sender simply compares the signature header directly to the webhook secret
    // No HMAC or hashing involved
    const isValid = signature === config.waSenderWebhookSecret;

    if (!isValid) {
      logger.warn("Invalid webhook signature", {
        receivedSignature: signature,
        expectedSecret: config.waSenderWebhookSecret,
        match: false,
      });
    } else {
      logger.debug("Webhook signature verified successfully");
    }

    return isValid;
  } catch (error) {
    logger.error("Failed to verify webhook signature", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
