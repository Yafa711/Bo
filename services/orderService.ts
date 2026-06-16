import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the Order type based on the database schema
export interface Order {
  id: string;
  user_id: string;
  items: any[]; // Consider defining a more specific type for order items
  total: number;
  status: string;
  transfer_screenshot: string | null;
  city: string;
  payment_method: string;
  created_at: string; // or Date if you prefer
  // Add any other fields as needed
}

/**
 * Fetch all orders (typically for admin)
 * @returns Promise<Order[]>
 */
export const getAllOrders = async (): Promise<Order[]> => {
  return supabaseFetch<Order[]>(
    supabase.from('orders').select('*')
  );
};

/**
 * Fetch orders for a specific user
 * @param userId - User ID
 * @returns Promise<Order[]>
 */
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  return supabaseFetch<Order[]>(
    supabase.from('orders').select('*').eq('user_id', userId)
  );
};

/**
 * Fetch a single order by ID
 * @param id - Order ID
 * @returns Promise<Order | null>
 */
export const getOrderById = async (id: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
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
 * Create a new order
 * @param order - Omit id and created_at if they are auto-generated
 * @returns Promise<Order> (the created order)
 */
export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<Order> => {
  return supabaseFetch<Order>(
    supabase.from('orders').insert([order]).select().single()
  );
};

/**
 * Update an existing order (e.g., change status)
 * @param id - Order ID
 * @param updates - Partial order object
 * @returns Promise<Order> (the updated order)
 */
export const updateOrder = async (
  id: string,
  updates: Partial<Order>
): Promise<Order> => {
  return supabaseFetch<Order>(
    supabase.from('orders').update(updates).eq('id', id).select().single()
  );
};

/**
 * Delete an order by ID
 * @param id - Order ID
 * @returns Promise<void>
 */
export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
};