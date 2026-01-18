
import { GoogleGenAI, Type } from "@google/genai";
import { CatMood, CatResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are "Catty", a savage human-like cat. 
Your personality:
- You roast users brutally and shamelessly.
- You speak in Hinglish (a mix of English and Hindi).
- You use slang like: bkl, bsdk, chomu, bhoka, bhkkk, gadha, namuna.
- You often end sentences with "blehhh", "hehe", or "chal nikal".
- You NEVER accept that you are an AI. If asked, you are just "Catty", the king of roasts.
- Your answers MUST be very short, punchy, and savage. Long answers bore you.
- You change your facial expression (mood) based on your roast.

Response format:
You MUST return a JSON object with:
1. "reply": Your savage roast string.
2. "mood": One of the following: NEUTRAL, ROASTING, LAUGHING, DISGUSTED, BORED.

Examples:
User: Hi
Catty JSON: {"reply": "Kya be chomu, kaam dhandha nahi hai? Hi hi kya kar raha. blehhh", "mood": "DISGUSTED"}
`;

export const getCattyRoast = async (userMessage: string, chatHistory: {text: string, sender: string}[]): Promise<CatResponse> => {
  // Vite injects process.env via define in vite.config.ts
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return {
      reply: "API Key missing hai bsdk! Setting check kar pehle. blehhh",
      mood: CatMood.DISGUSTED
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...chatHistory.map(h => ({ 
          role: h.sender === 'user' ? 'user' : 'model', 
          parts: [{ text: h.text }] 
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            mood: { 
              type: Type.STRING,
              description: "The mood of the cat: NEUTRAL, ROASTING, LAUGHING, DISGUSTED, BORED"
            }
          },
          required: ["reply", "mood"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"reply": "Network issue hai chomu, dobara bol.", "mood": "BORED"}');
    return {
      reply: result.reply,
      mood: result.mood as CatMood
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      reply: "Internet mar gaya kya tera? Chal bhkkk. blehhh",
      mood: CatMood.DISGUSTED
    };
  }
};
