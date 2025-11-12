import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { Payment } from '@av/types';
import { Database } from '@/types/database';

type PaymentRow = Database['public']['Tables']['payments']['Row'];

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
    // Convert app type to database format, handling undefined -> null conversion
    const dbPayment = {
      ...payment,
      mercadopago_payment_id: payment.mercadopago_payment_id || null,
      mercadopago_preference_id: payment.mercadopago_preference_id || null,
    };
    
    const { data, error } = await supabase
      .from('payments')
      .insert([dbPayment])
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert back to app type
    const row = data as PaymentRow;
    return {
      ...row,
      mercadopago_payment_id: row.mercadopago_payment_id || undefined,
      mercadopago_preference_id: row.mercadopago_preference_id || undefined,
    } as Payment;
  }
);

export const fetchPaymentByHomologationId = createAsyncThunk(
  'payments/fetchPaymentByHomologationId',
  async (homologationId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('homologation_id', homologationId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;
    
    // Convert database row to app type, handling null -> undefined conversion
    const row = data as PaymentRow;
    return {
      ...row,
      mercadopago_payment_id: row.mercadopago_payment_id || undefined,
      mercadopago_preference_id: row.mercadopago_preference_id || undefined,
    } as Payment;
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'payments/updatePaymentStatus',
  async ({ id, status, mercadopagoPaymentId }: { 
    id: string; 
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    mercadopagoPaymentId?: string;
  }) => {
    const updates: Partial<PaymentRow> = { status };
    
    if (mercadopagoPaymentId) {
      updates.mercadopago_payment_id = mercadopagoPaymentId;
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert back to app type
    const row = data as PaymentRow;
    return {
      ...row,
      mercadopago_payment_id: row.mercadopago_payment_id || undefined,
      mercadopago_preference_id: row.mercadopago_preference_id || undefined,
    } as Payment;
  }
);

export const createMercadoPagoPreference = createAsyncThunk(
  'payments/createMercadoPagoPreference',
  async ({ homologationId, amount }: { homologationId: string; amount: number }) => {
    const response = await fetch('/api/payments/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        homologationId,
        amount,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment preference');
    }
    
    const data = await response.json();
    return data;
  }
);

export interface PaymentsState {
  payments: Payment[];
  currentPayment: Payment | null;
  preference: any;
  loading: boolean;
  error: string | undefined;
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  preference: null,
  loading: false,
  error: undefined,
};

export const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setCurrentPayment: (state, action: PayloadAction<Payment | null>) => {
      state.currentPayment = action.payload;
    },
    clearPreference: (state) => {
      state.preference = null;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
        state.currentPayment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPaymentByHomologationId.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchPaymentByHomologationId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentByHomologationId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.currentPayment?.id === action.payload.id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(createMercadoPagoPreference.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createMercadoPagoPreference.fulfilled, (state, action) => {
        state.loading = false;
        state.preference = action.payload;
      })
      .addCase(createMercadoPagoPreference.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCurrentPayment, clearPreference, clearError } = paymentsSlice.actions;
