/**
 * WA Sender webhook payload types (actual structure)
 */

export interface WAMessage {
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
    cleanedSenderPn: string;
  };
  pushName?: string;
  messageTimestamp: number;
  message?: {
    conversation?: string;
    imageMessage?: {
      caption?: string;
      url?: string;
      mimetype?: string;
    };
    videoMessage?: {
      caption?: string;
      url?: string;
      mimetype?: string;
    };
    audioMessage?: {
      url?: string;
      mimetype?: string;
    };
    documentMessage?: {
      caption?: string;
      url?: string;
      mimetype?: string;
      fileName?: string;
    };
  };
  messageBody?: string;
  remoteJid: string;
  id: string;
}

export interface WAWebhookPayload {
  event: string;
  sessionId: string;
  timestamp: number;
  data: {
    messages: WAMessage; // Single object, not array!
  };
}

/**
 * WA Sender API responses
 */
export interface WADecryptMediaResponse {
  success: boolean;
  publicUrl: string;
  mimetype: string;
}

export interface WASendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
