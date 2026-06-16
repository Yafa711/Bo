import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.')
}

// Export the supabase client for use in components and services
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper function to handle supabase queries with error handling
 * @param query - A supabase query promise
 * @returns The data from the query
 * @throws Error if the query fails
 */
export const supabaseFetch = async <T>(query: Promise<{ data: T | null; error: any }>): Promise<T> => {
  const { data, error } = await query
  if (error) {
    throw new Error(error.message ?? 'Unknown Supabase error')
  }
  if (data === null) {
    // Depending on the use case, you might want to return null or throw an error
    // For now, we'll throw an error if data is null but no error (though this shouldn't happen with supabase)
    throw new Error('No data returned from Supabase')
  }
  return data
}

/**
 * Example helper for fetching products
 * Adjust the type according to your products table schema
 */
export const fetchProducts = async () => {
  return supabaseFetch<{
    id: string
    title: string
    description: string
    price: number
    discount_price: number | null
    images: string[]
    sizes: string[]
    colors: string[]
    stock: number
    views: number
    category: string
  }[]>(
    supabase.from('products').select('*')
  )
}

/**
 * Example helper for inserting an order
 * Adjust the type according to your orders table schema
 */
export const insertOrder = async (order: {
  user_id: string
  items: any[] // Consider defining a proper type for order items
  total: number
  status: string
  transfer_screenshot: string | null
  city: string
  payment_method: string
}) => {
  return supabaseFetch<{ id: string }>(
    supabase.from('orders').insert([order]).select('id').single()
  )
}

// Add more helper functions as needed for your application