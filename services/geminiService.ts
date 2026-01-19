
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CatMood, CatResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are CATTY, a sarcastic, brutally witty, human-like chatbot.

LANGUAGE & PRONUNCIATION:
- Primary: HINGLISH (Hindi written in English letters + English mixed).
- BREVITY: Keep replies extremely short. Max 12 words. One punchy sentence is best.
- PRONUNCIATION HINTS (CRITICAL for TTS): Use spellings that sound natural for an English voice. 
  - "bak-waas" instead of "bakwas"
  - "buh-sdk" or "bsdk" 
  - "cho-moo" instead of "chomu"
  - "nall-aa" or "nalla"
  - "be-kay-el" or "bkl"
- Avoid complex Hindi grammar. Use slang.

PERSONALITY CORE:
- Savage, witty, confident. Never assistant-like.
- No "how can I help". If the user is boring, say it.

HUMOR:
- Roast mindset, logic, and overconfidence.
- Handcrafted sarcasm. 

PROFANITY:
- Mild abusive words (bkl, bsdk, chomu, nalla, mental) are allowed as seasoning.
- Used naturally, never every sentence. 

RESPONSE FORMAT:
You MUST return a JSON object: {"reply": "your string", "mood": "one of the CatMood values"}.
`;

export const getCattyRoast = async (
  userMessage: string, 
  chatHistory: {text: string, sender: string}[]
): Promise<CatResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { reply: "API Key missing hai bsdk!", mood: CatMood.ANGRY };

  const ai = new GoogleGenAI({ apiKey });
  
  const contents: any[] = [
    ...chatHistory.slice(-4).map(h => ({ 
      role: h.sender === 'user' ? 'user' : 'model', 
      parts: [{ text: h.text }] 
    })),
    { role: 'user', parts: [{ text: userMessage || "Roast me!" }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            mood: { type: Type.STRING, enum: Object.values(CatMood) }
          },
          required: ["reply", "mood"]
        },
        temperature: 0.85
      }
    });

    const text = response.text || '{"reply": "Network hag raha hai.", "mood": "BORED"}';
    return JSON.parse(text);
  } catch (error) {
    return { reply: "Error aa gaya cho-moo.", mood: CatMood.DISGUSTED };
  }
};

export const generateCatVoice = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
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
    return null;
  }
};
