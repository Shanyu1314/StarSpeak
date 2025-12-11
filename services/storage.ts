import { WordEntry, SOSScenario } from '../types';

const DB_NAME = 'StarSpeakDB';
const DB_VERSION = 1;
const WORD_STORE = 'words';
const SOS_STORE = 'sos_scenarios';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(WORD_STORE)) {
        const store = db.createObjectStore(WORD_STORE, { keyPath: 'word' }); // Use word as key to prevent dupes
        store.createIndex('inDrill', 'inDrill', { unique: false });
        store.createIndex('addedAt', 'addedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(SOS_STORE)) {
        db.createObjectStore(SOS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveWord = async (entry: WordEntry): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORD_STORE, 'readwrite');
    const store = tx.objectStore(WORD_STORE);
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getWord = async (word: string): Promise<WordEntry | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORD_STORE, 'readonly');
    const store = tx.objectStore(WORD_STORE);
    const request = store.get(word.toLowerCase());
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllDrillWords = async (): Promise<WordEntry[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORD_STORE, 'readonly');
    const store = tx.objectStore(WORD_STORE);
    const index = store.index('inDrill');
    const request = index.getAll(IDBKeyRange.only(true));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getRecentWords = async (limit = 20): Promise<WordEntry[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WORD_STORE, 'readonly');
    const store = tx.objectStore(WORD_STORE);
    const index = store.index('addedAt');
    // Open cursor in reverse direction (prev) to get newest first
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
    request.onerror = () => reject(request.error);
  });
};

export const toggleDrillStatus = async (word: string, status: boolean): Promise<void> => {
  const entry = await getWord(word);
  if (entry) {
    entry.inDrill = status;
    await saveWord(entry);
  }
};

export const saveSOSScenario = async (scenario: Omit<SOSScenario, 'id'>): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SOS_STORE, 'readwrite');
    const store = tx.objectStore(SOS_STORE);
    const request = store.add(scenario);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getRecentSOS = async (limit = 5): Promise<SOSScenario[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SOS_STORE, 'readonly');
    const store = tx.objectStore(SOS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as SOSScenario[];
      // Sort by latest (descending ID usually works for autoIncrement, but filtering by time is safer)
      all.sort((a, b) => b.createdAt - a.createdAt);
      resolve(all.slice(0, limit));
    };
    request.onerror = () => reject(request.error);
  });
};