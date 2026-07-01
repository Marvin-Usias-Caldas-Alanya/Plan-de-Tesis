-- =============================================================================
-- NutriStore — E-commerce completo (catálogos + carrito + pedidos + RLS)
-- Ejecutar en Supabase SQL Editor → Run and enable RLS
-- Requiere: profiles + fix_catalog_schema.sql (products, customers)
-- Seguro de re-ejecutar (IF NOT EXISTS)
-- =============================================================================

-- --- Catálogos de pedidos y pagos ---
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('admin', 'seller', 'customer')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.roles (code, name) VALUES
  ('admin', 'Administrador'),
  ('seller', 'Vendedor'),
  ('customer', 'Cliente')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.order_statuses (code, name, is_final) VALUES
  ('pending', 'Pendiente', FALSE),
  ('confirmed', 'Confirmado', FALSE),
  ('shipped', 'Enviado', FALSE),
  ('delivered', 'Entregado', TRUE),
  ('cancelled', 'Cancelado', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.payment_methods (code, name) VALUES
  ('cash', 'Efectivo'),
  ('card', 'Tarjeta'),
  ('transfer', 'Transferencia'),
  ('mercadopago', 'Mercado Pago')
ON CONFLICT (code) DO NOTHING;

-- --- Funciones RLS (profiles.role o profiles.role_id) ---
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.current_role_code()
      RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
      AS $fn$
        SELECT r.code FROM public.profiles p
        JOIN public.roles r ON r.id = p.role_id WHERE p.id = auth.uid();
      $fn$;
    $sql$;
  ELSE
    EXECUTE $sql$
      CREATE OR REPLACE FUNCTION public.current_role_code()
      RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
      AS $fn$
        SELECT p.role::text FROM public.profiles p WHERE p.id = auth.uid();
      $fn$;
    $sql$;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.current_role_code() = 'admin'; $$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.current_role_code() IN ('admin', 'seller'); $$;

-- --- Tablas e-commerce ---
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  employee_code TEXT UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers (id),
  status_id UUID NOT NULL REFERENCES public.order_statuses (id),
  seller_id UUID REFERENCES public.sellers (id),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders (id),
  sale_number TEXT UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers (id),
  total_amount NUMERIC(12, 2) NOT NULL,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id),
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods (id),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sellers_staff" ON public.sellers;
CREATE POLICY "sellers_staff" ON public.sellers FOR SELECT TO authenticated
  USING (public.is_staff() OR profile_id = auth.uid());

DROP POLICY IF EXISTS "sellers_admin" ON public.sellers;
CREATE POLICY "sellers_admin" ON public.sellers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "non_mvp_carts" ON public.carts;
CREATE POLICY "non_mvp_carts" ON public.carts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));

DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;
CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.carts ct
      JOIN public.customers c ON c.id = ct.customer_id
      WHERE ct.id = cart_id AND c.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts ct
      JOIN public.customers c ON c.id = ct.customer_id
      WHERE ct.id = cart_id AND c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "orders_own" ON public.orders;
CREATE POLICY "orders_own" ON public.orders FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid())
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "orders_insert" ON public.orders;
CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_staff_update" ON public.orders;
CREATE POLICY "orders_staff_update" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "order_details_read" ON public.order_details;
CREATE POLICY "order_details_read" ON public.order_details FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND (c.profile_id = auth.uid() OR public.is_staff())
    )
  );

DROP POLICY IF EXISTS "order_details_insert" ON public.order_details;
CREATE POLICY "order_details_insert" ON public.order_details FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND c.profile_id = auth.uid()
    )
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "sales_staff" ON public.sales;
CREATE POLICY "sales_staff" ON public.sales FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "sale_details_staff" ON public.sale_details;
CREATE POLICY "sale_details_staff" ON public.sale_details FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "payments_staff" ON public.payments;
CREATE POLICY "payments_staff" ON public.payments FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "payments_customer_read" ON public.payments;
CREATE POLICY "payments_customer_read" ON public.payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payments_customer_insert" ON public.payments;
CREATE POLICY "payments_customer_insert" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND c.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "products_stock_staff" ON public.products;
CREATE POLICY "products_stock_staff" ON public.products FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "sellers_update_own" ON public.sellers;
CREATE POLICY "sellers_update_own" ON public.sellers FOR UPDATE TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
