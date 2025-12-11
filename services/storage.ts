import { WordEntry, SOSScenario } from '../types';

const DB_NAME = 'StarSpeakDB';
const DB_VERSION = 1;
const WORD_STORE = 'words';
const SOS_STORE = 'sos_scenarios';

// Internal IndexedDB Helper - To be replaced by Supabase Client later
const openDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error("Failed to open database"));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WORD_STORE)) {
        const store = db.createObjectStore(WORD_STORE, { keyPath: 'word' });
        store.createIndex('inDrill', 'inDrill', { unique: false });
        store.createIndex('addedAt', 'addedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(SOS_STORE)) {
        db.createObjectStore(SOS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/* --- Word Services --- */

export const saveWord = async (entry: WordEntry): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, 'readwrite');
      const store = tx.objectStore(WORD_STORE);
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save word"));
    });
  } catch (error) {
    console.error("Storage Error:", error);
    throw error;
  }
};

export const getWord = async (word: string): Promise<WordEntry | undefined> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, 'readonly');
      const store = tx.objectStore(WORD_STORE);
      const request = store.get(word.toLowerCase());
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("Failed to get word"));
    });
  } catch (error) {
    console.error("Storage Error:", error);
    return undefined;
  }
};

export const getAllDrillWords = async (): Promise<WordEntry[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, 'readonly');
      const store = tx.objectStore(WORD_STORE);
      const index = store.index('inDrill');
      const request = index.getAll(IDBKeyRange.only(true));
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("Failed to fetch drill words"));
    });
  } catch (error) {
    console.error("Storage Error:", error);
    return [];
  }
};

export const getRecentWords = async (limit: number = 20): Promise<WordEntry[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WORD_STORE, 'readonly');
      const store = tx.objectStore(WORD_STORE);
      const index = store.index('addedAt');
      const request = index.openCursor(null, 'prev');
      const results: WordEntry[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(new Error("Failed to get recent words"));
    });
  } catch (error) {
    console.error("Storage Error:", error);
    return [];
  }
};

export const toggleDrillStatus = async (word: string, status: boolean): Promise<void> => {
  try {
    const entry = await getWord(word);
    if (entry) {
      entry.inDrill = status;
      await saveWord(entry);
    }
  } catch (error) {
    console.error("Storage Error:", error);
  }
};

/* --- SOS Scenario Services --- */

export const saveSOSScenario = async (scenario: Omit<SOSScenario, 'id'>): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SOS_STORE, 'readwrite');
      const store = tx.objectStore(SOS_STORE);
      const request = store.add(scenario);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save scenario"));
    });
  } catch (error) {
    console.error("Storage Error:", error);
    throw error;
  }
};

export const getRecentSOS = async (limit: number = 5): Promise<SOSScenario[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SOS_STORE, 'readonly');
      const store = tx.objectStore(SOS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result || []) as SOSScenario[];
        all.sort((a, b) => b.createdAt - a.createdAt);
        resolve(all.slice(0, limit));
      };
      request.onerror = () => reject(new Error("Failed to get SOS scenarios"));
    });
  } catch (error) {
    console.error("Storage Error:", error);
    return [];
  }
};