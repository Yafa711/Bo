import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the City type based on the database schema (id, name, fee)
export interface City {
  id: string;
  name: string;
  fee: number; // Delivery/shipment fee for the city
}

/**
 * Fetch all cities
 * @returns Promise<City[]>
 */
export const getAllCities = async (): Promise<City[]> => {
  return supabaseFetch<City[]>(
    supabase.from('cities').select('*')
  );
};

/**
 * Fetch a single city by ID
 * @param id - City ID
 * @returns Promise<City | null>
 */
export const getCityById = async (id: string): Promise<City | null> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
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
 * Fetch a city by name (case-insensitive)
 * @param name - City name
 * @returns Promise<City | null>
 */
export const getCityByName = async (name: string): Promise<City | null> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .ilike('name', name)
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
 * Create a new city
 * @param city - Omit id if auto-generated
 * @returns Promise<City>
 */
export const createCity = async (city: Omit<City, 'id'>): Promise<City> => {
  return supabaseFetch<City>(
    supabase.from('cities').insert([city]).select().single()
  );
};

/**
 * Update an existing city
 * @param id - City ID
 * @param updates - Partial city object
 * @returns Promise<City>
 */
export const updateCity = async (
  id: string,
  updates: Partial<City>
): Promise<City> => {
  return supabaseFetch<City>(
    supabase.from('cities').update(updates).eq('id', id).select().single()
  );
};

/**
 * Delete a city by ID
 * @param id - City ID
 * @returns Promise<void>
 */
export const deleteCity = async (id: string): Promise<void> => {
  const { error } = await supabase.from('cities').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
};