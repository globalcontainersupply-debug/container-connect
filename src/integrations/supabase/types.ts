export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      container_sizes: {
        Row: {
          capacity: string | null
          created_at: string
          description: string | null
          door_dimensions: string | null
          external_dimensions: string | null
          id: string
          image_url: string | null
          internal_dimensions: string | null
          max_gross_weight: string | null
          name: string
          payload: string | null
          published: boolean
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          tare_weight: string | null
          typical_applications: string[]
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          description?: string | null
          door_dimensions?: string | null
          external_dimensions?: string | null
          id?: string
          image_url?: string | null
          internal_dimensions?: string | null
          max_gross_weight?: string | null
          name: string
          payload?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          tare_weight?: string | null
          typical_applications?: string[]
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          description?: string | null
          door_dimensions?: string | null
          external_dimensions?: string | null
          id?: string
          image_url?: string | null
          internal_dimensions?: string | null
          max_gross_weight?: string | null
          name?: string
          payload?: string | null
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          tare_weight?: string | null
          typical_applications?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      container_types: {
        Row: {
          available_sizes: string[]
          characteristics: string[]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          typical_uses: string[]
          updated_at: string
        }
        Insert: {
          available_sizes?: string[]
          characteristics?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          typical_uses?: string[]
          updated_at?: string
        }
        Update: {
          available_sizes?: string[]
          characteristics?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          typical_uses?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      home_content: {
        Row: {
          about_image_url: string | null
          benefits: Json
          cta_section_image_url: string | null
          hero_heading: string
          hero_image_url: string | null
          hero_primary_cta: string
          hero_secondary_cta: string
          hero_subheading: string | null
          id: number
          shipping_body: string | null
          shipping_heading: string | null
          shipping_section_image_url: string | null
          updated_at: string
          video_body: string | null
          video_heading: string | null
        }
        Insert: {
          about_image_url?: string | null
          benefits?: Json
          cta_section_image_url?: string | null
          hero_heading?: string
          hero_image_url?: string | null
          hero_primary_cta?: string
          hero_secondary_cta?: string
          hero_subheading?: string | null
          id?: number
          shipping_body?: string | null
          shipping_heading?: string | null
          shipping_section_image_url?: string | null
          updated_at?: string
          video_body?: string | null
          video_heading?: string | null
        }
        Update: {
          about_image_url?: string | null
          benefits?: Json
          cta_section_image_url?: string | null
          hero_heading?: string
          hero_image_url?: string | null
          hero_primary_cta?: string
          hero_secondary_cta?: string
          hero_subheading?: string | null
          id?: number
          shipping_body?: string | null
          shipping_heading?: string | null
          shipping_section_image_url?: string | null
          updated_at?: string
          video_body?: string | null
          video_heading?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          description: string | null
          file_name: string
          id: string
          media_type: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          id?: string
          media_type?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          id?: string
          media_type?: string
          url?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specs: {
        Row: {
          id: string
          label: string
          product_id: string
          sort_order: number
          value: string
        }
        Insert: {
          id?: string
          label: string
          product_id: string
          sort_order?: number
          value: string
        }
        Update: {
          id?: string
          label?: string
          product_id?: string
          sort_order?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          applications: string[]
          availability: string
          category_id: string | null
          condition: string
          created_at: string
          currency: string
          delivery_info: string | null
          description: string | null
          featured: boolean
          features: string[]
          focus_keyword: string | null
          id: string
          is_new_arrival: boolean
          name: string
          notes: string | null
          og_image_url: string | null
          on_sale: boolean
          popular: boolean
          price: number | null
          price_mode: string
          published: boolean
          quantity_available: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          size_id: string | null
          sku: string | null
          slug: string
          sort_order: number
          type_id: string | null
          updated_at: string
          year_manufactured: number | null
        }
        Insert: {
          applications?: string[]
          availability?: string
          category_id?: string | null
          condition?: string
          created_at?: string
          currency?: string
          delivery_info?: string | null
          description?: string | null
          featured?: boolean
          features?: string[]
          focus_keyword?: string | null
          id?: string
          is_new_arrival?: boolean
          name: string
          notes?: string | null
          og_image_url?: string | null
          on_sale?: boolean
          popular?: boolean
          price?: number | null
          price_mode?: string
          published?: boolean
          quantity_available?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          size_id?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          type_id?: string | null
          updated_at?: string
          year_manufactured?: number | null
        }
        Update: {
          applications?: string[]
          availability?: string
          category_id?: string | null
          condition?: string
          created_at?: string
          currency?: string
          delivery_info?: string | null
          description?: string | null
          featured?: boolean
          features?: string[]
          focus_keyword?: string | null
          id?: string
          is_new_arrival?: boolean
          name?: string
          notes?: string | null
          og_image_url?: string | null
          on_sale?: boolean
          popular?: boolean
          price?: number | null
          price_mode?: string
          published?: boolean
          quantity_available?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          size_id?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          type_id?: string | null
          updated_at?: string
          year_manufactured?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "container_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "container_types"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          avatar_url: string | null
          body: string
          company: string | null
          country: string | null
          created_at: string
          customer_name: string
          featured: boolean
          id: string
          is_demo: boolean
          published: boolean
          rating: number
          review_date: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          body: string
          company?: string | null
          country?: string | null
          created_at?: string
          customer_name: string
          featured?: boolean
          id?: string
          is_demo?: boolean
          published?: boolean
          rating?: number
          review_date?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          body?: string
          company?: string | null
          country?: string | null
          created_at?: string
          customer_name?: string
          featured?: boolean
          id?: string
          is_demo?: boolean
          published?: boolean
          rating?: number
          review_date?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      shipping_regions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          business_hours: string | null
          company_email: string
          company_name: string
          created_at: string
          currency: string
          default_seo_description: string | null
          default_seo_title: string | null
          default_social_image: string | null
          favicon_url: string | null
          footer_text: string | null
          id: number
          logo_url: string | null
          phone: string | null
          social_links: Json
          updated_at: string
          whatsapp_secondary: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          company_email?: string
          company_name?: string
          created_at?: string
          currency?: string
          default_seo_description?: string | null
          default_seo_title?: string | null
          default_social_image?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          social_links?: Json
          updated_at?: string
          whatsapp_secondary?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          company_email?: string
          company_name?: string
          created_at?: string
          currency?: string
          default_seo_description?: string | null
          default_seo_title?: string | null
          default_social_image?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: number
          logo_url?: string | null
          phone?: string | null
          social_links?: Json
          updated_at?: string
          whatsapp_secondary?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          homepage_featured: boolean
          id: string
          placement: string
          poster_url: string | null
          sort_order: number
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          homepage_featured?: boolean
          id?: string
          placement?: string
          poster_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          homepage_featured?: boolean
          id?: string
          placement?: string
          poster_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
