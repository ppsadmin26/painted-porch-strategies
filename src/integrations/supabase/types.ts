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
      access_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          slot_key: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          slot_key: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          slot_key?: string
          token?: string
        }
        Relationships: []
      }
      backup_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          failed_steps: Json | null
          finished_at: string | null
          id: string
          kind: string
          logs: Json
          parent_run_id: string | null
          size_bytes: number | null
          started_at: string | null
          status: string
          storage_object_count: number | null
          storage_path: string
          table_row_counts: Json | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          failed_steps?: Json | null
          finished_at?: string | null
          id?: string
          kind?: string
          logs?: Json
          parent_run_id?: string | null
          size_bytes?: number | null
          started_at?: string | null
          status?: string
          storage_object_count?: number | null
          storage_path: string
          table_row_counts?: Json | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          failed_steps?: Json | null
          finished_at?: string | null
          id?: string
          kind?: string
          logs?: Json
          parent_run_id?: string | null
          size_bytes?: number | null
          started_at?: string | null
          status?: string
          storage_object_count?: number | null
          storage_path?: string
          table_row_counts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "backup_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_settings: {
        Row: {
          id: boolean
          retention_days: number
          retention_days_monthly: number
          retention_days_weekly: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          retention_days?: number
          retention_days_monthly?: number
          retention_days_weekly?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          retention_days?: number
          retention_days_monthly?: number
          retention_days_weekly?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          slug: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          slug: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          is_primary: boolean
          post_id: string
        }
        Insert: {
          category_id: string
          is_primary?: boolean
          post_id: string
        }
        Update: {
          category_id?: string
          is_primary?: boolean
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          aeo_tags: string[] | null
          author_id: string | null
          body_json: Json | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          geo_tags: string[] | null
          id: string
          publish_date: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string | null
          status: Database["public"]["Enums"]["blog_post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          aeo_tags?: string[] | null
          author_id?: string | null
          body_json?: Json | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          geo_tags?: string[] | null
          id?: string
          publish_date?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["blog_post_status"]
          title?: string
          updated_at?: string
        }
        Update: {
          aeo_tags?: string[] | null
          author_id?: string | null
          body_json?: Json | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          geo_tags?: string[] | null
          id?: string
          publish_date?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["blog_post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      course_launch_status: {
        Row: {
          admin_alert_enabled: boolean
          checkout_url: string | null
          course_name: string
          course_path: string
          created_at: string
          last_notify_error: string | null
          notified_at: string | null
          notified_count: number
          program_type: string
          signup_confirmation_enabled: boolean
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_alert_enabled?: boolean
          checkout_url?: string | null
          course_name: string
          course_path: string
          created_at?: string
          last_notify_error?: string | null
          notified_at?: string | null
          notified_count?: number
          program_type?: string
          signup_confirmation_enabled?: boolean
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_alert_enabled?: boolean
          checkout_url?: string | null
          course_name?: string
          course_path?: string
          created_at?: string
          last_notify_error?: string | null
          notified_at?: string | null
          notified_count?: number
          program_type?: string
          signup_confirmation_enabled?: boolean
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          attempt: number | null
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          attempt?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          attempt?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          max_attempts: number
          retry_after_until: string | null
          retry_backoff_base_ms: number
          retry_backoff_max_ms: number
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          max_attempts?: number
          retry_after_until?: string | null
          retry_backoff_base_ms?: number
          retry_backoff_max_ms?: number
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          max_attempts?: number
          retry_after_until?: string | null
          retry_backoff_base_ms?: number
          retry_backoff_max_ms?: number
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      github_sync_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string | null
          payload: Json | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message?: string | null
          payload?: Json | null
          source: string
          status: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string | null
          payload?: Json | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      github_sync_status: {
        Row: {
          details: Json | null
          id: number
          last_alert_sent_at: string | null
          last_check_at: string | null
          last_error_message: string | null
          last_failure_at: string | null
          last_success_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          details?: Json | null
          id?: number
          last_alert_sent_at?: string | null
          last_check_at?: string | null
          last_error_message?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          details?: Json | null
          id?: number
          last_alert_sent_at?: string | null
          last_check_at?: string | null
          last_error_message?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_appearance_categories: {
        Row: {
          appearance_id: string
          category_id: string
        }
        Insert: {
          appearance_id: string
          category_id: string
        }
        Update: {
          appearance_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_appearance_categories_appearance_id_fkey"
            columns: ["appearance_id"]
            isOneToOne: false
            referencedRelation: "media_appearances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_appearance_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      media_appearances: {
        Row: {
          appearance_date: string | null
          created_at: string
          description: string | null
          external_url: string | null
          featured: boolean
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          show_name: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appearance_date?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          featured?: boolean
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          show_name: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appearance_date?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          featured?: boolean
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          show_name?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          aeo_faqs: Json | null
          aeo_summary: string | null
          canonical: string | null
          created_at: string
          description: string | null
          id: string
          jsonld: Json | null
          keywords: string[] | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          path: string
          robots: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aeo_faqs?: Json | null
          aeo_summary?: string | null
          canonical?: string | null
          created_at?: string
          description?: string | null
          id?: string
          jsonld?: Json | null
          keywords?: string[] | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          path: string
          robots?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aeo_faqs?: Json | null
          aeo_summary?: string | null
          canonical?: string | null
          created_at?: string
          description?: string | null
          id?: string
          jsonld?: Json | null
          keywords?: string[] | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          path?: string
          robots?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      page_status: {
        Row: {
          category: string
          created_at: string
          id: string
          note: string | null
          path: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          note?: string | null
          path: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          note?: string | null
          path?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      path_finder_offerings: {
        Row: {
          anchor_id: string | null
          b2b_rt_pools: Json
          b2c_rt_pools: Json
          blurb: string
          created_at: string
          current_url: string
          dedicated_url: string | null
          description: string | null
          facilitator: string | null
          id: string
          include_in_workshops: boolean
          is_featured_in_quiz: boolean
          is_live: boolean
          launch_slug: string | null
          name: string
          notes: string | null
          offering_key: string
          sort_order: number
          tier: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          anchor_id?: string | null
          b2b_rt_pools?: Json
          b2c_rt_pools?: Json
          blurb: string
          created_at?: string
          current_url: string
          dedicated_url?: string | null
          description?: string | null
          facilitator?: string | null
          id?: string
          include_in_workshops?: boolean
          is_featured_in_quiz?: boolean
          is_live?: boolean
          launch_slug?: string | null
          name: string
          notes?: string | null
          offering_key: string
          sort_order?: number
          tier: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          anchor_id?: string | null
          b2b_rt_pools?: Json
          b2c_rt_pools?: Json
          blurb?: string
          created_at?: string
          current_url?: string
          dedicated_url?: string | null
          description?: string | null
          facilitator?: string | null
          id?: string
          include_in_workshops?: boolean
          is_featured_in_quiz?: boolean
          is_live?: boolean
          launch_slug?: string | null
          name?: string
          notes?: string | null
          offering_key?: string
          sort_order?: number
          tier?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      policy_update_notifications: {
        Row: {
          created_at: string
          id: string
          recipient_count: number
          sections: Json
          sent_at: string
          sent_by: string | null
          source: string
          summary: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_count?: number
          sections?: Json
          sent_at?: string
          sent_by?: string | null
          source?: string
          summary: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_count?: number
          sections?: Json
          sent_at?: string
          sent_by?: string | null
          source?: string
          summary?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          author_bio: string | null
          avatar_url: string | null
          created_at: string
          editor_sections: string[]
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          is_author: boolean
          is_guest_author: boolean
          role: string
          updated_at: string
        }
        Insert: {
          author_bio?: string | null
          avatar_url?: string | null
          created_at?: string
          editor_sections?: string[]
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          is_author?: boolean
          is_guest_author?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          author_bio?: string | null
          avatar_url?: string | null
          created_at?: string
          editor_sections?: string[]
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_author?: boolean
          is_guest_author?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          name: string
          processed_at: string | null
          program: string
          purchase_date: string
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          processed_at?: string | null
          program: string
          purchase_date: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          processed_at?: string | null
          program?: string
          purchase_date?: string
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_video_slots: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          label: string
          slot_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          label: string
          slot_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          label?: string
          slot_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_videos: {
        Row: {
          created_at: string
          id: string
          poster_path: string | null
          poster_url: string | null
          slot_key: string
          storage_path: string | null
          updated_at: string
          updated_by: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          poster_path?: string | null
          poster_url?: string | null
          slot_key: string
          storage_path?: string | null
          updated_at?: string
          updated_by?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          poster_path?: string | null
          poster_url?: string | null
          slot_key?: string
          storage_path?: string | null
          updated_at?: string
          updated_by?: string | null
          video_url?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      youtube_video_categories: {
        Row: {
          category_id: string
          video_id: string
        }
        Insert: {
          category_id: string
          video_id: string
        }
        Update: {
          category_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_video_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youtube_video_categories_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "youtube_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_videos: {
        Row: {
          channel_title: string | null
          content_type: Database["public"]["Enums"]["youtube_content_type"]
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean
          id: string
          playlist: string | null
          published_date: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_url: string
          youtube_video_id: string
        }
        Insert: {
          channel_title?: string | null
          content_type?: Database["public"]["Enums"]["youtube_content_type"]
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          playlist?: string | null
          published_date?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_url: string
          youtube_video_id: string
        }
        Update: {
          channel_title?: string | null
          content_type?: Database["public"]["Enums"]["youtube_content_type"]
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          playlist?: string | null
          published_date?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string
          youtube_video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_authors: {
        Row: {
          author_bio: string | null
          avatar_url: string | null
          full_name: string | null
          id: string | null
          is_author: boolean | null
          is_guest_author: boolean | null
        }
        Insert: {
          author_bio?: string | null
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          is_author?: boolean | null
          is_guest_author?: boolean | null
        }
        Update: {
          author_bio?: string | null
          avatar_url?: string | null
          full_name?: string | null
          id?: string | null
          is_author?: boolean | null
          is_guest_author?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_apply_sql: { Args: { _sql: string }; Returns: string }
      admin_check_email_infra: { Args: never; Returns: Json }
      admin_dump_config: { Args: never; Returns: string }
      admin_dump_schema: { Args: never; Returns: string }
      admin_email_delete_message: {
        Args: { _kind: string; _msg_id: number; _queue: string }
        Returns: Json
      }
      admin_email_delete_message_batch: {
        Args: { _kind: string; _msg_ids: number[]; _queue: string }
        Returns: Json
      }
      admin_email_dlq_list: { Args: { _limit?: number }; Returns: Json }
      admin_email_log: {
        Args: {
          _limit?: number
          _offset?: number
          _search?: string
          _since?: string
          _status?: string
          _template?: string
        }
        Returns: {
          created_at: string
          error_message: string
          message_id: string
          recipient_email: string
          status: string
          template_name: string
        }[]
      }
      admin_email_purge_dlq: { Args: { _queue: string }; Returns: Json }
      admin_email_queue_health: { Args: never; Returns: Json }
      admin_email_queue_messages: {
        Args: { _kind?: string; _limit?: number; _queue?: string }
        Returns: Json
      }
      admin_email_requeue_dlq: {
        Args: { _msg_id: number; _queue: string }
        Returns: Json
      }
      admin_email_requeue_dlq_batch: {
        Args: { _msg_ids: number[]; _queue: string }
        Returns: Json
      }
      admin_email_reset_stuck: {
        Args: { _action?: string; _msg_id: number; _queue: string }
        Returns: Json
      }
      admin_email_stats: { Args: { _since?: string }; Returns: Json }
      admin_email_suppressions: {
        Args: { _limit?: number }
        Returns: {
          created_at: string
          email: string
          metadata: Json
          reason: string
        }[]
      }
      admin_get_github_sync_status: { Args: never; Returns: Json }
      admin_list_backup_schedules: {
        Args: never
        Returns: {
          active: boolean
          jobid: number
          jobname: string
          next_run: string
          schedule: string
        }[]
      }
      admin_list_offering_notes: {
        Args: never
        Returns: {
          id: string
          notes: string
          offering_key: string
        }[]
      }
      admin_list_page_status_notes: {
        Args: never
        Returns: {
          id: string
          note: string
          path: string
        }[]
      }
      admin_schema_object_counts: { Args: never; Returns: Json }
      admin_set_backup_schedule_active: {
        Args: { _active: boolean; _jobname: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      set_email_vt: {
        Args: { message_id: number; queue_name: string; vt_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      blog_post_status:
        | "draft"
        | "pending"
        | "approved"
        | "scheduled"
        | "published"
      media_type:
        | "podcast"
        | "interview"
        | "article"
        | "webinar"
        | "video"
        | "panel"
      youtube_content_type: "original" | "appearance"
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
    Enums: {
      blog_post_status: [
        "draft",
        "pending",
        "approved",
        "scheduled",
        "published",
      ],
      media_type: [
        "podcast",
        "interview",
        "article",
        "webinar",
        "video",
        "panel",
      ],
      youtube_content_type: ["original", "appearance"],
    },
  },
} as const
