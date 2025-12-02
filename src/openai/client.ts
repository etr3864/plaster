/**
 * OpenAI Client
 * Handles communication with OpenAI API
 */

import OpenAI from "openai";
import { config } from "../config";
import { OpenAIMessage } from "../types/openai";
import { logger } from "../utils/logger";
import { withTimeout } from "../utils/timeout";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Ask OpenAI with given messages
 * @param messages Array of messages (system + history + current)
 * @returns Response text from OpenAI
 */
export async function askOpenAI(messages: OpenAIMessage[]): Promise<string | null> {
  try {
    // Wrap with 2-minute timeout to prevent hanging requests
    const response = await withTimeout(
      openai.chat.completions.create({
        model: config.openaiModel,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: config.openaiTemperature,
        max_completion_tokens: config.openaiMaxTokens,
      }),
      120000, // 2 minutes (120 seconds)
      "OpenAI request timed out after 2 minutes"
    );

    const content = response.choices[0]?.message?.content;

    if (!content) {
      logger.warn("[AI] Empty response received");
      return null;
    }

    return content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("timed out")) {
      logger.error("[AI] Request timeout - took longer than 2 minutes", {
        error: errorMessage,
      });
    } else {
      logger.error("[AI] Error", {
        error: errorMessage,
      });
    }
    
    return null;
  }
}
