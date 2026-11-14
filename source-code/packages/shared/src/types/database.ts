export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'student' | 'teacher' | 'institution_admin' | 'admin' | 'store_admin';
          student_id: string;
          school_or_college: string | null;
          class_level: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          interests: string[];
          language: string;
          is_minor: boolean;
          parent_email: string | null;
          parental_consent_at: string | null;
          location_consent: boolean;
          level: number;
          xp: number;
          streak_days: number;
          avatar_url: string | null;
          last_seen_at: string;
          current_activity: string | null;
          active_plan_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: 'student' | 'teacher' | 'institution_admin' | 'admin' | 'store_admin';
          student_id?: string;
          school_or_college?: string | null;
          class_level?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          interests?: string[];
          language?: string;
          is_minor?: boolean;
          parent_email?: string | null;
          parental_consent_at?: string | null;
          location_consent?: boolean;
          level?: number;
          xp?: number;
          streak_days?: number;
          avatar_url?: string | null;
          last_seen_at?: string;
          current_activity?: string | null;
          active_plan_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      plans: {
        Row: {
          id: string;
          name: string;
          tier: 'free' | 'plus' | 'pro' | 'institution';
          price_inr_monthly: number;
          price_inr_quarterly: number | null;
          price_inr_yearly: number | null;
          gst_percent: number;
          max_saved_projects: number;
          rituu_daily_messages: number;
          rituu_daily_photos: number;
          store_discount_percent: number;
          features: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['plans']['Row']> & {
          id: string;
          name: string;
          tier: 'free' | 'plus' | 'pro' | 'institution';
          price_inr_monthly: number;
        };
        Update: Partial<Database['public']['Tables']['plans']['Row']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
          status: 'active' | 'trialing' | 'paused' | 'halted' | 'cancelled' | 'grace_period';
          razorpay_subscription_id: string | null;
          razorpay_customer_id: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          user_id: string;
          plan_id: string;
          current_period_end: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          subscription_id: string | null;
          method: 'checkout' | 'qr' | 'upi' | 'card' | 'netbanking';
          amount_inr: number;
          currency: string;
          status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          qr_image_url: string | null;
          qr_expiry_at: string | null;
          invoice_number: string | null;
          invoice_tax_breakdown: Json | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          user_id: string;
          method: 'checkout' | 'qr' | 'upi' | 'card' | 'netbanking';
          amount_inr: number;
        };
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string;
          level: string;
          required_plan: string;
          estimated_hours: number;
          icon: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['courses']['Row']> & {
          id: string;
          title: string;
          slug: string;
          category: string;
        };
        Update: Partial<Database['public']['Tables']['courses']['Row']>;
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string | null;
          title: string;
          order_index: number;
          duration_minutes: number;
          content_markdown: string;
          example_code: string | null;
          components_used: Json;
          pinout_diagram_url: string | null;
          specs: Json;
          quiz_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['lessons']['Row']> & {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          content_markdown: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Row']>;
      };
      certificates: {
        Row: {
          id: string;
          code: string;
          user_id: string;
          course_id: string;
          title: string;
          grade_score: number;
          issue_date: string;
          verification_url: string;
          qr_code_data_url: string | null;
          pdf_url: string | null;
          revoked: boolean;
          revoked_reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['certificates']['Row']> & {
          code: string;
          user_id: string;
          course_id: string;
          title: string;
          grade_score: number;
          verification_url: string;
        };
        Update: Partial<Database['public']['Tables']['certificates']['Row']>;
      };
      components: {
        Row: {
          id: string;
          sku: string | null;
          name: string;
          category: string;
          dimensions_mm: Json | null;
          mass_grams: number | null;
          pins: Json;
          electrical_params: Json;
          physical_params: Json;
          artwork_2d_url: string | null;
          model_3d_url: string | null;
          schematic_symbol_url: string | null;
          datasheet_url: string | null;
          license: string;
          linked_store_sku: string | null;
          version: number;
          is_free_tier: boolean;
          price_inr: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['components']['Row']> & {
          id: string;
          name: string;
          category: string;
        };
        Update: Partial<Database['public']['Tables']['components']['Row']>;
      };
      circuit_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          graph_jsonb: Json;
          code: string;
          board: string;
          visibility: 'private' | 'public' | 'unlisted';
          is_sample: boolean;
          forked_from: string | null;
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['circuit_projects']['Row']> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['circuit_projects']['Row']>;
      };
      robot_templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          starter_code: string | null;
          parts_list: Json;
          model_3d_url: string | null;
          arena_id: string | null;
          difficulty: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['robot_templates']['Row']> & {
          id: string;
          name: string;
          slug: string;
        };
        Update: Partial<Database['public']['Tables']['robot_templates']['Row']>;
      };
      arenas: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          terrain_type: string;
          dimensions: Json | null;
          obstacles: Json;
          lighting: Json;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['arenas']['Row']> & {
          id: string;
          name: string;
          terrain_type: string;
        };
        Update: Partial<Database['public']['Tables']['arenas']['Row']>;
      };
      test_runs: {
        Row: {
          id: string;
          user_id: string;
          robot_design_id: string | null;
          arena_id: string | null;
          score: number;
          duration_seconds: number;
          telemetry_summary: Json;
          stars: number;
          passed: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['test_runs']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['test_runs']['Row']>;
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chat_sessions']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['chat_sessions']['Row']>;
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          mode: string | null;
          off_topic: boolean;
          had_image: boolean;
          model: string;
          tokens: number;
          rating: 'up' | 'down' | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chat_messages']['Row']> & {
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
        };
        Update: Partial<Database['public']['Tables']['chat_messages']['Row']>;
      };
      rituu_usage: {
        Row: {
          id: string;
          user_id: string;
          day_ist: string;
          messages_count: number;
          photos_count: number;
          estimated_cost_inr: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['rituu_usage']['Row']> & {
          user_id: string;
          day_ist: string;
        };
        Update: Partial<Database['public']['Tables']['rituu_usage']['Row']>;
      };
      shops: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          pincode: string | null;
          google_place_id: string | null;
          hours: string | null;
          categories: string[];
          verified_status: 'pending' | 'verified' | 'rejected';
          last_verified_at: string | null;
          photos: string[];
          rating: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['shops']['Row']> & {
          name: string;
          phone: string;
          address: string;
          city: string;
          state: string;
        };
        Update: Partial<Database['public']['Tables']['shops']['Row']>;
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          category_id: string;
          price_inr: number;
          mrp_inr: number;
          gst_percent: number;
          stock: number;
          images: string[];
          specs: Json;
          component_id: string | null;
          age_restricted: boolean;
          shipping_class: 'standard' | 'battery' | 'regulated_drone';
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          sku: string;
          name: string;
          category_id: string;
          price_inr: number;
          mrp_inr: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      kits: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          slug: string;
          description: string | null;
          price_inr: number;
          sum_of_parts_inr: number;
          robot_template_id: string | null;
          course_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['kits']['Row']> & {
          product_id: string;
          name: string;
          slug: string;
          price_inr: number;
          sum_of_parts_inr: number;
        };
        Update: Partial<Database['public']['Tables']['kits']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          address_id: string | null;
          total_amount_inr: number;
          tax_breakdown: Json;
          status: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          shipping_address: Json;
          shipping_class: string;
          payment_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']> & {
          user_id: string;
          order_number: string;
          total_amount_inr: number;
          shipping_address: Json;
        };
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      admin_overview: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      rituu_consume: {
        Args: { p_is_photo?: boolean };
        Returns: Json;
      };
      nearby_shops: {
        Args: {
          p_lat: number;
          p_lng: number;
          p_radius_m?: number;
          p_limit?: number;
        };
        Returns: {
          id: string;
          name: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          pincode: string;
          latitude: number;
          longitude: number;
          google_place_id: string;
          hours: string;
          categories: string[];
          verified_status: string;
          rating: number;
          distance_meters: number;
        }[];
      };
      create_order_from_cart: {
        Args: { p_address_id: string };
        Returns: Json;
      };
      finalize_order_payment: {
        Args: { p_order_id: string; p_razorpay_payment_id: string };
        Returns: Json;
      };
      touch_presence: {
        Args: { p_activity: string; p_project_id?: string };
        Returns: void;
      };
      issue_certificate: {
        Args: { p_course_id: string };
        Returns: Json;
      };
      verify_certificate: {
        Args: { p_code: string };
        Returns: Json;
      };
    };
  };
};
