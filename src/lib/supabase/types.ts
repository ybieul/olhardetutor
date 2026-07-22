/**
 * Hand-written mirror of the schema in supabase/migrations/. Shaped
 * exactly like `supabase gen types typescript` output so that once a real
 * project exists, running:
 *   supabase gen types typescript --local > src/lib/supabase/types.ts
 * is a drop-in replacement — no call sites should need to change.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          locale: string;
          country: string | null;
          display_name: string | null;
          onboarding_completed: boolean;
          tour_completed: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          locale?: string;
          country?: string | null;
          display_name?: string | null;
          onboarding_completed?: boolean;
          tour_completed?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          locale?: string;
          country?: string | null;
          display_name?: string | null;
          onboarding_completed?: boolean;
          tour_completed?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          species: Database['public']['Enums']['pet_species'];
          life_stage: Database['public']['Enums']['pet_life_stage'];
          breed: string | null;
          birth_date: string | null;
          initial_weight: number | null;
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          species: Database['public']['Enums']['pet_species'];
          life_stage: Database['public']['Enums']['pet_life_stage'];
          breed?: string | null;
          birth_date?: string | null;
          initial_weight?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          species?: Database['public']['Enums']['pet_species'];
          life_stage?: Database['public']['Enums']['pet_life_stage'];
          breed?: string | null;
          birth_date?: string | null;
          initial_weight?: number | null;
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          pet_id: string;
          date: string;
          feeding: number;
          water: number;
          sleep: number;
          activity: number;
          stool_status: Database['public']['Enums']['stool_status'];
          stool_details: Json;
          urine_status: Database['public']['Enums']['urine_status'];
          urine_details: Json;
          behavior: number;
          free_note: string | null;
          day_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          date: string;
          feeding: number;
          water: number;
          sleep: number;
          activity: number;
          stool_status: Database['public']['Enums']['stool_status'];
          stool_details?: Json;
          urine_status: Database['public']['Enums']['urine_status'];
          urine_details?: Json;
          behavior: number;
          free_note?: string | null;
          day_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          date?: string;
          feeding?: number;
          water?: number;
          sleep?: number;
          activity?: number;
          stool_status?: Database['public']['Enums']['stool_status'];
          stool_details?: Json;
          urine_status?: Database['public']['Enums']['urine_status'];
          urine_details?: Json;
          behavior?: number;
          free_note?: string | null;
          day_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'checkins_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
        ];
      };
      weight_history: {
        Row: {
          id: string;
          pet_id: string;
          date: string;
          weight_kg: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          date: string;
          weight_kg: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          date?: string;
          weight_kg?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'weight_history_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
        ];
      };
      health_events: {
        Row: {
          id: string;
          pet_id: string;
          type: Database['public']['Enums']['health_event_type'];
          date: string;
          description: string | null;
          next_date: string | null;
          reminder_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          type: Database['public']['Enums']['health_event_type'];
          date: string;
          description?: string | null;
          next_date?: string | null;
          reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          type?: Database['public']['Enums']['health_event_type'];
          date?: string;
          description?: string | null;
          next_date?: string | null;
          reminder_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'health_events_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
        ];
      };
      alerts: {
        Row: {
          id: string;
          pet_id: string;
          date: string;
          level: Database['public']['Enums']['alert_level'];
          description: string;
          resolved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          date: string;
          level: Database['public']['Enums']['alert_level'];
          description: string;
          resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pet_id?: string;
          date?: string;
          level?: Database['public']['Enums']['alert_level'];
          description?: string;
          resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'alerts_pet_id_fkey';
            columns: ['pet_id'];
            isOneToOne: false;
            referencedRelation: 'pets';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      owns_pet: {
        Args: { p_pet_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      pet_species: 'dog' | 'cat';
      pet_life_stage: 'puppy' | 'adult' | 'senior';
      stool_status: 'normal' | 'soft' | 'hard' | 'diarrhea' | 'blood_or_mucus' | 'not_observed';
      urine_status:
        'normal' | 'increased_frequency' | 'decreased_frequency' | 'blood_present' | 'straining' | 'not_observed';
      health_event_type: 'vaccine' | 'deworming' | 'flea' | 'consultation' | 'medication';
      alert_level: 'observe' | 'attention' | 'urgent';
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
