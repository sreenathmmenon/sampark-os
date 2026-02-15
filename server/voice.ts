/**
 * SAMPARK-OS Voice Service
 *
 * Integrates with Sarvam AI for Indic voice transcription and synthesis
 * Supports Malayalam, Hindi, and Kannada
 */

import axios from "axios";
import FormData from "form-data";

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || "";
const SARVAM_BASE_URL = "https://api.sarvam.ai";

interface TranscriptionResponse {
  text: string;
  textEnglish: string;
  language: string;
  confidence: number;
}

interface SynthesisResponse {
  audioContent: string; // Base64 encoded audio
}

interface AuctionCommand {
  species?: string;
  weight_kg?: number;
  deadline?: string;
  action: "start_auction" | "unknown";
}

/**
 * Transcribe Malayalam/Hindi/Kannada audio to text
 */
export async function transcribeVoice(
  audioBase64: string,
  language: "ml-IN" | "hi-IN" | "kn-IN" = "ml-IN"
): Promise<TranscriptionResponse> {
  if (!SARVAM_API_KEY) {
    console.warn("Sarvam API key not configured. Using mock transcription.");
    return {
      text: "നാല്പത് കിലോ കരിമീൻ. മൂന്ന് മണി മുമ്പ് എത്താണം.",
      textEnglish: "Forty kilos of karimeen. Must arrive before 3 o'clock.",
      language: "ml-IN",
      confidence: 0.95,
    };
  }

  try {
    // Sarvam requires multipart/form-data with file upload
    // Convert base64 to buffer
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
    const audioBuffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append("file", audioBuffer, { filename: "audio.wav", contentType: "audio/wav" });
    formData.append("model", "saaras:v3");
    if (language) {
      formData.append("language_code", language);
    }

    const response = await axios.post(
      `${SARVAM_BASE_URL}/speech-to-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "api-subscription-key": SARVAM_API_KEY,
        },
        timeout: 30000,
      }
    );

    const malayalamText = response.data.transcript;
    const englishText = await translateText(malayalamText, language);

    return {
      text: malayalamText,
      textEnglish: englishText,
      language: response.data.language_code || language,
      confidence: response.data.confidence || 0.9,
    };
  } catch (error: any) {
    console.error("[Voice] Transcription error:", error.message);
    throw new Error("Failed to transcribe voice");
  }
}

/**
 * Synthesize Malayalam/Hindi/Kannada text to speech
 */
export async function synthesizeVoice(
  text: string,
  language: "ml-IN" | "hi-IN" | "kn-IN" = "ml-IN",
  voice: "male" | "female" = "male"
): Promise<string> {
  if (!SARVAM_API_KEY) {
    console.warn("Sarvam API key not configured. Using mock synthesis.");
    // Return empty base64 (would be actual audio in production)
    return "";
  }

  try {
    const response = await axios.post(
      `${SARVAM_BASE_URL}/text-to-speech`,
      {
        text,
        target_language_code: language,
        speaker: voice === "male" ? "mani" : "priya",
        model: "bulbul:v3",
        pace: 1.0,
      },
      {
        headers: {
          "api-subscription-key": SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    // Response format: { audios: [base64_string] }
    return response.data.audios?.[0] || response.data.audio || "";
  } catch (error: any) {
    console.error("[Voice] Synthesis error:", error.message);
    throw new Error("Failed to synthesize voice");
  }
}

/**
 * Translate Indic text to English
 */
export async function translateText(
  text: string,
  sourceLanguage: "ml-IN" | "hi-IN" | "kn-IN" = "ml-IN"
): Promise<string> {
  if (!SARVAM_API_KEY) {
    console.warn("Sarvam API key not configured. Skipping translation.");
    return text;
  }

  try {
    const response = await axios.post(
      `${SARVAM_BASE_URL}/translate`,
      {
        input: text,
        source_language_code: sourceLanguage,
        target_language_code: "en-IN",
        speaker_gender: "Male",
        mode: "formal",
        model: "mayura:v1",
        enable_preprocessing: false,
      },
      {
        headers: {
          "api-subscription-key": SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return response.data.translated_text || text;
  } catch (error: any) {
    console.error("[Voice] Translation error:", error.message);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Parse Malayalam voice command into auction parameters
 *
 * Example inputs:
 * - "നാല്പത് കിലോ കരിമീൻ. മൂന്ന് മണി മുമ്പ് എത്താണം."
 *   (40 kg Karimeen. Must dock before 3 PM.)
 * - "ഇരുപത്തഞ്ച് കിലോ ചൂര. ഓക്ഷൻ തുടങ്ങുക."
 *   (25 kg Seer fish. Start auction.)
 */
export function parseVoiceCommand(malayalamText: string): AuctionCommand {
  const text = malayalamText.toLowerCase();

  // Extract weight (numbers in Malayalam or English)
  const weightMatch = text.match(/(\d+)\s*(?:കിലോ|kg|കിലോഗ്രാം)/);
  const weight_kg = weightMatch ? parseInt(weightMatch[1], 10) : undefined;

  // Extract species (common Kerala fish names in Malayalam)
  let species: string | undefined;
  if (text.includes("കരിമീൻ")) species = "karimeen";
  else if (text.includes("ചൂര")) species = "seer_fish";
  else if (text.includes("നെയ്മീൻ")) species = "king_fish";
  else if (text.includes("കൂര")) species = "anchovy";
  else if (text.includes("മത്തി")) species = "sardine";
  else if (text.includes("കോഞ്ച്") || text.includes("ചെമ്മീൻ")) species = "prawn";
  else if (text.includes("ചൂള")) species = "tuna";
  else if (text.includes("പാള")) species = "mackerel";

  // Extract deadline/time
  let deadline: string | undefined;
  if (text.includes("മൂന്ന് മണി") || text.includes("3")) deadline = "15:00";
  else if (text.includes("രണ്ട് മണി") || text.includes("2")) deadline = "14:00";
  else if (text.includes("നാല് മണി") || text.includes("4")) deadline = "16:00";

  // Determine action
  const action =
    text.includes("ഓക്ഷൻ") || text.includes("auction") || text.includes("തുടങ്ങ")
      ? "start_auction"
      : "unknown";

  return {
    species,
    weight_kg,
    deadline,
    action: action as any,
  };
}

/**
 * Generate Malayalam voice response for deal confirmation
 */
export function generateMalayalamResponse(netProfit: number, buyerName: string): string {
  // "സമ്മതം. നെറ്റ് ലാഭം [amount] രൂപ. [buyer] മായി കരാർ ഉറപ്പിച്ചു."
  // "Deal confirmed. Net profit [amount] rupees. Contract secured with [buyer]."

  const amountInWords = convertNumberToMalayalam(netProfit);
  return `സമ്മതം. നെറ്റ് ലാഭം ${amountInWords} രൂപ. ${buyerName} മായി കരാർ ഉറപ്പിച്ചു.`;
}

/**
 * Convert number to Malayalam words (simplified - for demo)
 */
function convertNumberToMalayalam(num: number): string {
  // Simplified: Just use numerals with comma formatting
  return num.toLocaleString("en-IN");
}
