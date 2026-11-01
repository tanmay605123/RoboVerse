export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DbUserRole = 'student' | 'teacher' | 'institution_admin' | 'admin' | 'store_admin' | 'support';
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
          dob: string | null;
          is_minor: boolean;
          school: string | null;
          school_or_college: string | null;
          class_level: string | null;
          city: string | null;
          pincode: string | null;
          state: string | null;
          country: string | null;
          interests: string[];
          language: string;
          avatar_url: string | null;
          level: string;
          xp: number;
          streak_days: number;
          parent_email: string | null;
          parental_consent_at: string | null;
          location_consent: boolean;
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
          dob?: string | null;
          is_minor?: boolean;
          school?: string | null;
          school_or_college?: string | null;
          class_level?: string | null;
          city?: string | null;
          pincode?: string | null;
          state?: string | null;
          country?: string | null;
          interests?: string[];
          language?: string;
          avatar_url?: string | null;
          level?: string;
          xp?: number;
          streak_days?: number;
          parent_email?: string | null;
          parental_consent_at?: string | null;
          location_consent?: boolean;
          last_seen_at?: string;
          current_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          full_name?: string;
          role?: DbUserRole;
          dob?: string | null;
          is_minor?: boolean;
          school?: string | null;
          school_or_college?: string | null;
          class_level?: string | null;
          city?: string | null;
          pincode?: string | null;
          state?: string | null;
          country?: string | null;
          interests?: string[];
          language?: string;
          avatar_url?: string | null;
          level?: string;
          xp?: number;
          streak_days?: number;
          parent_email?: string | null;
          parental_consent_at?: string | null;
          location_consent?: boolean;
          last_seen_at?: string;
          current_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      consents: {
        Row: {
          id: string;
          user_id: string;
          consent_type: string;
          granted: boolean;
          ip_address: string | null;
          user_agent: string | null;
          granted_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type: string;
          granted?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_type?: string;
          granted?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          granted_at?: string;
          revoked_at?: string | null;
        };
      };
      parental_consents: {
        Row: {
          id: string;
          minor_user_id: string;
          parent_email: string;
          parent_name: string | null;
          token: string;
          status: 'pending' | 'approved' | 'rejected';
          consent_for_purchases: boolean;
          consent_for_ai_photo: boolean;
          consent_for_public_projects: boolean;
          verified_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          minor_user_id: string;
          parent_email: string;
          parent_name?: string | null;
          token: string;
          status?: 'pending' | 'approved' | 'rejected';
          consent_for_purchases?: boolean;
          consent_for_ai_photo?: boolean;
          consent_for_public_projects?: boolean;
          verified_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          minor_user_id?: string;
          parent_email?: string;
          parent_name?: string | null;
          token?: string;
          status?: 'pending' | 'approved' | 'rejected';
          consent_for_purchases?: boolean;
          consent_for_ai_photo?: boolean;
          consent_for_public_projects?: boolean;
          verified_at?: string | null;
          expires_at?: string;
          created_at?: string;
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
          pricing?: Json;
          features?: Json;
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
          status: DbSubscriptionStatus;
          billing_cycle: DbBillingCycle;
          razorpay_subscription_id: string | null;
          razorpay_customer_id: string | null;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: DbSubscriptionStatus;
          billing_cycle?: DbBillingCycle;
          razorpay_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
          current_period_start?: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: DbSubscriptionStatus;
          billing_cycle?: DbBillingCycle;
          razorpay_subscription_id?: string | null;
          razorpay_customer_id?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          order_id: string | null;
          subscription_id: string | null;
          amount_inr: number;
          tax_inr: number;
          status: PaymentStatus;
          payment_method: PaymentMethod;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          upi_qr_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_id?: string | null;
          subscription_id?: string | null;
          amount_inr: number;
          tax_inr?: number;
          status?: PaymentStatus;
          payment_method?: PaymentMethod;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          upi_qr_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_id?: string | null;
          subscription_id?: string | null;
          amount_inr?: number;
          tax_inr?: number;
          status?: PaymentStatus;
          payment_method?: PaymentMethod;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          upi_qr_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      refunds: {
        Row: {
          id: string;
          payment_id: string | null;
          order_id: string | null;
          amount_inr: number;
          reason: string;
          status: 'pending' | 'processed' | 'failed';
          razorpay_refund_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payment_id?: string | null;
          order_id?: string | null;
          amount_inr: number;
          reason: string;
          status?: 'pending' | 'processed' | 'failed';
          razorpay_refund_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string | null;
          order_id?: string | null;
          amount_inr?: number;
          reason?: string;
          status?: 'pending' | 'processed' | 'failed';
          razorpay_refund_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          event_type: string;
          payload: Json;
          processed: boolean;
          error_log: string | null;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id: string;
          event_type: string;
          payload: Json;
          processed?: boolean;
          error_log?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          event_type?: string;
          payload?: Json;
          processed?: boolean;
          error_log?: string | null;
          created_at?: string;
          processed_at?: string | null;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_percent: number;
          max_discount_inr: number | null;
          min_order_inr: number;
          valid_until: string | null;
          is_active: boolean;
          usage_limit: number | null;
          times_used: number;
          created_at: string;
        };
        Insert: {
          id: string;
          code: string;
          discount_percent: number;
          max_discount_inr?: number | null;
          min_order_inr?: number;
          valid_until?: string | null;
          is_active?: boolean;
          usage_limit?: number | null;
          times_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percent?: number;
          max_discount_inr?: number | null;
          min_order_inr?: number;
          valid_until?: string | null;
          is_active?: boolean;
          usage_limit?: number | null;
          times_used?: number;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          tagline: string;
          description: string | null;
          track: string;
          duration_hours: number;
          required_plan_tier: DbPlanTier;
          cover_image: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          tagline: string;
          description?: string | null;
          track: string;
          duration_hours?: number;
          required_plan_tier?: DbPlanTier;
          cover_image?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          tagline?: string;
          description?: string | null;
          track?: string;
          duration_hours?: number;
          required_plan_tier?: DbPlanTier;
          cover_image?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id: string;
          course_id: string;
          title: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          course_id: string;
          slug: string;
          title: string;
          order_index: number;
          duration_minutes: number;
          xp_reward: number;
          is_free_preview: boolean;
          starter_code: string | null;
          sample_circuit_id: string | null;
          content_markdown: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          module_id: string;
          course_id: string;
          slug: string;
          title: string;
          order_index: number;
          duration_minutes?: number;
          xp_reward?: number;
          is_free_preview?: boolean;
          starter_code?: string | null;
          sample_circuit_id?: string | null;
          content_markdown?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          course_id?: string;
          slug?: string;
          title?: string;
          order_index?: number;
          duration_minutes?: number;
          xp_reward?: number;
          is_free_preview?: boolean;
          starter_code?: string | null;
          sample_circuit_id?: string | null;
          content_markdown?: string | null;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
          progress_percent: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string | null;
          progress_percent?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          progress_percent?: number;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          time_spent_seconds: number;
          last_code: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          completed_at?: string | null;
          time_spent_seconds?: number;
          last_code?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          time_spent_seconds?: number;
          last_code?: string | null;
        };
      };
      quizzes: {
        Row: {
          id: string;
          course_id: string | null;
          lesson_id: string | null;
          title: string;
          questions: Json;
          passing_score: number;
          created_at: string;
        };
        Insert: {
          id: string;
          course_id?: string | null;
          lesson_id?: string | null;
          title: string;
          questions?: Json;
          passing_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          lesson_id?: string | null;
          title?: string;
          questions?: Json;
          passing_score?: number;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          max_score: number;
          passed: boolean;
          answers: Json;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          max_score: number;
          passed: boolean;
          answers?: Json;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          max_score?: number;
          passed?: boolean;
          answers?: Json;
          attempted_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          certificate_code: string;
          user_id: string;
          course_id: string;
          student_name: string;
          student_id: string;
          course_name: string;
          track: string;
          hours: number;
          grade_score: number;
          is_revoked: boolean;
          revoked_reason: string | null;
          issuing_authority: string;
          issued_at: string;
          qr_verification_url: string;
          pdf_storage_path: string | null;
        };
        Insert: {
          id?: string;
          certificate_code: string;
          user_id: string;
          course_id: string;
          student_name: string;
          student_id: string;
          course_name: string;
          track: string;
          hours: number;
          grade_score?: number;
          is_revoked?: boolean;
          revoked_reason?: string | null;
          issuing_authority?: string;
          issued_at?: string;
          qr_verification_url: string;
          pdf_storage_path?: string | null;
        };
        Update: {
          id?: string;
          certificate_code?: string;
          user_id?: string;
          course_id?: string;
          student_name?: string;
          student_id?: string;
          course_name?: string;
          track?: string;
          hours?: number;
          grade_score?: number;
          is_revoked?: boolean;
          revoked_reason?: string | null;
          issuing_authority?: string;
          issued_at?: string;
          qr_verification_url?: string;
          pdf_storage_path?: string | null;
        };
      };
      components: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string | null;
          pins: Json;
          electrical_params: Json;
          physical_params: Json;
          asset_paths: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          category: string;
          description?: string | null;
          pins?: Json;
          electrical_params?: Json;
          physical_params?: Json;
          asset_paths?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          pins?: Json;
          electrical_params?: Json;
          physical_params?: Json;
          asset_paths?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      circuit_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          circuit_data: Json;
          arduino_code: string | null;
          is_public: boolean;
          is_sample: boolean;
          thumbnail_url: string | null;
          remix_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          circuit_data?: Json;
          arduino_code?: string | null;
          is_public?: boolean;
          is_sample?: boolean;
          thumbnail_url?: string | null;
          remix_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          circuit_data?: Json;
          arduino_code?: string | null;
          is_public?: boolean;
          is_sample?: boolean;
          thumbnail_url?: string | null;
          remix_count?: number;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      circuit_project_versions: {
        Row: {
          id: string;
          project_id: string;
          version_number: number;
          circuit_data: Json;
          arduino_code: string | null;
          commit_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version_number: number;
          circuit_data: Json;
          arduino_code?: string | null;
          commit_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          version_number?: number;
          circuit_data?: Json;
          arduino_code?: string | null;
          commit_message?: string | null;
          created_at?: string;
        };
      };
      robot_templates: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          urdf_data: string | null;
          parts_config: Json;
          default_arena_id: string | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          type: string;
          description?: string | null;
          urdf_data?: string | null;
          parts_config?: Json;
          default_arena_id?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          description?: string | null;
          urdf_data?: string | null;
          parts_config?: Json;
          default_arena_id?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
      };
      robot_designs: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          title: string;
          description: string | null;
          robot_data: Json;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          title: string;
          description?: string | null;
          robot_data?: Json;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          title?: string;
          description?: string | null;
          robot_data?: Json;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      arenas: {
        Row: {
          id: string;
          name: string;
          environment_type: string;
          physics_params: Json;
          obstacles: Json;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          environment_type: string;
          physics_params?: Json;
          obstacles?: Json;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          environment_type?: string;
          physics_params?: Json;
          obstacles?: Json;
          thumbnail_url?: string | null;
          created_at?: string;
        };
      };
      test_runs: {
        Row: {
          id: string;
          user_id: string;
          robot_design_id: string;
          arena_id: string | null;
          metrics: Json;
          score: number | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          robot_design_id: string;
          arena_id?: string | null;
          metrics?: Json;
          score?: number | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          robot_design_id?: string;
          arena_id?: string | null;
          metrics?: Json;
          score?: number | null;
          completed?: boolean;
          created_at?: string;
        };
      };
      activity_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          context_project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          context_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          context_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          sender: 'user' | 'rituu';
          content: string;
          off_topic: boolean;
          input_tokens: number;
          output_tokens: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          sender: 'user' | 'rituu';
          content: string;
          off_topic?: boolean;
          input_tokens?: number;
          output_tokens?: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          sender?: 'user' | 'rituu';
          content?: string;
          off_topic?: boolean;
          input_tokens?: number;
          output_tokens?: number;
          image_url?: string | null;
          created_at?: string;
        };
      };
      rituu_usage: {
        Row: {
          id: string;
          user_id: string;
          day_ist: string;
          messages_count: number;
          photos_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_ist: string;
          messages_count?: number;
          photos_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day_ist?: string;
          messages_count?: number;
          photos_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_cost_log: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          model: string;
          input_tokens: number;
          output_tokens: number;
          estimated_cost_usd: number;
          is_offtopic: boolean;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          model: string;
          input_tokens?: number;
          output_tokens?: number;
          estimated_cost_usd?: number;
          is_offtopic?: boolean;
          latency_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          model?: string;
          input_tokens?: number;
          output_tokens?: number;
          estimated_cost_usd?: number;
          is_offtopic?: boolean;
          latency_ms?: number | null;
          created_at?: string;
        };
      };
      shops: {
        Row: {
          id: string;
          name: string;
          google_place_id: string | null;
          phone: string | null;
          address: string;
          city: string;
          state: string | null;
          pincode: string | null;
          location: unknown;
          opening_hours: string | null;
          categories: string[];
          verified_status: VerifiedStatus;
          rating: number;
          review_count: number;
          photos: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          google_place_id?: string | null;
          phone?: string | null;
          address: string;
          city: string;
          state?: string | null;
          pincode?: string | null;
          location: unknown;
          opening_hours?: string | null;
          categories?: string[];
          verified_status?: VerifiedStatus;
          rating?: number;
          review_count?: number;
          photos?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          google_place_id?: string | null;
          phone?: string | null;
          address?: string;
          city?: string;
          state?: string | null;
          pincode?: string | null;
          location?: unknown;
          opening_hours?: string | null;
          categories?: string[];
          verified_status?: VerifiedStatus;
          rating?: number;
          review_count?: number;
          photos?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shop_inventory: {
        Row: {
          id: string;
          shop_id: string;
          component_id: string | null;
          in_stock: boolean;
          price_inr: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          component_id?: string | null;
          in_stock?: boolean;
          price_inr?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          component_id?: string | null;
          in_stock?: boolean;
          price_inr?: number | null;
          updated_at?: string;
        };
      };
      shop_reports: {
        Row: {
          id: string;
          shop_id: string;
          reported_by: string | null;
          report_type: string;
          notes: string | null;
          status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          reported_by?: string | null;
          report_type: string;
          notes?: string | null;
          status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          reported_by?: string | null;
          report_type?: string;
          notes?: string | null;
          status?: 'PENDING' | 'RESOLVED' | 'DISMISSED';
          created_at?: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
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
          age_restricted: boolean;
          shipping_class: ShippingClass;
          images: string[];
          specs: Json;
          description: string | null;
          component_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          sku: string;
          name: string;
          slug: string;
          category_id: string;
          price_inr: number;
          mrp_inr: number;
          gst_percent?: number;
          stock?: number;
          age_restricted?: boolean;
          shipping_class?: ShippingClass;
          images?: string[];
          specs?: Json;
          description?: string | null;
          component_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          slug?: string;
          category_id?: string;
          price_inr?: number;
          mrp_inr?: number;
          gst_percent?: number;
          stock?: number;
          age_restricted?: boolean;
          shipping_class?: ShippingClass;
          images?: string[];
          specs?: Json;
          description?: string | null;
          component_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      kits: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          price_inr: number;
          mrp_inr: number;
          level: string;
          shipping_class: ShippingClass;
          age_restricted: boolean;
          image: string | null;
          linked_course_slug: string | null;
          linked_circuit_sample_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          name: string;
          description?: string | null;
          price_inr: number;
          mrp_inr: number;
          level?: string;
          shipping_class?: ShippingClass;
          age_restricted?: boolean;
          image?: string | null;
          linked_course_slug?: string | null;
          linked_circuit_sample_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          price_inr?: number;
          mrp_inr?: number;
          level?: string;
          shipping_class?: ShippingClass;
          age_restricted?: boolean;
          image?: string | null;
          linked_course_slug?: string | null;
          linked_circuit_sample_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      kit_items: {
        Row: {
          id: string;
          kit_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          kit_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          kit_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string | null;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id?: string | null;
          user_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string | null;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id: string;
          address_id?: string | null;
          shipping_address: Json;
          subtotal_inr: number;
          gst_amount_inr: number;
          discount_inr?: number;
          total_inr: number;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          address_id?: string | null;
          shipping_address?: Json;
          subtotal_inr?: number;
          gst_amount_inr?: number;
          discount_inr?: number;
          total_inr?: number;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          sku: string;
          unit_price_inr: number;
          gst_percent: number;
          quantity: number;
          total_price_inr: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name: string;
          sku: string;
          unit_price_inr: number;
          gst_percent?: number;
          quantity?: number;
          total_price_inr: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          sku?: string;
          unit_price_inr?: number;
          gst_percent?: number;
          quantity?: number;
          total_price_inr?: number;
          created_at?: string;
        };
      };
      order_events: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      shipments: {
        Row: {
          id: string;
          order_id: string;
          courier: string;
          tracking_number: string;
          tracking_url: string | null;
          shipping_class: ShippingClass;
          status: string;
          dispatched_at: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          courier: string;
          tracking_number: string;
          tracking_url?: string | null;
          shipping_class?: ShippingClass;
          status?: string;
          dispatched_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          courier?: string;
          tracking_number?: string;
          tracking_url?: string | null;
          shipping_class?: ShippingClass;
          status?: string;
          dispatched_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          order_id: string;
          user_id: string;
          student_id: string;
          bill_to: Json;
          gstin: string | null;
          taxable_amount_inr: number;
          cgst_inr: number;
          sgst_inr: number;
          igst_inr: number;
          total_inr: number;
          pdf_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          order_id: string;
          user_id: string;
          student_id: string;
          bill_to: Json;
          gstin?: string | null;
          taxable_amount_inr: number;
          cgst_inr?: number;
          sgst_inr?: number;
          igst_inr?: number;
          total_inr: number;
          pdf_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          order_id?: string;
          user_id?: string;
          student_id?: string;
          bill_to?: Json;
          gstin?: string | null;
          taxable_amount_inr?: number;
          cgst_inr?: number;
          sgst_inr?: number;
          igst_inr?: number;
          total_inr?: number;
          pdf_url?: string | null;
          created_at?: string;
        };
      };
      hackathons: {
        Row: {
          id: string;
          slug: string;
          title: string;
          tagline: string;
          description: string | null;
          start_date: string;
          end_date: string;
          prize_pool_inr: number;
          is_active: boolean;
          max_team_size: number;
          tracks: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          tagline: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          prize_pool_inr?: number;
          is_active?: boolean;
          max_team_size?: number;
          tracks?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          tagline?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          prize_pool_inr?: number;
          is_active?: boolean;
          max_team_size?: number;
          tracks?: Json;
          created_at?: string;
        };
      };
      hackathon_registrations: {
        Row: {
          id: string;
          hackathon_id: string;
          user_id: string;
          team_name: string;
          role: string | null;
          project_title: string | null;
          project_url: string | null;
          submission_data: Json;
          registered_at: string;
        };
        Insert: {
          id?: string;
          hackathon_id: string;
          user_id: string;
          team_name: string;
          role?: string | null;
          project_title?: string | null;
          project_url?: string | null;
          submission_data?: Json;
          registered_at?: string;
        };
        Update: {
          id?: string;
          hackathon_id?: string;
          user_id?: string;
          team_name?: string;
          role?: string | null;
          project_title?: string | null;
          project_url?: string | null;
          submission_data?: Json;
          registered_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          stat_date: string;
          total_students: number;
          active_students: number;
          projects_created: number;
          certificates_issued: number;
          rituu_messages: number;
          revenue_inr: number;
          orders_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stat_date: string;
          total_students?: number;
          active_students?: number;
          projects_created?: number;
          certificates_issued?: number;
          rituu_messages?: number;
          revenue_inr?: number;
          orders_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          stat_date?: string;
          total_students?: number;
          active_students?: number;
          projects_created?: number;
          certificates_issued?: number;
          rituu_messages?: number;
          revenue_inr?: number;
          orders_count?: number;
          updated_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          target_type?: string;
          target_id?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          key: string;
          enabled: boolean;
          description: string | null;
          rollout_pct: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          enabled?: boolean;
          description?: string | null;
          rollout_pct?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          enabled?: boolean;
          description?: string | null;
          rollout_pct?: number;
          updated_at?: string;
        };
      };
      app_config: {
        Row: {
          key: string;
          value: string;
          is_public: boolean;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          is_public?: boolean;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          is_public?: boolean;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      current_entitlements: {
        Row: {
          user_id: string;
          student_id: string;
          full_name: string;
          role: DbUserRole;
          is_minor: boolean;
          has_parental_consent: boolean;
          plan_tier: DbPlanTier;
          plan_name: string;
          badge: string;
          store_discount_percent: number;
          rituu_daily_messages: number;
          rituu_daily_photos: number;
          max_saved_projects: number;
          allow_private_projects: boolean;
          official_certificates_allowed: boolean;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_current_entitlements: {
        Args: Record<PropertyKey, never>;
        Returns: {
          user_id: string | null;
          student_id: string | null;
          full_name: string | null;
          role: DbUserRole;
          is_minor: boolean;
          has_parental_consent: boolean;
          plan_tier: DbPlanTier;
          plan_name: string;
          badge: string;
          store_discount_percent: number;
          rituu_daily_messages: number;
          rituu_daily_photos: number;
          max_saved_projects: number;
          allow_private_projects: boolean;
          official_certificates_allowed: boolean;
        };
      };
      rituu_consume: {
        Args: {
          photo?: boolean;
        };
        Returns: {
          allowed: boolean;
          tier: string;
          photos_used: number;
          photos_limit: number;
          messages_used: number;
          messages_limit: number;
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
          address_id: string;
          coupon_code?: string;
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
      finalize_order_payment: {
        Args: {
          p_order_id: string;
          p_razorpay_payment_id: string;
        };
        Returns: void;
      };
      issue_certificate: {
        Args: {
          course_id: string;
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
          code: string;
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
          issuing_authority?: string;
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
          server_timestamp: string;
        };
      };
      admin_students: {
        Args: {
          search?: string;
          filters?: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Array<{
          student_id: string;
          name: string;
          school: string;
          city: string;
          plan: string;
          current_course: string;
          progress_percent: number;
          current_project: string;
          last_active: string;
        }>;
      };
      admin_set_role: {
        Args: {
          target_user_id: string;
          new_role: DbUserRole;
        };
        Returns: void;
      };
      admin_refund: {
        Args: {
          order_id: string;
          reason: string;
        };
        Returns: {
          success: boolean;
          refund_id: string;
        };
      };
      admin_revoke_certificate: {
        Args: {
          certificate_code: string;
          reason: string;
        };
        Returns: void;
      };
      touch_presence: {
        Args: {
          activity?: string;
          project_id?: string | null;
        };
        Returns: void;
      };
      refresh_daily_stats: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
}
