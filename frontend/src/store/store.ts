import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import storyReducer from './storySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    stories: storyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
