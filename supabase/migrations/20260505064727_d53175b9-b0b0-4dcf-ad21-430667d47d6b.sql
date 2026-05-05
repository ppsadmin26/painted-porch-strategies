-- Helper RPC: dumps storage bucket settings, storage.objects RLS policies,
-- and realtime publication membership as a single idempotent SQL script.
-- Excludes ALL secrets. Safe to ship inside backup zips.
CREATE OR REPLACE FUNCTION public.admin_dump_config()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  out_sql text := '';
  r record;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  out_sql := out_sql || E'-- Painted Porch non-secret config dump\n';
  out_sql := out_sql || E'-- Generated: ' || now()::text || E'\n';
  out_sql := out_sql || E'-- Run this in your new Supabase project AFTER schema.sql.\n\n';

  -- ===== STORAGE BUCKETS =====
  out_sql := out_sql || E'-- ===== STORAGE BUCKETS =====\n';
  FOR r IN
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets
    ORDER BY id
  LOOP
    out_sql := out_sql || format(
      E'INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)\nVALUES (%L, %L, %L, %s, %L)\nON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;\n',
      r.id, r.name, r.public,
      COALESCE(r.file_size_limit::text, 'NULL'),
      r.allowed_mime_types
    );
  END LOOP;
  out_sql := out_sql || E'\n';

  -- ===== STORAGE OBJECT POLICIES =====
  out_sql := out_sql || E'-- ===== STORAGE OBJECT RLS POLICIES =====\n';
  FOR r IN
    SELECT policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    ORDER BY policyname
  LOOP
    out_sql := out_sql || format(
      E'DROP POLICY IF EXISTS %I ON storage.objects;\nCREATE POLICY %I ON storage.objects AS %s FOR %s TO %s%s%s;\n',
      r.policyname, r.policyname, r.permissive, r.cmd,
      array_to_string(r.roles, ', '),
      CASE WHEN r.qual IS NOT NULL THEN ' USING (' || r.qual || ')' ELSE '' END,
      CASE WHEN r.with_check IS NOT NULL THEN ' WITH CHECK (' || r.with_check || ')' ELSE '' END
    );
  END LOOP;
  out_sql := out_sql || E'\n';

  -- ===== REALTIME PUBLICATION MEMBERSHIP =====
  out_sql := out_sql || E'-- ===== REALTIME PUBLICATION =====\n';
  out_sql := out_sql || E'DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = ''supabase_realtime'') THEN CREATE PUBLICATION supabase_realtime; END IF; END $mig$;\n';
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
    ORDER BY tablename
  LOOP
    out_sql := out_sql || format(
      E'DO $mig$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE %I.%I; EXCEPTION WHEN duplicate_object THEN NULL; END $mig$;\n',
      r.schemaname, r.tablename
    );
  END LOOP;
  out_sql := out_sql || E'\n';

  RETURN out_sql;
END;
$function$;