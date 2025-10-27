/**
 * Local Authentication (AsyncStorage only)
 * No Firebase - Simple local storage authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalUser {
  uid: string;
  email: string;
  displayName: string;
}

const USERS_KEY = '@local_users';
const CURRENT_USER_KEY = '@current_user';

/**
 * Sign up with email and password (local only)
 */
export const signUp = async (email: string, password: string, displayName: string): Promise<LocalUser> => {
  try {
    // Get existing users
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, { password: string; user: LocalUser }> = usersJson ? JSON.parse(usersJson) : {};
    
    // Check if email already exists
    if (users[email]) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const newUser: LocalUser = {
      uid: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
    };
    
    // Store user
    users[email] = { password, user: newUser };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    console.log('✅ User signed up:', newUser.email);
    return newUser;
  } catch (error) {
    console.error('❌ Sign up error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password (local only)
 */
export const signIn = async (email: string, password: string): Promise<LocalUser> => {
  try {
    // Get existing users
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    const users: Record<string, { password: string; user: LocalUser }> = usersJson ? JSON.parse(usersJson) : {};
    
    // Check if user exists and password matches
    const userRecord = users[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Store current user
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userRecord.user));
    
    console.log('✅ User signed in:', userRecord.user.email);
    return userRecord.user;
  } catch (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    console.log('✅ User signed out');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<LocalUser | null> => {
  try {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return null;
  }
};

/**
 * Auth state listener
 */
export const onAuthStateChanged = (callback: (user: LocalUser | null) => void): (() => void) => {
  // Initial call
  getCurrentUser().then(callback);
  
  // Return unsubscribe function (no-op for local storage)
  return () => {};
};

