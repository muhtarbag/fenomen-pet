export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          metadata: Json | null
          page_path: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          metadata?: Json | null
          page_path: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          metadata?: Json | null
          page_path?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      anonymous_likes: {
        Row: {
          created_at: string
          id: number
          ip_address: string
          submission_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          ip_address: string
          submission_id: number
        }
        Update: {
          created_at?: string
          id?: number
          ip_address?: string
          submission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_likes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      Fenomenpet: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: number
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          status?: string
        }
        Relationships: []
      }
      rejected_submissions: {
        Row: {
          comment: string
          created_at: string
          id: number
          image_hash: string | null
          image_url: string
          original_submission_id: number | null
          reason: string
          username: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: number
          image_hash?: string | null
          image_url: string
          original_submission_id?: number | null
          reason: string
          username: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: number
          image_hash?: string | null
          image_url?: string
          original_submission_id?: number | null
          reason?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "rejected_submissions_original_submission_id_fkey"
            columns: ["original_submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_likes: {
        Row: {
          created_at: string
          submission_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          submission_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          submission_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_likes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          comment: string
          created_at: string
          id: number
          image_hash: string | null
          image_url: string
          likes: number | null
          rejection_reason: string | null
          status: string | null
          transaction_id: string
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: number
          image_hash?: string | null
          image_url: string
          likes?: number | null
          rejection_reason?: string | null
          status?: string | null
          transaction_id: string
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: number
          image_hash?: string | null
          image_url?: string
          likes?: number | null
          rejection_reason?: string | null
          status?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_submission_cooldown: {
        Args: {
          p_username: string
        }
        Returns: {
          has_cooldown: boolean
          last_submission_date: string
          next_submission_date: string
          days_remaining: number
        }[]
      }
      get_analytics_metrics: {
        Args: {
          time_window?: unknown
        }
        Returns: {
          click_through_rate: number
          conversion_rate: number
          user_interactions: number
          bounce_rate: number
        }[]
      }
    }
    Enums: {
      rejection_reason_enum:
        | "duplicate_photo"
        | "inappropriate_photo"
        | "invalid_username"
        | "copied_photo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
