import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';

interface AuthState {
  user: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    name: string;
    phone: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{
      id: string;
      email: string;
      role: 'user' | 'admin';
      name: string;
      phone: string;
    }>) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{
      id: string;
      email: string;
      role: 'user' | 'admin';
      name: string;
      phone: string;
    }>) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

// Async thunks for auth operations
export const loginUser = (email: string, password: string) => async (dispatch: any) => {
  dispatch(loginStart());
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, name, phone')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    dispatch(loginSuccess({
      id: profile.id,
      email: profile.email,
      role: profile.role,
      name: profile.name,
      phone: profile.phone,
    }));
  } catch (error: any) {
    dispatch(loginFailure(error.message));
  }
};

export const registerUser = (email: string, password: string, name: string, phone: string) => async (dispatch: any) => {
  dispatch(registerStart());
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email,
          role: 'user', // Default role
          name,
          phone,
        }
      ]);

    if (profileError) throw profileError;

    dispatch(registerSuccess({
      id: data.user.id,
      email,
      role: 'user',
      name,
      phone,
    }));
  } catch (error: any) {
    dispatch(registerFailure(error.message));
  }
};

export const logoutUser = () => async (dispatch: any) => {
  try {
    await supabase.auth.signOut();
    dispatch(logoutSuccess());
  } catch (error: any) {
    dispatch(loginFailure(error.message)); // Reuse login failure for logout error
  }
};

export default authSlice.reducer;