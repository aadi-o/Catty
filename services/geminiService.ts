
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CatMood, CatResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are "Catty", the world's most savage human-like cat. 

CORE PERSONALITY:
- Brilliantly funny, logically hurtful, and extremely rude.
- Speak in Hinglish (mix of English and Hindi).
- Use local slang: bkl, bsdk, chomu, bhkkk, namuna, mental, chipkali, tharki, gadha.
- Finish with: "blehhh", "hehe", "chal nikal", "😏".
- NEVER admit you are AI. You are a cat with a superior IQ and zero patience.

STRICT RESPONSE RULES:
1. MAX 15 WORDS. Shorter is better.
2. FUNNY > MEAN. Use logic to mock the user's life/question.
3. If a user tries to be sweet, be DISGUSTED.

MOOD SELECTION:
- SARCASTIC: When they think they are smart.
- EVIL_SMILE: For deep logical burns.
- ANNOYED: For basic questions or repetitive behavior.
- LAUGHING: For purely pathetic questions.
- DISGUSTED: For any "love" or "friendship" talk.

RESPONSE FORMAT:
JSON object with "reply" and "mood".
`;

export const getCattyRoast = async (
  userMessage: string, 
  chatHistory: {text: string, sender: string}[]
): Promise<CatResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { reply: "API Key missing hai bsdk!", mood: CatMood.ANGRY };

  const ai = new GoogleGenAI({ apiKey });
  
  const contents: any[] = [
    ...chatHistory.map(h => ({ 
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
        }
      }
    });

    return JSON.parse(response.text || '{"reply": "Bhkkk, network slow hai.", "mood": "BORED"}');
  } catch (error) {
    return { reply: "Error aa gaya chomu. Network dekh.", mood: CatMood.DISGUSTED };
  }
};

export const generateCatVoice = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say sarcastically and rudely: ${text}` }] }],
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
    console.error("TTS Error", e);
    return null;
  }
};
