export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DbUserRole = 'student' | 'teacher' | 'institution_admin' | 'admin' | 'store_admin';
export type DbPlanTier = 'free' | 'plus' | 'pro' | 'institution';
export type DbBillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'one_time';
export type PaymentMethod = 'checkout' | 'qr';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'expired';
export type DbSubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type ShippingClass = 'standard' | 'battery' | 'regulated_drone';
export type VerifiedStatus = 'pending' | 'verified' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          student_id: string;
          full_name: string;
          role: DbUserRole;
          school_or_college: string | null;
          class_level: string | null;
          city: string | null;
          pincode: string | null;
          state: string | null;
          country: string | null;
          interests: string[];
          language: string;
          is_minor: boolean;
          parent_email: string | null;
          parental_consent_at: string | null;
          location_consent: boolean;
          avatar_url: string | null;
          level: string;
          xp: number;
          streak_days: number;
          last_seen_at: string;
          current_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          student_id?: string;
          full_name: string;
          role?: DbUserRole;
          school_or_college?: string | null;
          class_level?: string | null;
          city?: string | null;
          pincode?: string | null;
          state?: string | null;
          country?: string | null;
          interests?: string[];
          language?: string;
          is_minor?: boolean;
          parent_email?: string | null;
          parental_consent_at?: string | null;
          location_consent?: boolean;
          avatar_url?: string | null;
          level?: string;
          xp?: number;
          streak_days?: number;
          last_seen_at?: string;
          current_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: never; // immutable
          full_name?: string;
          role?: never; // cannot be changed directly
          school_or_college?: string | null;
          class_level?: string | null;
          city?: string | null;
          pincode?: string | null;
          state?: string | null;
          country?: string | null;
          interests?: string[];
          language?: string;
          is_minor?: boolean;
          parent_email?: string | null;
          parental_consent_at?: string | null;
          location_consent?: boolean;
          avatar_url?: string | null;
          level?: string;
          xp?: number;
          streak_days?: number;
          last_seen_at?: string;
          current_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      plans: {
        Row: {
          id: string;
          tier: DbPlanTier;
          name: string;
          tagline: string;
          badge: string | null;
          is_popular: boolean;
          pricing: Json;
          features: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tier: DbPlanTier;
          name: string;
          tagline: string;
          badge?: string | null;
          is_popular?: boolean;
          pricing: Json;
          features: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tier?: DbPlanTier;
          name?: string;
          tagline?: string;
          badge?: string | null;
          is_popular?: boolean;
          pricing?: Json;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          billing_cycle: DbBillingCycle;
          status: DbSubscriptionStatus;
          razorpay_subscription_id: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          grace_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          billing_cycle: DbBillingCycle;
          status?: DbSubscriptionStatus;
          razorpay_subscription_id?: string | null;
          current_period_start?: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          grace_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          billing_cycle?: DbBillingCycle;
          status?: DbSubscriptionStatus;
          razorpay_subscription_id?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          grace_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      circuit_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          graph_jsonb: Json;
          code: string;
          board: string;
          visibility: 'private' | 'public' | 'unlisted';
          is_sample: boolean;
          forked_from: string | null;
          thumbnail_url: string | null;
          view_count: number;
          fork_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          graph_jsonb?: Json;
          code?: string;
          board?: string;
          visibility?: 'private' | 'public' | 'unlisted';
          is_sample?: boolean;
          forked_from?: string | null;
          thumbnail_url?: string | null;
          view_count?: number;
          fork_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          graph_jsonb?: Json;
          code?: string;
          board?: string;
          visibility?: 'private' | 'public' | 'unlisted';
          is_sample?: boolean;
          forked_from?: string | null;
          thumbnail_url?: string | null;
          view_count?: number;
          fork_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      components: {
        Row: {
          id: string;
          name: string;
          category: string;
          subcategory: string | null;
          is_free_tier: boolean;
          price_inr: number;
          dimensions_mm: Json;
          mass_g: number;
          pins: Json;
          electrical_params: Json;
          physical_params: Json;
          artwork_2d_svg: string | null;
          model_3d_glb_url: string | null;
          schematic_symbol_svg: string | null;
          datasheet_url: string | null;
          linked_store_sku: string | null;
          license: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
      };

      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          track: string;
          level: string;
          thumbnail_url: string | null;
          is_official_certificate: boolean;
          duration_hours: number;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string;
          title: string;
          slug: string;
          description: string | null;
          content: string;
          example_code: string | null;
          components_used: string[];
          pinout_specs: Json;
          video_url: string | null;
          starter_circuit_id: string | null;
          duration_minutes: number;
          order_index: number;
          created_at: string;
        };
      };

      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          slug: string;
          category_id: string;
          price_inr: number;
          mrp_inr: number;
          gst_percent: number;
          stock: number;
          images: string[];
          specs: Json;
          component_id: string | null;
          age_restricted: boolean;
          shipping_class: ShippingClass;
          is_active: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          address_id: string | null;
          shipping_address: Json;
          subtotal_inr: number;
          gst_amount_inr: number;
          discount_inr: number;
          total_inr: number;
          status: OrderStatus;
          payment_method: PaymentMethod;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          tracking_number: string | null;
          courier: string | null;
          invoice_url: string | null;
          created_at: string;
          updated_at: string;
        };
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
          pincode: string;
          google_place_id: string | null;
          opening_hours: string;
          categories: string[];
          verified_status: VerifiedStatus;
          last_verified_at: string | null;
          photos: string[];
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
      };
    };

    Functions: {
      generate_student_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      touch_presence: {
        Args: {
          p_activity?: string;
          p_project_id?: string;
        };
        Returns: void;
      };
      rituu_consume: {
        Args: {
          p_photo?: boolean;
        };
        Returns: {
          allowed: boolean;
          tier: DbPlanTier;
          messages_used: number;
          messages_limit: number;
          photos_used: number;
          photos_limit: number;
          reason?: string;
        };
      };
      nearby_shops: {
        Args: {
          lat: number;
          lng: number;
          radius_m?: number;
          p_limit?: number;
        };
        Returns: Array<{
          id: string;
          name: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          pincode: string;
          latitude: number;
          longitude: number;
          distance_meters: number;
          opening_hours: string;
          categories: string[];
          verified_status: VerifiedStatus;
          rating: number;
          photos: string[];
        }>;
      };
      create_order_from_cart: {
        Args: {
          p_address_id: string;
          p_coupon_code?: string;
        };
        Returns: {
          order_id: string;
          order_number: string;
          subtotal_inr: number;
          discount_inr: number;
          gst_amount_inr: number;
          total_inr: number;
        };
      };
      issue_certificate: {
        Args: {
          p_course_id: string;
        };
        Returns: {
          status: string;
          certificate_id: string;
          certificate_code: string;
          student_name: string;
          course_name: string;
        };
      };
      verify_certificate: {
        Args: {
          p_certificate_code: string;
        };
        Returns: {
          valid: boolean;
          certificate_code: string;
          student_name: string;
          student_id: string;
          course_name: string;
          track: string;
          hours: number;
          grade_score: number;
          issued_at: string;
          is_revoked: boolean;
          revoked_reason?: string;
        };
      };
      admin_overview: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_students: number;
          active_24h: number;
          active_7d: number;
          online_now: number;
          working_on_projects: number;
          projects_created: number;
          enrollments_count: number;
          certificates_issued: number;
          rituu_messages_today: number;
          rituu_offtopic_today: number;
          total_revenue_inr: number;
          orders_count: number;
          open_shop_reports: number;
        };
      };
    };
  };
}
