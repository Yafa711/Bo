import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the Coupon type based on the exact database schema: (id, code, discount_percent, active)
export interface Coupon {
  id: string;
  code: string;
  discount_percent: number; // Percentage discount (e.g., 10 for 10% off)
  active: boolean; // Whether the coupon is currently active
}

/**
 * Fetch all coupons
 * @returns Promise<Coupon[]>
 */
export const getAllCoupons = async (): Promise<Coupon[]> => {
  return supabaseFetch<Coupon[]>(
    supabase.from('coupons').select('*')
  );
};

/**
 * Fetch active coupons
 * @returns Promise<Coupon[]>
 */
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  return supabaseFetch<Coupon[]>(
    supabase.from('coupons').select('*').eq('active', true)
  );
};

/**
 * Fetch a single coupon by ID
 * @param id - Coupon ID
 * @returns Promise<Coupon | null>
 */
export const getCouponById = async (id: string): Promise<Coupon | null> => {
  const { data, error } = await supabase
    .from('coupons')
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
 * Fetch a coupon by code (case-insensitive)
 * @param code - Coupon code
 * @returns Promise<Coupon | null>
 */
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code)
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
 * Create a new coupon
 * @param coupon - Omit id if auto-generated
 * @returns Promise<Coupon>
 */
export const createCoupon = async (coupon: Omit<Coupon, 'id'>): Promise<Coupon> => {
  return supabaseFetch<Coupon>(
    supabase.from('coupons').insert([coupon]).select().single()
  );
};

/**
 * Update an existing coupon
 * @param id - Coupon ID
 * @param updates - Partial coupon object
 * @returns Promise<Coupon>
 */
export const updateCoupon = async (
  id: string,
  updates: Partial<Coupon>
): Promise<Coupon> => {
  return supabaseFetch<Coupon>(
    supabase.from('coupons').update(updates).eq('id', id).select().single()
  );
};

/**
 * Delete a coupon by ID
 * @param id - Coupon ID
 * @returns Promise<void>
 */
export const deleteCoupon = async (id: string): Promise<void> => {
  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Validate a coupon and calculate discount
 * @param code - Coupon code
 * @param purchaseAmount - Total purchase amount
 * @returns { valid: boolean, discount: number, message: string }
 */
export const validateCoupon = async (
  code: string,
  purchaseAmount: number
): Promise<{ valid: boolean; discount: number; message: string }> => {
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Coupon not found' };
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, message: 'Coupon is not active' };
  }

  // Calculate discount amount
  const discount = (purchaseAmount * coupon.discount_percent) / 100;

  return { valid: true, discount, message: 'Coupon is valid' };
};