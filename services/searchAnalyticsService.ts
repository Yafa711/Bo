import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the SearchAnalytics type based on the exact database schema: (id, query, count)
// Note: In practice, we might also want timestamps, but following exact schema requirements
export interface SearchAnalytics {
  id: string;
  query: string;
  count: number;
}

/**
 * Log a search query
 * If query exists, increment count; otherwise create new entry
 * @param query - Search query string
 * @returns Promise<SearchAnalytics>
 */
export const logSearch = async (
  query: string
): Promise<SearchAnalytics> => {
  // First try to find existing query
  const { data: existingData, error: fetchError } = await supabase
    .from('search_analytics')
    .select('*')
    .eq('query', query)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(fetchError.message);
  }

  if (existingData) {
    // Query exists, increment count
    return supabaseFetch<SearchAnalytics>(
      supabase
        .from('search_analytics')
        .update({ count: existingData.count + 1 })
        .eq('id', existingData.id)
        .select()
        .single()
    );
  } else {
    // Query doesn't exist, create new with count = 1
    return supabaseFetch<SearchAnalytics>(
      supabase
        .from('search_analytics')
        .insert([{ query, count: 1 }])
        .select()
        .single()
    );
  }
};

/**
 * Get all search analytics sorted by count descending
 * @returns Promise<SearchAnalytics[]>
 */
export const getAllSearchAnalytics = async (): Promise<SearchAnalytics[]> => {
  return supabaseFetch<SearchAnalytics[]>(
    supabase.from('search_analytics').select('*').order('count', { ascending: false })
  );
};

/**
 * Get top search queries (limit default 10)
 * @param limit - Number of results to return
 * @returns Promise<SearchAnalytics[]>
 */
export const getTopSearches = async (limit: number = 10): Promise<SearchAnalytics[]> => {
  return supabaseFetch<SearchAnalytics[]>(
    supabase.from('search_analytics').select('*').order('count', { ascending: false }).limit(limit)
  );
};

/**
 * Get search analytics by ID
 * @param id - Search analytics ID
 * @returns Promise<SearchAnalytics | null>
 */
export const getSearchAnalyticsById = async (id: string): Promise<SearchAnalytics | null> => {
  const { data, error } = await supabase
    .from('search_analytics')
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
 * Delete search analytics by ID
 * @param id - Search analytics ID
 * @returns Promise<void>
 */
export const deleteSearchAnalytics = async (id: string): Promise<void> => {
  const { error } = await supabase.from('search_analytics').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
};