import { WordEntry } from '../types';

const API_ENDPOINT = '/.netlify/functions/gemini-proxy';

// --- Lightning Lookup ---
export const aiLookupWord = async (word: string): Promise<WordEntry> => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'lookup', payload: { word } }),
  });

  if (!response.ok) {
    throw new Error('AI lookup failed');
  }

  const data = await response.json();
  
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
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sos', payload: { query: userQuery } }),
  });

  if (!response.ok) {
    return { native: "Sorry, try again.", explanation: "Error." };
  }

  return response.json();
};

// --- Free Talk (Empathetic Listener) ---
export const getFreeTalkResponse = async (history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  const lastMsg = history[history.length - 1].parts[0].text;
  
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'freetalk', 
      payload: { history, message: lastMsg } 
    }),
  });

  if (!response.ok) {
    return "Sorry, I couldn't process that. Please try again.";
  }

  const data = await response.json();
  return data.text || "";
};

// --- The Loop Drill (Strict Coach) ---
export const getDrillScenario = async (words: string[]): Promise<string> => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'drill-scenario', payload: { words } }),
  });

  if (!response.ok) {
    return "Tell me about your day.";
  }

  const data = await response.json();
  return data.scenario || "Tell me about your day.";
};

export const checkDrillResponse = async (scenario: string, userSaid: string): Promise<{ passed: boolean; feedback: string }> => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      action: 'drill-check', 
      payload: { scenario, userSaid } 
    }),
  });

  if (!response.ok) {
    return { passed: false, feedback: "System error. Try again." };
  }

  return response.json();
};
