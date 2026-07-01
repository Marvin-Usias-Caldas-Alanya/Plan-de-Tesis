-- =============================================================================
-- NutriStore — Limpieza de datos duplicados (ejecutar una vez en Supabase)
-- Run and enable RLS
-- =============================================================================

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
