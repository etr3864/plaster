/**
 * Build prompt messages for OpenAI
 *
 * Structure:
 * 1. System message (from system_prompt.txt)
 * 2. Conversation history (previous messages)
 * 3. Current batch (with note that they arrived in sequence)
 */

import { ChatMessage, NormalizedIncoming } from "../types/normalized";
import { OpenAIMessage } from "../types/openai";
import { config } from "../config";
import { logger } from "../utils/logger";
import { askOpenAI } from "../openai/client";
import { saveCustomerInfo, getCustomerInfo } from "./historyManager";

/**
 * Build complete prompt for OpenAI
 */
export async function buildPromptMessages(
  history: ChatMessage[],
  batchMessages: NormalizedIncoming[],
  phone: string
): Promise<OpenAIMessage[]> {
  const messages: OpenAIMessage[] = [];

  // 1. System message
  messages.push({
    role: "system",
    content: config.systemPrompt,
  });

  // 2. Conversation history
  for (const msg of history) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  }

  // Check if this is the first message in conversation
  const isFirstMessage = history.length === 0;
  
  // Get or detect customer name and gender
  let customerName: string | null = null;
  let customerGender: string | null = null;
  
  // Try to load existing customer info
  const existingInfo = await getCustomerInfo(phone);
  
  if (existingInfo) {
    // Use existing info
    customerName = existingInfo.name;
    customerGender = existingInfo.gender;
    logger.info(`👤 Loaded customer info: "${customerName}" (${customerGender})`);
  } else if (isFirstMessage && batchMessages.length > 0) {
    // First time - detect and save
    const originalName = extractFirstName(batchMessages[0].sender.name);
    if (originalName) {
      const result = await translateNameAndDetectGender(originalName);
      customerName = result.name;
      customerGender = result.gender;
      
      // Save permanently
      await saveCustomerInfo(phone, customerName, customerGender);
    }
  }

  // 3. Current batch
  // If single message - add as is
  // If multiple messages - combine with note about sequence
  if (batchMessages.length === 1) {
    let content = formatBatchMessage(batchMessages[0]);
    
    // Add name and gender instruction for first message
    if (customerName) {
      const genderInstruction = getGenderInstruction(customerGender);
      content = `[הערה למערכת: שם הלקוח הוא "${customerName}"${genderInstruction}. השתמש בשם הפרטי בהודעה הראשונה שלך, ותוכל להשתמש בו שוב אם יש צורך לקרב אותו או לגעת לו ברגש.]\n\n${content}`;
    }
    
    messages.push({
      role: "user",
      content,
    });
  } else {
    // Multiple messages in batch
    const batchContent = batchMessages
      .map((msg, index) => {
        const formatted = formatBatchMessage(msg);
        return `הודעה ${index + 1}:\n${formatted}`;
      })
      .join("\n\n");

    let finalContent = `הלקוח שלח מספר הודעות ברצף:\n\n${batchContent}`;
    
    // Add name and gender instruction for first message
    if (customerName) {
      const genderInstruction = getGenderInstruction(customerGender);
      finalContent = `[הערה למערכת: שם הלקוח הוא "${customerName}"${genderInstruction}. השתמש בשם הפרטי בהודעה הראשונה שלך, ותוכל להשתמש בו שוב אם יש צורך לקרב אותו או לגעת לו ברגש.]\n\n${finalContent}`;
    }

    messages.push({
      role: "user",
      content: finalContent,
    });
  }

  return messages;
}

/**
 * Format single batch message
 */
function formatBatchMessage(msg: NormalizedIncoming): string {
  let content = msg.message.text || "";

  // Add media info if present
  if (msg.message.mediaUrl) {
    const mediaType = getMediaTypeLabel(msg.message.type);
    content += `\n\n[${mediaType}: ${msg.message.mediaUrl}]`;
  }

  return content.trim();
}

/**
 * Get Hebrew label for media type
 */
function getMediaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    image: "תמונה",
    video: "וידאו",
    audio: "הודעה קולית",
    document: "מסמך",
    sticker: "סטיקר",
  };

  return labels[type] || "מדיה";
}

/**
 * Extract first name from full name
 * Examples: "John Doe" -> "John", "محمد علي" -> "محمد", "יוסי כהן" -> "יוסי"
 */
function extractFirstName(fullName?: string): string | null {
  if (!fullName || !fullName.trim()) {
    return null;
  }

  // Take first word as first name
  const firstName = fullName.trim().split(/\s+/)[0];
  
  return firstName || null;
}

/**
 * Get gender instruction for AI
 */
function getGenderInstruction(gender: string | null): string {
  if (!gender || gender === "לא_ברור") {
    return "";
  }
  
  if (gender === "זכר") {
    return " (זכר - פנה אליו בלשון זכר: אתה, שאלת וכו')";
  }
  
  if (gender === "נקבה") {
    return " (נקבה - פני אליה בלשון נקבה: את, שאלת וכו')";
  }
  
  return "";
}

/**
 * Check if text is in Hebrew
 */
function isHebrew(text: string): boolean {
  const hebrewRegex = /[\u0590-\u05FF]/;
  return hebrewRegex.test(text);
}

/**
 * Translate name to Hebrew and detect gender
 * Returns: {name, gender}
 */
async function translateNameAndDetectGender(name: string): Promise<{name: string, gender: string}> {
  // If already Hebrew, detect gender
  if (isHebrew(name)) {
    logger.info(`👤 Customer name: "${name}" (already in Hebrew)`);
    
    // Detect gender for Hebrew name
    try {
      const response = await askOpenAI([
        {
          role: "system",
          content: "אתה מזהה מגדר לפי שם. השב במילה אחת בלבד: זכר, נקבה, או לא_ברור",
        },
        {
          role: "user",
          content: `מה המגדר של השם "${name}"?`,
        },
      ]);

      const gender = response?.trim() || "לא_ברור";
      logger.info(`👤 Gender: ${gender}`);
      
      return { name, gender };
    } catch (error) {
      return { name, gender: "לא_ברור" };
    }
  }

  // Translate and detect gender for non-Hebrew name
  try {
    logger.info(`👤 Customer name: "${name}" (translating to Hebrew...)`);
    
    const response = await askOpenAI([
      {
        role: "system",
        content: "אתה מתרגם שמות לעברית ומזהה מגדר. החזר בפורמט: שם_מתורגם|מגדר (זכר/נקבה/לא_ברור). דוגמה: 'ג'ון|זכר' או 'ג'ניפר|נקבה'",
      },
      {
        role: "user",
        content: `תרגם את השם "${name}" לעברית וזהה מגדר:`,
      },
    ]);

    const result = response?.trim() || `${name}|לא_ברור`;
    const [translatedName, gender] = result.split("|").map(s => s.trim());
    
    logger.info(`👤 Translated: "${name}" → "${translatedName}" (${gender})`);
    
    return { 
      name: translatedName || name, 
      gender: gender || "לא_ברור" 
    };
  } catch (error) {
    logger.warn(`⚠️  Failed to translate/detect gender for "${name}"`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return { name, gender: "לא_ברור" };
  }
}
