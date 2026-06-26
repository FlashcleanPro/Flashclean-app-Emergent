// Supabase client for the FlashClean Client App.
// Uses the publishable (anon) key only — RLS protects access.
// Native storage uses expo-secure-store + AsyncStorage (LargeSecureStore)
// to avoid SecureStore's 2 KB limit on tokens.

import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
}

const cryptoRandom = (): Uint8Array => {
  const out = new Uint8Array(32);
  const g: any = globalThis as any;
  if (g.crypto?.getRandomValues) {
    g.crypto.getRandomValues(out);
  } else {
    for (let i = 0; i < out.length; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
};

class LargeSecureStore {
  async setItem(key: string, value: string) {
    const encryptionKey = cryptoRandom();
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encrypted));
  }
  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    const keyHex = await SecureStore.getItemAsync(key);
    if (!keyHex) return null;
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(keyHex),
      new aesjs.Counter(1),
    );
    const decrypted = cipher.decrypt(aesjs.utils.hex.toBytes(encrypted));
    return aesjs.utils.utf8.fromBytes(decrypted);
  }
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
}

const webStorage = {
  getItem: async (k: string) =>
    typeof window === "undefined" ? null : window.localStorage.getItem(k),
  setItem: async (k: string, v: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(k, v);
  },
  removeItem: async (k: string) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(k);
  },
};

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : (new LargeSecureStore() as any),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
  realtime: { params: { eventsPerSecond: 5 } },
});
