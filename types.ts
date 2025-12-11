export interface WordEntry {
  id?: number;
  word: string;
  phonetic: string;
  definition: string;
  translation_cn?: string; // New field for Chinese translation
  example: string;
  addedAt: number;
  inDrill: boolean;
}

export interface SOSScenario {
  id?: number;
  originalText: string;
  nativeExpression: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppRoute {
  HOME = '/',
  LOOKUP = '/lookup',
  DRILL = '/drill',
  TALK = '/talk',
}

// Helper type for Web Speech API which isn't fully typed in standard TS lib sometimes
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}