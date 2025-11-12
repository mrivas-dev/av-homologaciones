export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          type: 'trailer' | 'rolling_box' | 'motorhome'
          brand: string
          model: string
          year: number
          vin: string | null
          license_plate: string | null
          axles: number | null
          length: number | null
          width: number | null
          height: number | null
          max_weight: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'trailer' | 'rolling_box' | 'motorhome'
          brand: string
          model: string
          year: number
          vin?: string | null
          license_plate?: string | null
          axles?: number | null
          length?: number | null
          width?: number | null
          height?: number | null
          max_weight?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'trailer' | 'rolling_box' | 'motorhome'
          brand?: string
          model?: string
          year?: number
          vin?: string | null
          license_plate?: string | null
          axles?: number | null
          length?: number | null
          width?: number | null
          height?: number | null
          max_weight?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      homologations: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed'
          submission_date: string | null
          review_date: string | null
          completion_date: string | null
          notes: string | null
          documents: string[] | null
          payment_id: string | null
          payment_status: 'pending' | 'paid' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed'
          submission_date?: string | null
          review_date?: string | null
          completion_date?: string | null
          notes?: string | null
          documents?: string[] | null
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed'
          submission_date?: string | null
          review_date?: string | null
          completion_date?: string | null
          notes?: string | null
          documents?: string[] | null
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          homologation_id: string
          name: string
          type: 'id_card' | 'vehicle_title' | 'insurance' | 'safety_certificate' | 'other'
          file_url: string
          file_size: number
          mime_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          homologation_id: string
          name: string
          type: 'id_card' | 'vehicle_title' | 'insurance' | 'safety_certificate' | 'other'
          file_url: string
          file_size: number
          mime_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          homologation_id?: string
          name?: string
          type?: 'id_card' | 'vehicle_title' | 'insurance' | 'safety_certificate' | 'other'
          file_url?: string
          file_size?: number
          mime_type?: string
          uploaded_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          homologation_id: string
          amount: number
          currency: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          homologation_id: string
          amount: number
          currency?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          homologation_id?: string
          amount?: number
          currency?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
