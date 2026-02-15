/**
 * SAMPARK-OS Omnichannel Integration
 *
 * Integrates WhatsApp Business API (via Twilio) and Telegram Bot API
 * for real-time buyer communication and liquidation broadcasts.
 */

import twilio from "twilio";
import TelegramBot from "node-telegram-bot-api";

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const telegramBot = process.env.TELEGRAM_BOT_TOKEN
  ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  : null;

const WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL_ID || "";

/**
 * Send WhatsApp message to a buyer
 */
export async function sendWhatsAppMessage(
  buyerPhone: string,
  message: string
): Promise<boolean> {
  if (!twilioClient) {
    console.warn("Twilio not configured. Simulating WhatsApp message.");
    console.log(`[WhatsApp Simulation] To ${buyerPhone}: ${message}`);
    return true;
  }

  try {
    const formattedPhone = buyerPhone.startsWith("whatsapp:")
      ? buyerPhone
      : `whatsapp:${buyerPhone}`;

    await twilioClient.messages.create({
      from: WHATSAPP_NUMBER,
      to: formattedPhone,
      body: message,
    });

    console.log(`[WhatsApp] Message sent to ${buyerPhone}`);
    return true;
  } catch (error: any) {
    console.error(`[WhatsApp] Failed to send message to ${buyerPhone}:`, error.message);
    return false;
  }
}

/**
 * Generic Telegram channel broadcast
 */
export async function broadcastTelegramChannel(message: string): Promise<boolean> {
  if (!telegramBot || !TELEGRAM_CHANNEL) {
    console.warn("Telegram not configured. Simulating channel broadcast.");
    console.log(`[Telegram Simulation] ${message}`);
    return true;
  }

  try {
    await telegramBot.sendMessage(TELEGRAM_CHANNEL, message, {
      parse_mode: "Markdown",
    });

    console.log(`[Telegram] Channel broadcast sent to ${TELEGRAM_CHANNEL}`);
    return true;
  } catch (error: any) {
    console.error(`[Telegram] Channel broadcast failed:`, error.message);
    return false;
  }
}

/**
 * Send liquidation broadcast to Telegram channel
 */
export async function broadcastTelegramLiquidation(
  species: string,
  weightKg: number,
  pricePerKg: number,
  deadline: string
): Promise<boolean> {
  const message = `
🚨 *LIQUIDATION FLASH SALE* 🚨

🐟 Species: *${species}*
⚖️ Weight: *${weightKg}kg*
💰 Price: *₹${pricePerKg}/kg*
⏰ Deadline: *${deadline}*

Bulk buyers: Reply with "BUY" to secure this catch!

_Powered by Sampark-OS_
  `.trim();

  return broadcastTelegramChannel(message);
}

/**
 * Send Telegram message to a specific buyer
 */
export async function sendTelegramMessage(
  chatId: string | number,
  message: string
): Promise<boolean> {
  if (!telegramBot) {
    console.warn("Telegram not configured. Simulating message.");
    console.log(`[Telegram Simulation] To ${chatId}: ${message}`);
    return true;
  }

  try {
    await telegramBot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
    });

    console.log(`[Telegram] Message sent to ${chatId}`);
    return true;
  } catch (error: any) {
    console.error(`[Telegram] Failed to send message to ${chatId}:`, error.message);
    return false;
  }
}

/**
 * Send SMS fallback (for offline sync)
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  if (!twilioClient) {
    console.warn("Twilio not configured. Simulating SMS.");
    console.log(`[SMS Simulation] To ${phoneNumber}: ${message}`);
    return true;
  }

  try {
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const smsNumber = process.env.TWILIO_SMS_NUMBER;

    if (!messagingServiceSid && !smsNumber) {
      throw new Error("Neither TWILIO_MESSAGING_SERVICE_SID nor TWILIO_SMS_NUMBER configured");
    }

    const messageOptions: any = {
      to: phoneNumber,
      body: message,
    };

    // Prefer MessagingServiceSid over from number
    if (messagingServiceSid) {
      messageOptions.messagingServiceSid = messagingServiceSid;
    } else {
      messageOptions.from = smsNumber;
    }

    await twilioClient.messages.create(messageOptions);

    console.log(`[SMS] Message sent to ${phoneNumber}`);
    return true;
  } catch (error: any) {
    console.error(`[SMS] Failed to send SMS to ${phoneNumber}:`, error.message);
    return false;
  }
}

/**
 * Process incoming WhatsApp webhook
 */
export function parseWhatsAppIncoming(body: any): {
  from: string;
  message: string;
  buyerId?: string;
} | null {
  try {
    const from = body.From || "";
    const message = body.Body || "";

    if (!from || !message) return null;

    // Extract buyer ID from phone number (last 4 digits)
    const buyerId = from.replace(/\D/g, "").slice(-4);

    return { from, message, buyerId };
  } catch (error) {
    console.error("[WhatsApp] Failed to parse incoming message:", error);
    return null;
  }
}

/**
 * Process incoming Telegram webhook
 */
export function parseTelegramIncoming(update: any): {
  chatId: string | number;
  message: string;
  username?: string;
} | null {
  try {
    const chatId = update.message?.chat?.id;
    const message = update.message?.text || "";
    const username = update.message?.from?.username;

    if (!chatId || !message) return null;

    return { chatId, message, username };
  } catch (error) {
    console.error("[Telegram] Failed to parse incoming update:", error);
    return null;
  }
}

/**
 * Get Telegram Bot instance for webhook setup
 */
export function getTelegramBot(): TelegramBot | null {
  return telegramBot;
}
