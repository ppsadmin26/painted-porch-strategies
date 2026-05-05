-- Full-schema dump + apply + audit helpers for migrate-export / migrate-import
-- Admin-only; introspects public schema (enums, tables, functions, triggers, policies, indexes).

CREATE OR REPLACE FUNCTION public.admin_schema_object_counts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN jsonb_build_object(
    'enums',     (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e'),
    'tables',    (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'),
    'functions', (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'),
    'triggers',  (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal),
    'policies',  (SELECT count(*) FROM pg_policies WHERE schemaname='public'),
    'indexes',   (SELECT count(*) FROM pg_indexes WHERE schemaname='public'),
    'rls_tables',(SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_dump_schema()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  out_sql text := '';
  r record;
  cols text;
  pk text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  out_sql := out_sql || E'-- Painted Porch full schema dump\n';
  out_sql := out_sql || E'-- Generated: ' || now()::text || E'\n';
  out_sql := out_sql || E'CREATE SCHEMA IF NOT EXISTS public;\n\n';

  -- ENUMS
  out_sql := out_sql || E'-- ===== ENUMS =====\n';
  FOR r IN
    SELECT t.typname,
           string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder) AS labels
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname
  LOOP
    out_sql := out_sql || format(
      E'DO $mig$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname=''public'' AND t.typname=%L) THEN CREATE TYPE public.%I AS ENUM (%s); END IF; END $mig$;\n',
      r.typname, r.typname, r.labels
    );
  END LOOP;
  out_sql := out_sql || E'\n';

  -- TABLES
  out_sql := out_sql || E'-- ===== TABLES =====\n';
  FOR r IN
    SELECT c.relname AS table_name, c.relrowsecurity AS rls
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relkind='r'
    ORDER BY c.relname
  LOOP
    SELECT string_agg(
      '  ' || quote_ident(column_name) || ' ' ||
      CASE
        WHEN data_type = 'USER-DEFINED' THEN quote_ident(udt_schema) || '.' || quote_ident(udt_name)
        WHEN data_type = 'ARRAY' THEN
          quote_ident(udt_schema) || '.' || quote_ident(substring(udt_name from 2)) || '[]'
        ELSE data_type
      END ||
      COALESCE(' DEFAULT ' || column_default, '') ||
      CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
      E',\n' ORDER BY ordinal_position)
    INTO cols
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name=r.table_name;

    out_sql := out_sql || E'CREATE TABLE IF NOT EXISTS public.' || quote_ident(r.table_name) || E' (\n' || cols || E'\n);\n';

    SELECT E'ALTER TABLE public.' || quote_ident(r.table_name) ||
           E' ADD CONSTRAINT ' || quote_ident(conname) || ' ' || pg_get_constraintdef(c.oid) || E';\n'
    INTO pk
    FROM pg_constraint c JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE n.nspname='public' AND cl.relname=r.table_name AND c.contype='p'
    LIMIT 1;
    IF pk IS NOT NULL THEN
      out_sql := out_sql || E'DO $mig$ BEGIN ' || replace(pk, E';\n', '') || E'; EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $mig$;\n';
    END IF;

    IF r.rls THEN
      out_sql := out_sql || E'ALTER TABLE public.' || quote_ident(r.table_name) || E' ENABLE ROW LEVEL SECURITY;\n';
    END IF;
    out_sql := out_sql || E'\n';
  END LOOP;

  -- FUNCTIONS
  out_sql := out_sql || E'-- ===== FUNCTIONS =====\n';
  FOR r IN
    SELECT pg_get_functiondef(p.oid) AS def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public'
    ORDER BY p.proname
  LOOP
    out_sql := out_sql || r.def || E';\n\n';
  END LOOP;

  -- TRIGGERS
  out_sql := out_sql || E'-- ===== TRIGGERS =====\n';
  FOR r IN
    SELECT t.tgname, c.relname,
           pg_get_triggerdef(t.oid) AS def
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND NOT t.tgisinternal
  LOOP
    out_sql := out_sql || E'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || E' ON public.' || quote_ident(r.relname) || E';\n';
    out_sql := out_sql || r.def || E';\n';
  END LOOP;
  out_sql := out_sql || E'\n';

  -- POLICIES
  out_sql := out_sql || E'-- ===== POLICIES =====\n';
  FOR r IN
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies WHERE schemaname='public'
    ORDER BY tablename, policyname
  LOOP
    out_sql := out_sql || format(
      E'DROP POLICY IF EXISTS %I ON public.%I;\nCREATE POLICY %I ON public.%I AS %s FOR %s TO %s%s%s;\n',
      r.policyname, r.tablename,
      r.policyname, r.tablename,
      r.permissive, r.cmd,
      array_to_string(r.roles, ', '),
      CASE WHEN r.qual IS NOT NULL THEN ' USING (' || r.qual || ')' ELSE '' END,
      CASE WHEN r.with_check IS NOT NULL THEN ' WITH CHECK (' || r.with_check || ')' ELSE '' END
    );
  END LOOP;
  out_sql := out_sql || E'\n';

  -- INDEXES (skip primary-key indexes; created by PK constraint)
  out_sql := out_sql || E'-- ===== INDEXES =====\n';
  FOR r IN
    SELECT indexdef
    FROM pg_indexes
    WHERE schemaname='public'
      AND indexname NOT IN (
        SELECT conname FROM pg_constraint c
        JOIN pg_class cl ON cl.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = cl.relnamespace
        WHERE n.nspname='public' AND c.contype='p'
      )
    ORDER BY tablename, indexname
  LOOP
    out_sql := out_sql || replace(r.indexdef, 'CREATE INDEX', 'CREATE INDEX IF NOT EXISTS') || E';\n';
  END LOOP;

  RETURN out_sql;
END;
$$;

-- Apply a SQL dump produced by admin_dump_schema. Admin-only.
-- Splits on $mig$/$$ blocks naively is risky — instead executes the whole text
-- in a single EXECUTE so DO blocks and CREATE FUNCTION ... $function$ ... $function$ work intact.
CREATE OR REPLACE FUNCTION public.admin_apply_sql(_sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _sql IS NULL OR length(_sql) = 0 THEN
    RAISE EXCEPTION 'empty sql';
  END IF;
  EXECUTE _sql;
  RETURN 'ok';
END;
$$;