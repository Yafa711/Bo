import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the Coupon type based on the database schema
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount'; // Adjust based on your schema
  discount_value: number; // percentage or fixed amount
  min_purchase: number; // minimum purchase amount to apply
  max_discount: number | null; // maximum discount amount (if applicable)
  starts_at: string; // ISO date string
  ends_at: string; // ISO date string
  is_active: boolean;
  // Add any other fields as needed
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
 * Fetch active coupons (based on current date and is_active flag)
 * @returns Promise<Coupon[]>
 */
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const now = new Date().toISOString();
  return supabaseFetch<Coupon[]>(
    supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
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
 * @returns Promise<Coupon> (the created coupon)
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
 * @returns Promise<Coupon> (the updated coupon)
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
 * Validate a coupon for a given purchase amount
 * @param code - Coupon code
 * @param purchaseAmount - Total purchase amount
 * @returns { valid: boolean, discount: number | null, message: string }
 */
export const validateCoupon = async (
  code: string,
  purchaseAmount: number
): Promise<{ valid: boolean; discount: number | null; message: string }> => {
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return { valid: false, discount: null, message: 'Coupon not found' };
  }

  const now = new Date();
  const startsAt = new Date(coupon.starts_at);
  const endsAt = new Date(coupon.ends_at);

  if (!coupon.is_active) {
    return { valid: false, discount: null, message: 'Coupon is not active' };
  }

  if (now < startsAt || now > endsAt) {
    return { valid: false, discount: null, message: 'Coupon is not valid at this time' };
  }

  if (purchaseAmount < coupon.min_purchase) {
    return {
      valid: false,
      discount: null,
      message: `Minimum purchase amount of ${coupon.min_purchase} required`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (purchaseAmount * coupon.discount_value) / 100;
    if (coupon.max_discount !== null && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
  } else if (coupon.discount_type === 'fixed_amount') {
    discount = coupon.discount_value;
  }

  // Ensure discount does not exceed purchase amount
  if (discount > purchaseAmount) {
    discount = purchaseAmount;
  }

  return { valid: true, discount, message: 'Coupon is valid' };
};