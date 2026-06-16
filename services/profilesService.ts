import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the Profile type based on the database schema
export interface Profile {
  id: string;
  role: 'client' | 'admin';
  name: string;
  phone: string;
}

/**
 * Fetch a profile by user ID
 * @param userId - User ID
 * @returns Promise<Profile | null>
 */
export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }
  return data;
};

/**
 * Update a profile
 * @param userId - User ID
 * @param updates - Partial profile object
 * @returns Promise<Profile>
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> => {
  return supabaseFetch<Profile>(
    supabase.from('profiles').update(updates).eq('id', userId).select().single()
  );
};

/**
 * Create a new profile
 * @param profile - Omit id if auto-generated
 * @returns Promise<Profile>
 */
export const createProfile = async (profile: Omit<Profile, 'id'>): Promise<Profile> => {
  return supabaseFetch<Profile>(
    supabase.from('profiles').insert([profile]).select().single()
  );
};