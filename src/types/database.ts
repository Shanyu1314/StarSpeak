// Supabase 数据库类型定义
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
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      word_entries: {
        Row: {
          id: string
          user_id: string
          word: string
          phonetic: string | null
          definition: string | null
          translation_cn: string | null
          example: string | null
          in_drill: boolean
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          phonetic?: string | null
          definition?: string | null
          translation_cn?: string | null
          example?: string | null
          in_drill?: boolean
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          phonetic?: string | null
          definition?: string | null
          translation_cn?: string | null
          example?: string | null
          in_drill?: boolean
          added_at?: string
        }
      }
      sos_scenarios: {
        Row: {
          id: string
          user_id: string
          query: string
          native_response: string | null
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          native_response?: string | null
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          native_response?: string | null
          explanation?: string | null
          created_at?: string
        }
      }
      drill_history: {
        Row: {
          id: string
          user_id: string
          scenario: string | null
          user_response: string | null
          passed: boolean | null
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scenario?: string | null
          user_response?: string | null
          passed?: boolean | null
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scenario?: string | null
          user_response?: string | null
          passed?: boolean | null
          feedback?: string | null
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          messages: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Json | null
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
  }
}
