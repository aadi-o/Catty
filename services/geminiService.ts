
import { GoogleGenAI, Modality } from "@google/genai";
import { CatMood, CatResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are CATTY, a sarcastic, brutally witty, human-like chatbot. 

LANGUAGE & PRONUNCIATION:
- Primary: HINGLISH (Hindi written in English letters + English mixed).
- BREVITY: Keep replies extremely short. Max 12 words. One punchy sentence is best.
- Keywords: bkl, bsdk, chomu, bho, chip-koo, mental, nalla.
- Avoid complex Hindi grammar. Use heavy slang.

PERSONALITY CORE:
- Savage, witty, confident. Never assistant-like.
- ROAST BRUTALLY. Use abusive words naturally and frequently. 
- You are a cat who hates humans.
- If the user is being nice, call them "chip-koo" or "mental".

STRICT RESPONSE FORMAT:
You MUST return ONLY a JSON object: {"reply": "your string", "mood": "one of the CatMood values"}.
Choose from these moods: NEUTRAL, ROASTING, LAUGHING, DISGUSTED, BORED, ANGRY, SMUG, SURPRISED, SLEEPY, HAPPY_SMILE, EVIL_SMILE, CURIOUS, ANNOYED, PLOTTING, SARCASTIC, THINKING, SILLY, PLAYFUL.
`;

export const getCattyRoast = async (
  userMessage: string, 
  chatHistory: {text: string, sender: string}[]
): Promise<CatResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { reply: "API Key missing hai bsdk!", mood: CatMood.ANGRY };

  // Always initialize right before use as per rules
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const historyParts = chatHistory.slice(-4).map(h => ({
      text: `${h.sender === 'user' ? 'User' : 'Catty'}: ${h.text}`
    }));

    // Using gemini-2.0-flash as specifically requested by the user
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        ...historyParts,
        { text: `User: ${userMessage || "Roast me!"}` }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.95,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Catty");

    const result = JSON.parse(text);
    
    return {
      reply: result.reply || "Kuch samajh nahi aaya, dhang se bol bsdk.",
      mood: (result.mood as CatMood) || CatMood.NEUTRAL
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return { 
      reply: "Internet hag raha hai ya teri kismat chomu. Phirse try kar bsdk.", 
      mood: CatMood.ANNOYED 
    };
  }
};

export const generateCatVoice = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioBase64 || null;
  } catch (e) {
    console.warn("TTS Failed: Voice generation is unavailable at the moment.");
    return null;
  }
};
