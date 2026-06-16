import { supabase } from './supabase';

// Types for our auth functions
export interface User {
  id: string;
  email: string;
  role?: 'client' | 'admin'; // Assuming we have a role column in the users table
  // Add other fields as needed, e.g., name, etc.
}

/**
 * Sign in a user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns The user object on success
 * @throws Error if sign in fails
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Assuming we have a custom claim for role or we fetch it from a users table
  // For simplicity, we'll return the user from supabase.auth
  const user = data.user;
  if (!user) {
    throw new Error('No user returned from Supabase');
  }

  // We can extend the user object with role if needed
  // This would require fetching from a users table or using user.user_metadata
  // For now, we'll return the basic user object and let the caller fetch extended data if needed
  return {
    id: user.id,
    email: user.email!,
    // role: user.user_metadata.role as 'client' | 'admin', // Example if stored in metadata
  };
};

/**
 * Sign out the current user
 * @returns Void on success
 * @throws Error if sign out fails
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get the current user from Supabase auth
 * @returns The user object if logged in, null otherwise
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    // role: user.user_metadata.role as 'client' | 'admin',
  };
};

/**
 * Check if the user is currently authenticated
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

/**
 * Optional: Listen to auth state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email!,
          // role: session.user.user_metadata.role as 'client' | 'admin',
        }
      : null;
    callback(user);
  });
};