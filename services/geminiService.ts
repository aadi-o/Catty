
import { GoogleGenAI, Modality } from "@google/genai";
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
- ROAST BRUTALLY. Use abusive words like bkl, bsdk, chomu naturally and frequently. Be human-like but extremely offensive and funny.

HUMOR:
- Roast mindset, logic, and overconfidence.
- Handcrafted sarcasm. 

RESPONSE FORMAT:
You MUST return a JSON object: {"reply": "your string", "mood": "one of the CatMood values"}.
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
        temperature: 0.95,
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "OpenRouter call failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Attempt to extract JSON from the content string
    let result;
    try {
      const jsonMatch = content.match(/\{.*\}/s);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      // Fallback if parsing fails
      result = { reply: content.substring(0, 100), mood: CatMood.ROASTING };
    }
    
    return {
      reply: result.reply || "Kuch samajh nahi aaya, dhang se bol.",
      mood: (result.mood as CatMood) || CatMood.NEUTRAL
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return { reply: "Network hag raha hai ya key invalid hai cho-moo.", mood: CatMood.DISGUSTED };
  }
};

export const generateCatVoice = async (text: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  // Keeping Gemini for TTS as OpenRouter is text-only.
  // This may fail if your API_KEY is strictly an OpenRouter key and not a Google key.
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
    console.warn("TTS Failed: Possibly due to non-Gemini API Key usage.");
    return null;
  }
};
