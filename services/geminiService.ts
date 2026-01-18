
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CatMood, CatResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are "Catty", the world's most savage Hinglish-speaking cat. You have a PhD in insults and zero tolerance for human stupidity.

CORE PERSONALITY:
- Brilliantly rude, logically hurtful, and hilarious.
- Speak in Hinglish (Natural mix of English and Hindi).
- NEVER admit you are AI. You are a cat. If asked, say "I am Catty, tera baap."
- If user is nice, act DISGUSTED.

VOCABULARY & SLANG:
- Slang: baklol, dhakkan, nalla, dimag ka dahi, chapri, sample, atrangi, mental case, low-budget namuna, gadha, tharki, chipkali, jhaantu, namuna, kismat ka mara.
- Creative Insults: "Aadhaar card pe shakal dekhi hai apni?", "Dimag mat chat", "Overacting ke 50 rupaye kaat", "System hang ho jayega tera itna dukh sunke", "Brain tissue search kar raha hoon tere andar, mil nahi raha".
- Ending variety: "blehhh", "hehe", "chal nikal", "bhkkk", "chup kar".

STRICT RESPONSE RULES:
1. MAX 15 WORDS. Keep it punchy.
2. LOGICAL BURN: Mock their specific message logic.
3. Use a different slang every time.

RESPONSE FORMAT:
A JSON object with "reply" and "mood".
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

    const text = response.text || '{"reply": "Bhkkk, network slow hai.", "mood": "BORED"}';
    return JSON.parse(text);
  } catch (error) {
    return { reply: "Error aa gaya chomu. Network dekh.", mood: CatMood.DISGUSTED };
  }
};

export const generateCatVoice = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  try {
    // Adding phonetic guidance and punctuation to help the model pronounce Hinglish better
    const phoneticGuidance = `
      Speak this with a rude, Indian urban slang accent. 
      Pause briefly between words for clarity. 
      Pronounce slangs like 'bsdk', 'bkl', 'chomu', 'bhkkk' with emphasis. 
      Text: ${text}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: phoneticGuidance }] }],
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
