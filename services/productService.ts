import { supabaseFetch } from './supabase';
import { supabase } from './supabase';

// Define the Product type based on the database schema
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_price: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  views: number;
  category: string;
  // Add any other fields as needed
}

/**
 * Fetch all products
 * @returns Promise<Product[]>
 */
export const getAllProducts = async (): Promise<Product[]> => {
  return supabaseFetch<Product[]>(
    supabase.from('products').select('*')
  );
};

/**
 * Fetch a single product by ID
 * @param id - Product ID
 * @returns Promise<Product | null> (returns null if not found)
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // If the error is due to no rows returned, we return null
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }
  return data;
};

/**
 * Fetch products by category
 * @param category - Category name
 * @returns Promise<Product[]>
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return supabaseFetch<Product[]>(
    supabase.from('products').select('*').eq('category', category)
  );
};

/**
 * Create a new product
 * @param product - Omit id because it's auto-generated
 * @returns Promise<Product> (the created product)
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  return supabaseFetch<Product>(
    supabase.from('products').insert([product]).select().single()
  );
};

/**
 * Update an existing product
 * @param id - Product ID
 * @param updates - Partial product object (only fields to update)
 * @returns Promise<Product> (the updated product)
 */
export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<Product> => {
  return supabaseFetch<Product>(
    supabase.from('products').update(updates).eq('id', id).select().single()
  );
};

/**
 * Delete a product by ID
 * @param id - Product ID
 * @returns Promise<void>
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Increment view count for a product
 * @param id - Product ID
 * @returns Promise<Product> (the updated product)
 */
export const incrementProductViews = async (id: string): Promise<Product> => {
  // First, get the current product
  const product = await getProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }

  // Increment views
  const updatedProduct = await updateProduct(id, {
    views: product.views + 1,
  });

  return updatedProduct;
};