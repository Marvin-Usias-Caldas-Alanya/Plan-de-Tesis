-- =============================================================================
-- NutriStore — Arreglar catálogo cuando faltan customers / products
-- Ejecutar en Supabase SQL Editor (Run and enable RLS)
-- No borra la tabla antigua "productos" si existe.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.product_categories (id) ON DELETE SET NULL,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  document_id TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.product_categories (name, slug) VALUES
  ('Proteínas', 'proteinas'),
  ('Aminoácidos', 'aminoacidos'),
  ('Pre-entreno', 'pre-entreno'),
  ('Vitaminas', 'vitaminas'),
  ('Salud', 'salud')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, sku, name, description, price, stock, is_active)
SELECT c.id, v.sku, v.name, v.descr, v.price, v.stock, TRUE
FROM (VALUES
  ('proteinas', 'WHEY-2LB', 'Whey Protein Gold 2 lb', 'Proteína de suero 24g por porción.', 899, 45),
  ('aminoacidos', 'BCAA-400', 'BCAA 2:1:1 400g', 'Aminoácidos ramificados.', 429, 55),
  ('pre-entreno', 'PRE-300', 'Pre-Entreno Nitro X', 'Energía y foco.', 549, 28),
  ('vitaminas', 'MULTI-90', 'Multivitamínico Sport', '90 cápsulas.', 299, 80),
  ('salud', 'OMEGA-120', 'Omega 3 Ultra', '120 softgels.', 459, 50)
) AS v(slug, sku, name, descr, price, stock)
JOIN public.product_categories c ON c.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.sku = v.sku);

-- Crear fila en customers para cada perfil que no tenga una
INSERT INTO public.customers (profile_id)
SELECT p.id
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.profile_id = p.id
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_categories_read" ON public.product_categories;
CREATE POLICY "product_categories_read" ON public.product_categories FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "products_read_active" ON public.products;
CREATE POLICY "products_read_active" ON public.products FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "product_images_read" ON public.product_images;
CREATE POLICY "product_images_read" ON public.product_images FOR SELECT TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "customers_own" ON public.customers;
CREATE POLICY "customers_own" ON public.customers FOR ALL TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
