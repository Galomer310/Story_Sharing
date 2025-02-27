import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { User } from '../types/types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Attempt to load token from localStorage on init
const tokenFromStorage = localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: null,
  token: tokenFromStorage,
  status: 'idle',
  error: null,
};

// Thunk: fetch user data from /api/auth/protected
export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/protected`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Failed to fetch user');
      }
      const data = await response.json();
      return data.user as User;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      localStorage.setItem('accessToken', token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('accessToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selector to get the current user
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
