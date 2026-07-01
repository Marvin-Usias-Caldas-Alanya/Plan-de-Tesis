-- =============================================================================
-- NutriStore — Limpieza de datos duplicados (ejecutar una vez en Supabase)
-- Run and enable RLS
-- =============================================================================

-- Columna full_name en profiles (compatibilidad con app moderna)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nombre'
  ) THEN
    UPDATE public.profiles
    SET full_name = COALESCE(NULLIF(TRIM(full_name), ''), nombre)
    WHERE nombre IS NOT NULL AND (full_name IS NULL OR TRIM(full_name) = '');
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'name'
  ) THEN
    UPDATE public.profiles
    SET full_name = COALESCE(NULLIF(TRIM(full_name), ''), name)
    WHERE name IS NOT NULL AND (full_name IS NULL OR TRIM(full_name) = '');
  END IF;

  UPDATE public.profiles
  SET full_name = email
  WHERE (full_name IS NULL OR TRIM(full_name) = '') AND email IS NOT NULL;
END $$;

-- Unificar customers duplicados por profile_id (conservar el más antiguo)
WITH ranked AS (
  SELECT
    id,
    profile_id,
    ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
  FROM public.customers
),
dupes AS (
  SELECT r.id AS dupe_id, k.id AS keep_id
  FROM ranked r
  JOIN ranked k ON k.profile_id = r.profile_id AND k.rn = 1
  WHERE r.rn > 1
)
UPDATE public.carts c
SET customer_id = d.keep_id
FROM dupes d
WHERE c.customer_id = d.dupe_id;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    WITH ranked AS (
      SELECT
        id,
        profile_id,
        ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
      FROM public.customers
    ),
    dupes AS (
      SELECT r.id AS dupe_id, k.id AS keep_id
      FROM ranked r
      JOIN ranked k ON k.profile_id = r.profile_id AND k.rn = 1
      WHERE r.rn > 1
    )
    UPDATE public.orders o
    SET customer_id = d.keep_id
    FROM dupes d
    WHERE o.customer_id = d.dupe_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sales'
  ) THEN
    WITH ranked AS (
      SELECT
        id,
        profile_id,
        ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
      FROM public.customers
    ),
    dupes AS (
      SELECT r.id AS dupe_id, k.id AS keep_id
      FROM ranked r
      JOIN ranked k ON k.profile_id = r.profile_id AND k.rn = 1
      WHERE r.rn > 1
    )
    UPDATE public.sales s
    SET customer_id = d.keep_id
    FROM dupes d
    WHERE s.customer_id = d.dupe_id;
  END IF;
END $$;

WITH ranked AS (
  SELECT
    id,
    profile_id,
    ROW_NUMBER() OVER (PARTITION BY profile_id ORDER BY created_at ASC NULLS LAST, id ASC) AS rn
  FROM public.customers
),
dupes AS (
  SELECT r.id AS dupe_id
  FROM ranked r
  WHERE r.rn > 1
)
DELETE FROM public.customers c
USING dupes d
WHERE c.id = d.dupe_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_one_per_profile
  ON public.customers (profile_id);

-- Dejar solo un carrito activo por cliente (el más reciente)
WITH ranked AS (
  SELECT
    id,
    customer_id,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY created_at DESC
    ) AS rn
  FROM public.carts
  WHERE status = 'active'
)
UPDATE public.carts c
SET status = 'abandoned', updated_at = NOW()
FROM ranked r
WHERE c.id = r.id AND r.rn > 1;

-- Evitar carritos activos duplicados en el futuro
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_one_active_per_customer
  ON public.carts (customer_id)
  WHERE status = 'active';

-- Asegurar fila en customers para cada perfil
INSERT INTO public.customers (profile_id)
SELECT p.id
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.profile_id = p.id
);
