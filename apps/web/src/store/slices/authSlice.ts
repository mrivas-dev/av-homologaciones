import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { AuthState } from '@av/types';

// Supabase User/Session types have different optional fields than our app types
interface AuthResponse {
  user: User | null;
  session: Session | null;
}

// Convert Supabase User to our app User type
const convertSupabaseUser = (user: User | null) => {
  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email || '',
    role: 'user' as const, // Default role, can be updated from user_metadata if needed
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
  };
};

// Convert Supabase Session to our app Session type  
const convertSupabaseSession = (session: Session | null) => {
  if (!session) return undefined;
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at || 0,
  };
};

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
    } as AuthResponse;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName }: { email: string; password: string; fullName?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
    } as AuthResponse;
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
    
    // OAuth returns a different structure - handle URL redirect case
    if ('url' in data && data.url) {
      // For OAuth, we redirect to the provider URL
      // The actual user/session will be set after callback
      return {
        user: null,
        session: null,
      } as AuthResponse;
    }
    
    // Handle case where OAuth might return user/session directly
    const oauthData = data as any;
    return {
      user: oauthData.user || null,
      session: oauthData.session || null,
    } as AuthResponse;
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    return {
      user: data.user,
      session: data.session,
    } as AuthResponse;
  }
);

const initialState: AuthState = {
  user: undefined,
  session: undefined,
  loading: false,
  error: undefined,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = convertSupabaseUser(action.payload);
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = convertSupabaseSession(action.payload);
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = convertSupabaseUser(action.payload.user);
        state.session = convertSupabaseSession(action.payload.session);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = convertSupabaseUser(action.payload.user);
        state.session = convertSupabaseSession(action.payload.session);
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = convertSupabaseUser(action.payload.user);
        state.session = convertSupabaseSession(action.payload.session);
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = undefined;
        state.session = undefined;
        state.loading = false;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = convertSupabaseUser(action.payload.user);
        state.session = convertSupabaseSession(action.payload.session);
      });
  },
});

export const { setUser, setSession, clearError } = authSlice.actions;
