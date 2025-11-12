import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { Homologation, HomologationsState, HomologationStatus } from '@av/types';
import { Database } from '@/types/database';

type HomologationRow = Database['public']['Tables']['homologations']['Row'];

export const fetchHomologations = createAsyncThunk(
  'homologations/fetchHomologations',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('homologations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Convert database rows to app types, handling null -> undefined conversion
    return data.map((row: HomologationRow): Homologation => ({
      ...row,
      submission_date: row.submission_date || undefined,
      review_date: row.review_date || undefined,
      completion_date: row.completion_date || undefined,
      notes: row.notes || undefined,
      documents: row.documents || undefined,
      payment_id: row.payment_id || undefined,
    }));
  }
);

export const fetchHomologationById = createAsyncThunk(
  'homologations/fetchHomologationById',
  async (id: string) => {
    const { data, error } = await supabase
      .from('homologations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Convert database row to app type, handling null -> undefined conversion
    const row = data as HomologationRow;
    return {
      ...row,
      submission_date: row.submission_date || undefined,
      review_date: row.review_date || undefined,
      completion_date: row.completion_date || undefined,
      notes: row.notes || undefined,
      documents: row.documents || undefined,
      payment_id: row.payment_id || undefined,
    } as Homologation;
  }
);

export const createHomologation = createAsyncThunk(
  'homologations/createHomologation',
  async (homologation: Omit<Homologation, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert app type to database format, handling undefined -> null conversion
    const dbHomologation = {
      ...homologation,
      submission_date: homologation.submission_date || null,
      review_date: homologation.review_date || null,
      completion_date: homologation.completion_date || null,
      notes: homologation.notes || null,
      documents: homologation.documents || null,
      payment_id: homologation.payment_id || null,
    };
    
    const { data, error } = await supabase
      .from('homologations')
      .insert([dbHomologation])
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert back to app type
    const row = data as HomologationRow;
    return {
      ...row,
      submission_date: row.submission_date || undefined,
      review_date: row.review_date || undefined,
      completion_date: row.completion_date || undefined,
      notes: row.notes || undefined,
      documents: row.documents || undefined,
      payment_id: row.payment_id || undefined,
    } as Homologation;
  }
);

export const updateHomologation = createAsyncThunk(
  'homologations/updateHomologation',
  async ({ id, updates }: { id: string; updates: Partial<Homologation> }) => {
    // Convert app type to database format, handling undefined -> null conversion
    const dbUpdates = {
      ...updates,
      submission_date: updates.submission_date || null,
      review_date: updates.review_date || null,
      completion_date: updates.completion_date || null,
      notes: updates.notes || null,
      documents: updates.documents || null,
      payment_id: updates.payment_id || null,
    };
    
    const { data, error } = await supabase
      .from('homologations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert back to app type
    const row = data as HomologationRow;
    return {
      ...row,
      submission_date: row.submission_date || undefined,
      review_date: row.review_date || undefined,
      completion_date: row.completion_date || undefined,
      notes: row.notes || undefined,
      documents: row.documents || undefined,
      payment_id: row.payment_id || undefined,
    } as Homologation;
  }
);

export const updateHomologationStatus = createAsyncThunk(
  'homologations/updateHomologationStatus',
  async ({ id, status }: { id: string; status: HomologationStatus }) => {
    const updates: Partial<Homologation> = { status };
    
    if (status === 'submitted') {
      updates.submission_date = new Date().toISOString();
    } else if (status === 'under_review') {
      updates.review_date = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completion_date = new Date().toISOString();
    }
    
    // Convert app type to database format, handling undefined -> null conversion
    const dbUpdates = {
      ...updates,
      submission_date: updates.submission_date || null,
      review_date: updates.review_date || null,
      completion_date: updates.completion_date || null,
      notes: updates.notes || null,
      documents: updates.documents || null,
      payment_id: updates.payment_id || null,
    };
    
    const { data, error } = await supabase
      .from('homologations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert back to app type
    const row = data as HomologationRow;
    return {
      ...row,
      submission_date: row.submission_date || undefined,
      review_date: row.review_date || undefined,
      completion_date: row.completion_date || undefined,
      notes: row.notes || undefined,
      documents: row.documents || undefined,
      payment_id: row.payment_id || undefined,
    } as Homologation;
  }
);

export const deleteHomologation = createAsyncThunk(
  'homologations/deleteHomologation',
  async (id: string) => {
    const { error } = await supabase
      .from('homologations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return id;
  }
);

const initialState: HomologationsState = {
  homologations: [],
  currentHomologation: undefined,
  loading: false,
  error: undefined,
};

export const homologationsSlice = createSlice({
  name: 'homologations',
  initialState,
  reducers: {
    setCurrentHomologation: (state, action: PayloadAction<Homologation | undefined>) => {
      state.currentHomologation = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomologations.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchHomologations.fulfilled, (state, action) => {
        state.loading = false;
        state.homologations = action.payload;
      })
      .addCase(fetchHomologations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchHomologationById.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchHomologationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHomologation = action.payload;
      })
      .addCase(fetchHomologationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createHomologation.fulfilled, (state, action) => {
        state.homologations.unshift(action.payload);
        state.currentHomologation = action.payload;
      })
      .addCase(createHomologation.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateHomologation.fulfilled, (state, action) => {
        const index = state.homologations.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.homologations[index] = action.payload;
        }
        if (state.currentHomologation?.id === action.payload.id) {
          state.currentHomologation = action.payload;
        }
      })
      .addCase(updateHomologation.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updateHomologationStatus.fulfilled, (state, action) => {
        const index = state.homologations.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.homologations[index] = action.payload;
        }
        if (state.currentHomologation?.id === action.payload.id) {
          state.currentHomologation = action.payload;
        }
      })
      .addCase(updateHomologationStatus.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteHomologation.fulfilled, (state, action) => {
        state.homologations = state.homologations.filter(h => h.id !== action.payload);
        if (state.currentHomologation?.id === action.payload) {
          state.currentHomologation = undefined;
        }
      })
      .addCase(deleteHomologation.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { setCurrentHomologation, clearError } = homologationsSlice.actions;
