import { GoogleGenAI, Type } from "@google/genai";
import { WordEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash';

// --- Lightning Lookup ---
export const aiLookupWord = async (word: string): Promise<WordEntry> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `
    Analyze the input: "${word}".
    
    Role: English Coach for Chinese students.
    
    1. **If Input is an English WORD or PHRASE** (e.g., "Resilience", "Piece of cake"):
       - word: Return the input word (corrected case).
       - phonetic: Provide IPA (e.g., /rɪˈzɪliəns/).
       - definition: Simple English definition.
       - translation_cn: **Strictly Simplified Chinese** translation (e.g., "n. 韧性，恢复力").
       - example: A short, daily-life sentence using it.

    2. **If Input is an English SENTENCE** (e.g., "I want to ask for a refund"):
       - word: Return the input sentence.
       - phonetic: "" (Empty string).
       - definition: Explain the key grammar point or keyword in **Simplified Chinese** (e.g., "Key: Refund (退款) - 礼貌的表达方式").
       - translation_cn: Translate the whole sentence into natural **Simplified Chinese**.
       - example: A natural response or variation of this sentence in English.

    3. **If Input is CHINESE** (e.g., "尴尬", "我想请假"):
       - Treat it as a reverse lookup.
       - word: The best English translation (Word, Phrase, or Sentence).
       - phonetic: IPA for the English translation (if it's a word/phrase).
       - definition: Explain the nuance of this English translation in **Simplified Chinese**.
       - translation_cn: The original Chinese input.
       - example: A sentence using the English translation.
    
    Output strictly valid JSON matching the schema.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          phonetic: { type: Type.STRING },
          definition: { type: Type.STRING },
          translation_cn: { type: Type.STRING },
          example: { type: Type.STRING },
        },
        required: ["word", "phonetic", "definition", "translation_cn", "example"],
      },
    },
  });

  const data = JSON.parse(response.text || '{}');
  
  return {
    word: data.word || word.trim(),
    phonetic: data.phonetic || '',
    definition: data.definition || '',
    translation_cn: data.translation_cn || '',
    example: data.example || '',
    addedAt: Date.now(),
    inDrill: true,
  };
};

// --- Scene SOS ---
export const aiSOSResponse = async (userQuery: string): Promise<{ native: string; explanation: string }> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `User wants to say this in English: "${userQuery}".
    Provide a "Native Option" (natural, colloquial, not textbook direct translation).
    Also provide a very brief explanation (under 10 words) of why this is better.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          native: { type: Type.STRING, description: "The natural English phrase" },
          explanation: { type: Type.STRING, description: "Why it is good" },
        },
        required: ["native", "explanation"],
      },
    },
  });

  return JSON.parse(response.text || '{"native": "Sorry, try again.", "explanation": "Error."}');
};

// --- Free Talk (Empathetic Listener) ---
export const getFreeTalkResponse = async (history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const chat = ai.chats.create({
    model: modelName,
    history: history,
    config: {
      systemInstruction: "You are an empathetic English conversation partner. You are kind, patient, and encouraging. You do not correct every mistake, but focus on keeping the conversation flowing. Keep your responses short (under 2 sentences) to encourage the user to speak more.",
    }
  });

  const lastMsg = history[history.length - 1].parts[0].text;
  const result = await chat.sendMessage({ message: lastMsg });
  return result.text || "";
};

// --- The Loop Drill (Strict Coach) ---
export const getDrillScenario = async (words: string[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Create a very short, single-turn roleplay scenario that forces the user to use one or more of these words: ${words.join(', ')}.
    Context: Daily life or Work.
    Output ONLY the setup line (e.g., "You are at a coffee shop. Ask the barista for a napkin.").`,
  });
  return response.text || "Tell me about your day.";
};

export const checkDrillResponse = async (scenario: string, userSaid: string): Promise<{ passed: boolean; feedback: string }> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Role: Strict English Coach.
    Scenario: ${scenario}
    User Said: "${userSaid}"
    
    Task: Evaluate ONLY two things:
    1. Did they make sense in context?
    2. Was it grammatically acceptable (ignoring minor slips)?
    
    If hesitant or very wrong, fail them. If okay, pass them.
    Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING, description: "Short, punchy feedback. If failed, command them to try again." },
        },
        required: ["passed", "feedback"],
      },
    },
  });
  return JSON.parse(response.text || '{"passed": false, "feedback": "System error. Try again."}');
};