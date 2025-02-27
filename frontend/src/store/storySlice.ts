import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { Story } from '../types/types';

interface StoryState {
  stories: Story[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StoryState = {
  stories: [],
  status: 'idle',
  error: null,
};

// Fetch all stories
export const fetchStories = createAsyncThunk(
  'stories/fetchStories',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as any;
    const token = state.auth.token;
    if (!token) return rejectWithValue('No token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const response = await fetch(`${apiUrl}/api/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      return rejectWithValue(data.error || 'Failed to fetch stories');
    }
    return await response.json();
  }
);

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    addStory: (state, action) => {
      // Prepend new story
      state.stories.unshift(action.payload);
    },
    updateStory: (state, action) => {
      const updated = action.payload as Story;
      const index = state.stories.findIndex((s) => s.id === updated.id);
      if (index !== -1) {
        state.stories[index] = updated;
      }
    },
    removeStory: (state, action) => {
      const storyId = action.payload;
      state.stories = state.stories.filter((s) => s.id !== storyId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stories = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { addStory, updateStory, removeStory } = storySlice.actions;
export default storySlice.reducer;

// Selector to get all stories
export const selectAllStories = (state: RootState) => state.stories.stories;
