import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  discountPrice: number | null;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<{
      productId: string;
      size: string;
      color: string;
    }>) => {
      state.items = state.items.filter(
        item =>
          !(item.productId === action.payload.productId &&
            item.size === action.payload.size &&
            item.color === action.payload.color)
      );
    },
    updateQuantity: (state, action: PayloadAction<{
      productId: string;
      size: string;
      color: string;
      quantity: number;
    }>) => {
      const item = state.items.find(
        item =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            item =>
              !(item.productId === action.payload.productId &&
                item.size === action.payload.size &&
                item.color === action.payload.color)
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;