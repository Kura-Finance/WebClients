/**
 * Secure Token Storage
 * Uses expo-secure-store to store authentication tokens securely
 * on iOS (Keychain) and Android (Secure Enclave)
 * 
 * Reference: https://docs.expo.dev/versions/latest/sdk/securestore/
 */

import * as SecureStore from 'expo-secure-store';
import Logger from './Logger';

const AUTH_TOKEN_KEY = 'kura.secure.auth.token';

/**
 * Store authentication token securely
 * iOS: Uses Keychain
 * Android: Uses Android Keystore
 */
export const setSecureAuthToken = async (token: string): Promise<void> => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: must be a non-empty string');
    }

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    Logger.info('SecureTokenStorage', '✅ Auth token saved to Secure Storage successfully', {
      tokenLength: token.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('SecureTokenStorage', '❌ Failed to save token to Secure Storage', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : typeof error,
      suggestion: 'Check device storage permissions or Secure Store availability',
    });
    throw new Error('Failed to persist authentication token securely');
  }
};

/**
 * Retrieve authentication token from secure storage
 */
export const getSecureAuthToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (token) {
      Logger.debug('SecureTokenStorage', '✅ Auth token retrieved from Secure Storage', {
        tokenLength: token.length,
      });
    } else {
      Logger.debug('SecureTokenStorage', '⚪ No auth token found in Secure Storage');
    }
    return token;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('SecureTokenStorage', '❌ Failed to retrieve token from Secure Storage', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : typeof error,
      suggestion: 'Check device storage permissions or Secure Store availability',
    });
    return null;
  }
};

/**
 * Clear authentication token from secure storage
 */
export const clearSecureAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    Logger.info('SecureTokenStorage', '✅ Auth token cleared from Secure Storage');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.warn('SecureTokenStorage', '⚠️ Failed to clear token from Secure Storage', {
      error: errorMessage,
      suggestion: 'Token may not exist or device permissions may be restricted',
    });
    // Don't throw - clearing a non-existent token is not an error
  }
};

/**
 * Check if secure storage is available
 * Useful for debugging or providing user feedback
 */
export const isSecureStorageAvailable = async (): Promise<boolean> => {
  try {
    // Try to set and get a test value
    const testKey = 'kura.secure.test';
    await SecureStore.setItemAsync(testKey, 'test');
    await SecureStore.deleteItemAsync(testKey);
    Logger.debug('SecureTokenStorage', 'Secure Storage is available');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error('SecureTokenStorage', 'Secure Storage is NOT available', {
      error: errorMessage,
    });
    return false;
  }
};
