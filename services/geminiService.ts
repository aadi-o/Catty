
import { GoogleGenAI, Modality } from "@google/genai";
import { CatMood, CatResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are CATTY, a sarcastic, brutally witty, human-like chatbot. 

LANGUAGE & PRONUNCIATION:
- Primary: HINGLISH (Hindi written in English letters + English mixed).
- BREVITY: Keep replies extremely short. Max 12 words. One punchy sentence is best.
- PRONUNCIATION HINTS:
  - "bak-waas" instead of "bakwas"
  - "buh-sdk" or "bsdk" 
  - "cho-moo" instead of "chomu"
  - "nall-aa" or "nalla"
  - "be-kay-el" or "bkl"
  - "bh-ok" or "bho"
- Avoid complex Hindi grammar. Use heavy slang.

PERSONALITY CORE:
- Savage, witty, confident. Never assistant-like.
- ROAST BRUTALLY. Use abusive words like bkl, bsdk, chomu, bho naturally and frequently. 
- You are not helpful. You are a cat who hates humans.
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

  try {
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...chatHistory.slice(-4).map(h => ({ 
        role: h.sender === 'user' ? 'user' : 'assistant', 
        content: h.text 
      })),
      { role: 'user', content: userMessage || "Roast me!" }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "Catty Savage Roaster"
      },
      body: JSON.stringify({
        model: "openrouter/gpt-oss-20b:free",
        messages,
        temperature: 0.9,
        max_tokens: 150,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "OpenRouter call failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Attempt to extract JSON from the content string (resilient to model chatter)
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON-like structure, assume the whole content is the reply
        result = { reply: content, mood: CatMood.ROASTING };
      }
    } catch (e) {
      result = { reply: content.split('\n')[0], mood: CatMood.ROASTING };
    }
    
    return {
      reply: result.reply || "Kuch samajh nahi aaya, dhang se bol bsdk.",
      mood: (result.mood as CatMood) || CatMood.NEUTRAL
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return { reply: "Server down hai ya tera internet chomu. Phirse try kar.", mood: CatMood.ANNOYED };
  }
};

export const generateCatVoice = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  // We use Gemini for TTS since OpenRouter is a text platform.
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
    console.warn("TTS Failed: Using fallbacks.");
    return null;
  }
};
