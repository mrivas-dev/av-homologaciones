import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { homologationsSlice } from './slices/homologationsSlice';
import { paymentsSlice } from './slices/paymentsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    homologations: homologationsSlice.reducer,
    payments: paymentsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
