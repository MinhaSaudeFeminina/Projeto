import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * expo-secure-store ships no web implementation, so the browser build falls
 * back to localStorage. That is fine for the web preview used in development;
 * the native builds keep using the Keychain/Keystore.
 */
const webStorage = {
  getItem(key: string) {
    return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
  },
  setItem(key: string, value: string) {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  },
};

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const secureStorage =
  Platform.OS === 'web' ? webStorage : nativeStorage;
