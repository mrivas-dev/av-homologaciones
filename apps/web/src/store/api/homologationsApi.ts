import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { Homologation, Vehicle, Document } from '@av/types';
import { Database } from '@/types/database';

type HomologationRow = Database['public']['Tables']['homologations']['Row'];
type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];

export const homologationsApi = createApi({
  reducerPath: 'homologationsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Homologation', 'Vehicle', 'Document'],
  endpoints: (builder) => ({
    getHomologations: builder.query<Homologation[], string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from('homologations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert database rows to app types, handling null -> undefined conversion
        const homologations = data.map((row: HomologationRow): Homologation => ({
          ...row,
          submission_date: row.submission_date || undefined,
          review_date: row.review_date || undefined,
          completion_date: row.completion_date || undefined,
          notes: row.notes || undefined,
          documents: row.documents || undefined,
          payment_id: row.payment_id || undefined,
        }));
        
        return { data: homologations };
      },
      providesTags: ['Homologation'],
    }),
    getHomologationById: builder.query<Homologation, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('homologations')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Convert database row to app type, handling null -> undefined conversion
        const row = data as HomologationRow;
        const homologation = {
          ...row,
          submission_date: row.submission_date || undefined,
          review_date: row.review_date || undefined,
          completion_date: row.completion_date || undefined,
          notes: row.notes || undefined,
          documents: row.documents || undefined,
          payment_id: row.payment_id || undefined,
        } as Homologation;
        
        return { data: homologation };
      },
      providesTags: (result, error, id) => [{ type: 'Homologation', id }],
    }),
    createHomologation: builder.mutation<Homologation, Omit<Homologation, 'id' | 'created_at' | 'updated_at'>>({
      queryFn: async (homologation) => {
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
        const result = {
          ...row,
          submission_date: row.submission_date || undefined,
          review_date: row.review_date || undefined,
          completion_date: row.completion_date || undefined,
          notes: row.notes || undefined,
          documents: row.documents || undefined,
          payment_id: row.payment_id || undefined,
        } as Homologation;
        
        return { data: result };
      },
      invalidatesTags: ['Homologation'],
    }),
    updateHomologation: builder.mutation<Homologation, { id: string; updates: Partial<Homologation> }>({
      queryFn: async ({ id, updates }) => {
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
        const result = {
          ...row,
          submission_date: row.submission_date || undefined,
          review_date: row.review_date || undefined,
          completion_date: row.completion_date || undefined,
          notes: row.notes || undefined,
          documents: row.documents || undefined,
          payment_id: row.payment_id || undefined,
        } as Homologation;
        
        return { data: result };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Homologation', id }],
    }),
    getVehicles: builder.query<Vehicle[], string>({
      queryFn: async (userId) => {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert database rows to app types, handling null -> undefined conversion
        const vehicles = data.map((row: VehicleRow): Vehicle => ({
          ...row,
          vin: row.vin || undefined,
          license_plate: row.license_plate || undefined,
          axles: row.axles || undefined,
          length: row.length || undefined,
          width: row.width || undefined,
          height: row.height || undefined,
          max_weight: row.max_weight || undefined,
        }));
        
        return { data: vehicles };
      },
      providesTags: ['Vehicle'],
    }),
    createVehicle: builder.mutation<Vehicle, Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>({
      queryFn: async (vehicle) => {
        // Convert app type to database format, handling undefined -> null conversion
        const dbVehicle = {
          ...vehicle,
          vin: vehicle.vin || null,
          license_plate: vehicle.license_plate || null,
          axles: vehicle.axles || null,
          length: vehicle.length || null,
          width: vehicle.width || null,
          height: vehicle.height || null,
          max_weight: vehicle.max_weight || null,
        };
        
        const { data, error } = await supabase
          .from('vehicles')
          .insert([dbVehicle])
          .select()
          .single();
        
        if (error) throw error;
        
        // Convert back to app type
        const row = data as VehicleRow;
        const result = {
          ...row,
          vin: row.vin || undefined,
          license_plate: row.license_plate || undefined,
          axles: row.axles || undefined,
          length: row.length || undefined,
          width: row.width || undefined,
          height: row.height || undefined,
          max_weight: row.max_weight || undefined,
        } as Vehicle;
        
        return { data: result };
      },
      invalidatesTags: ['Vehicle'],
    }),
    getDocuments: builder.query<Document[], string>({
      queryFn: async (homologationId) => {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('homologation_id', homologationId)
          .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        
        // Convert database rows to app types (no null/undefined conversion needed for documents)
        return { data: data as Document[] };
      },
      providesTags: ['Document'],
    }),
    uploadDocument: builder.mutation<Document, Omit<Document, 'id' | 'uploaded_at'>>({
      queryFn: async (document) => {
        const { data, error } = await supabase
          .from('documents')
          .insert([document])
          .select()
          .single();
        
        if (error) throw error;
        
        // Convert database row to app type (no null/undefined conversion needed for documents)
        return { data: data as Document };
      },
      invalidatesTags: ['Document'],
    }),
    deleteDocument: builder.mutation<void, string>({
      queryFn: async (id) => {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        return { data: undefined };
      },
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useGetHomologationsQuery,
  useGetHomologationByIdQuery,
  useCreateHomologationMutation,
  useUpdateHomologationMutation,
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = homologationsApi;
