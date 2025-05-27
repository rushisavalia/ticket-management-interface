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
      cancellation_policy: {
        Row: {
          cancellation_before_minutes: number | null
          created_at: string | null
          id: string
          tour_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          cancellation_before_minutes?: number | null
          created_at?: string | null
          id: string
          tour_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          cancellation_before_minutes?: number | null
          created_at?: string | null
          id?: string
          tour_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      contact: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          tour_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          phone?: string | null
          tour_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tour_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string | null
          id: string
          listing_type: string
          product_name: string
          status: string | null
          tour_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id: string
          listing_type: string
          product_name: string
          status?: string | null
          tour_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_type?: string
          product_name?: string
          status?: string | null
          tour_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      tours: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          location?: string | null
          name: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          vendor_id?: string | null
        }
        Relationships: []
      }
      vendor_tours: {
        Row: {
          added_at: string | null
          id: string
          tour_id: string
          vendor_id: string
        }
        Insert: {
          added_at?: string | null
          id: string
          tour_id: string
          vendor_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          tour_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
