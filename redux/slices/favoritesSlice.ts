import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

interface FavoriteItem {
  productId: string;
  title: string;
  price: number;
  discountPrice: number | null;
  image: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<FavoriteItem>) => {
      // Check if item already exists
      const exists = state.items.some(item => item.productId === action.payload.productId);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
    },
    setFavorites: (state, action: PayloadAction<FavoriteItem[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Async thunks for favorites operations
export const fetchFavorites = (userId: string) => async (dispatch: any) => {
  dispatch(setLoading(true));
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('productId, products!inner(id, title, price, discount_price, images)')
      .eq('user_id', userId);

    if (error) throw error;

    const favorites = data.map((item: any) => ({
      productId: item.productId,
      title: item.products.title,
      price: item.products.price,
      discountPrice: item.products.discount_price,
      image: item.products.images[0], // Assuming first image
    }));

    dispatch(setFavorites(favorites));
  } catch (error: any) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addFavoriteItem = (userId: string, productId: string) => async (dispatch: any) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }]);

    if (error) throw error;

    // Optimistic update would be better, but for simplicity we'll refetch
    // In a real app, you'd add optimistically and handle rollback on error
  } catch (error: any) {
    // Handle error (show toast, etc.)
    console.error('Error adding favorite:', error);
  }
};

export const removeFavoriteItem = (userId: string, productId: string) => async (dispatch: any) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, product_id: productId });

    if (error) throw error;

    // Optimistic update would be better
  } catch (error: any) {
    // Handle error
    console.error('Error removing favorite:', error);
  }
};

export const {
  addFavorite,
  removeFavorite,
  setFavorites,
  setLoading,
  setError,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;