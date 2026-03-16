import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  ROLE: 'mentorsir:role',
  PROFILE: 'mentorsir:profile',
  LOGS: 'mentorsir:logs',
  SCHEDULE: 'mentorsir:schedule',
  TESTS: 'mentorsir:tests',
  STUDENTS: 'mentorsir:students',
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — ignore
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Zustand persist storage adapter
export const zustandStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};
