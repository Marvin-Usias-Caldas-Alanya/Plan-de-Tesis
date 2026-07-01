-- =============================================================================
-- NutriStore — Esquema final (50 tablas) — orden de dependencias corregido
-- Tesis: Sistema Híbrido IA + Handoff Humano — Suplementos Nutricionales
-- Ejecutar completo en Supabase SQL Editor (proyecto vacío o reset de public)
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. FUNCIONES SIN DEPENDENCIA DE TABLAS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 3. TABLAS (orden obligatorio — CREATE TABLE IF NOT EXISTS)
-- =============================================================================

-- 1 roles
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code IN ('admin', 'seller', 'customer')),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2 permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3 product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4 order_statuses
CREATE TABLE IF NOT EXISTS public.order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5 payment_methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6 social_platforms
CREATE TABLE IF NOT EXISTS public.social_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7 system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role_id UUID NOT NULL REFERENCES public.roles (id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9 role_permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles (id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, permission_id)
);

-- 10 customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  document_id TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11 sellers
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles (id) ON DELETE CASCADE,
  employee_code TEXT UNIQUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12 customer_addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Principal',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'MX',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13 customer_goals
CREATE TABLE IF NOT EXISTS public.customer_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_value NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14 customer_segments
CREATE TABLE IF NOT EXISTS public.customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15 products
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

-- 16 product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17 product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  sku TEXT,
  price_adjustment NUMERIC(12, 2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18 product_reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, customer_id)
);

-- 19 product_recommendations
CREATE TABLE IF NOT EXISTS public.product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  reason TEXT,
  score NUMERIC(5, 4),
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'rule', 'seller', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20 suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21 purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers (id),
  reference_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
  total_amount NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22 purchase_details
CREATE TABLE IF NOT EXISTS public.purchase_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23 inventory_movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment', 'sale', 'return')),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24 stock_entries
CREATE TABLE IF NOT EXISTS public.stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  source TEXT,
  inventory_movement_id UUID REFERENCES public.inventory_movements (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25 stock_outputs
CREATE TABLE IF NOT EXISTS public.stock_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  inventory_movement_id UUID REFERENCES public.inventory_movements (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26 carts
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27 cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

-- 28 orders
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

-- 29 order_details
CREATE TABLE IF NOT EXISTS public.order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30 sales
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

-- 31 sale_details
CREATE TABLE IF NOT EXISTS public.sale_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 32 payments
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

-- 33 promotions (antes que coupons: FK promotion_id)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 34 coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES public.promotions (id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 35 conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  assigned_seller_id UUID REFERENCES public.sellers (id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'bot'
    CHECK (status IN ('bot', 'pending_handoff', 'human', 'closed')),
  channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp', 'instagram', 'facebook')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 36 messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('bot', 'customer', 'seller', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 37 chatbot_rules
CREATE TABLE IF NOT EXISTS public.chatbot_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT NOT NULL UNIQUE,
  intent_pattern TEXT NOT NULL,
  response_template TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  triggers_handoff BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 38 chatbot_intents (log por conversación)
CREATE TABLE IF NOT EXISTS public.chatbot_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages (id) ON DELETE SET NULL,
  intent_code TEXT NOT NULL,
  confidence NUMERIC(5, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 38b chatbot_intent_definitions (configuración admin — intenciones detectables)
CREATE TABLE IF NOT EXISTS public.chatbot_intent_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  intent_type TEXT NOT NULL DEFAULT 'general'
    CHECK (intent_type IN ('goal', 'handoff', 'purchase', 'price', 'stock', 'greeting', 'auto', 'general')),
  keywords TEXT NOT NULL DEFAULT '',
  response_template TEXT,
  triggers_handoff BOOLEAN NOT NULL DEFAULT FALSE,
  recommended_product_ids UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_intent_defs_active
  ON public.chatbot_intent_definitions (is_active, priority);

-- 39 handoff_requests
CREATE TABLE IF NOT EXISTS public.handoff_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 40 seller_assignments
CREATE TABLE IF NOT EXISTS public.seller_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.sellers (id),
  handoff_request_id UUID REFERENCES public.handoff_requests (id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 41 support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE,
  customer_id UUID REFERENCES public.customers (id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES public.conversations (id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 42 ticket_assignments
CREATE TABLE IF NOT EXISTS public.ticket_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets (id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.sellers (id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 43 social_campaigns (antes que social_posts: FK campaign_id opcional)
CREATE TABLE IF NOT EXISTS public.social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 44 social_posts
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.social_campaigns (id) ON DELETE SET NULL,
  platform_id UUID NOT NULL REFERENCES public.social_platforms (id),
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 45 social_metrics
CREATE TABLE IF NOT EXISTS public.social_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID NOT NULL REFERENCES public.social_posts (id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (social_post_id, metric_date)
);

-- 46 ai_generated_contents
CREATE TABLE IF NOT EXISTS public.ai_generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_post_id UUID REFERENCES public.social_posts (id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  model_name TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 47 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'order', 'chat', 'marketing', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 48 audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 49 error_logs
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  error_code TEXT,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 50 user_sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. ÍNDICES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role_id);
CREATE INDEX IF NOT EXISTS idx_customers_profile ON public.customers (profile_id);
CREATE INDEX IF NOT EXISTS idx_sellers_profile ON public.sellers (profile_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations (customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations (status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_seller ON public.conversations (assigned_seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_handoff_status ON public.handoff_requests (status);
CREATE INDEX IF NOT EXISTS idx_seller_assignments_seller ON public.seller_assignments (seller_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON public.social_posts (platform_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_product ON public.social_posts (product_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications (profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

-- =============================================================================
-- 5. INSERTS BASE (catálogos mínimos — sin usuarios de prueba)
-- =============================================================================
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

INSERT INTO public.social_platforms (code, name) VALUES
  ('facebook', 'Facebook'),
  ('instagram', 'Instagram'),
  ('tiktok', 'TikTok'),
  ('whatsapp', 'WhatsApp')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.product_categories (name, slug) VALUES
  ('Proteínas', 'proteinas'),
  ('Aminoácidos', 'aminoacidos'),
  ('Pre-entreno', 'pre-entreno'),
  ('Vitaminas', 'vitaminas'),
  ('Salud', 'salud')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.system_settings (setting_key, setting_value, is_public) VALUES
  ('store_name', '"NutriStore"', TRUE),
  ('chatbot_enabled', 'true', TRUE),
  (
    'chatbot_handoff_keywords',
    '"quiero hablar con un vendedor|necesito ayuda humana|hablar con un asesor|atención humana|quiero un vendedor|necesito un vendedor|quiero comprar|deseo comprar|quiero pagar"',
    FALSE
  ),
  (
    'chatbot_auto_messages',
    '{"greeting":"¡Hola! Soy NutriBot, tu asistente de NutriStore.","handoff":"Te estamos derivando con un vendedor humano.","fallback":"Puedo ayudarte con recomendaciones, precios, stock o conectarte con un vendedor."}',
    FALSE
  )
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.chatbot_intent_definitions (
  intent_code, label, intent_type, keywords, response_template, triggers_handoff, priority
) VALUES
  ('greeting', 'Saludo', 'greeting', 'hola|buenos|buenas|hey', '¡Hola! Soy NutriBot. ¿En qué te ayudo?', FALSE, 10),
  ('muscle_mass', 'Ganar masa muscular', 'goal', 'masa muscular|ganar músculo|volumen|bulking', 'Para ganar masa muscular, te recomiendo estos productos:', FALSE, 20),
  ('weight_loss', 'Bajar de peso', 'goal', 'bajar de peso|perder peso|definir|quemar grasa|adelgazar', 'Para bajar de peso, te recomiendo:', FALSE, 21),
  ('energy', 'Energía', 'goal', 'energía|rendimiento|pre entreno|pre-entreno', 'Para energía y rendimiento:', FALSE, 22),
  ('recovery', 'Recuperación', 'goal', 'recuperación|post entreno|después del entreno', 'Para recuperación muscular:', FALSE, 23),
  ('vitamins', 'Vitaminas', 'goal', 'vitaminas|multivitam|salud general', 'Para salud y vitaminas:', FALSE, 24),
  ('price', 'Consulta de precio', 'price', 'precio|cuesta|cuánto|costo', 'Te comparto precios de productos relacionados:', FALSE, 30),
  ('stock', 'Consulta de stock', 'stock', 'stock|disponible|hay|inventario|agotado', 'Disponibilidad consultada:', FALSE, 31),
  ('purchase', 'Intención de compra', 'purchase', 'quiero comprar|deseo comprar|hacer pedido|quiero pagar|realizar compra', '¡Perfecto! Detecté interés de compra. Te conecto con un vendedor.', TRUE, 5),
  ('handoff', 'Handoff humano', 'handoff', 'asesor|humano|vendedor|atención humana', 'Te conecto con un vendedor humano.', TRUE, 4)
ON CONFLICT (intent_code) DO NOTHING;

INSERT INTO public.chatbot_rules (rule_code, intent_pattern, response_template, priority, triggers_handoff) VALUES
  ('greeting', 'hola|buenos', '¡Hola! Soy NutriBot. ¿En qué te ayudo?', 10, FALSE),
  ('price', 'precio|cuesta', 'Consulta precios en el catálogo o dime el producto.', 20, FALSE),
  ('human', 'asesor|humano|vendedor', 'Te conecto con un vendedor humano.', 5, TRUE)
ON CONFLICT (rule_code) DO NOTHING;

-- =============================================================================
-- 6. FUNCIONES QUE DEPENDEN DE TABLAS (después de roles + inserts base)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.default_customer_role_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM public.roles WHERE code = 'customer' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_role_code()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.code
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_role_code() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_role_code() IN ('admin', 'seller');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    public.default_customer_role_id()
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  INSERT INTO public.customers (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =============================================================================
-- 7. TRIGGERS
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'roles', 'permissions', 'product_categories', 'order_statuses', 'payment_methods',
    'social_platforms', 'system_settings', 'profiles', 'role_permissions', 'customers',
    'sellers', 'customer_addresses', 'customer_goals', 'customer_segments', 'products',
    'product_images', 'product_variants', 'product_reviews', 'product_recommendations',
    'suppliers', 'purchases', 'purchase_details', 'inventory_movements', 'stock_entries',
    'stock_outputs', 'carts', 'cart_items', 'orders', 'order_details', 'sales', 'sale_details',
    'payments', 'promotions', 'coupons', 'conversations', 'messages', 'chatbot_rules',
    'chatbot_intents', 'chatbot_intent_definitions', 'handoff_requests', 'seller_assignments',
    'support_tickets',
    'ticket_assignments', 'social_campaigns', 'social_posts', 'social_metrics',
    'ai_generated_contents', 'notifications', 'audit_logs', 'error_logs', 'user_sessions'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t,
      t
    );
  END LOOP;
END $$;

-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_intent_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. POLÍTICAS (DROP IF EXISTS + CREATE)
-- =============================================================================
DROP POLICY IF EXISTS "roles_read" ON public.roles;
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
DROP POLICY IF EXISTS "customers_own" ON public.customers;
DROP POLICY IF EXISTS "sellers_staff" ON public.sellers;
DROP POLICY IF EXISTS "sellers_admin" ON public.sellers;
DROP POLICY IF EXISTS "product_categories_read" ON public.product_categories;
DROP POLICY IF EXISTS "products_read_active" ON public.products;
DROP POLICY IF EXISTS "products_staff" ON public.products;
DROP POLICY IF EXISTS "products_admin" ON public.products;
DROP POLICY IF EXISTS "product_images_read" ON public.product_images;
DROP POLICY IF EXISTS "order_statuses_read" ON public.order_statuses;
DROP POLICY IF EXISTS "payment_methods_read" ON public.payment_methods;
DROP POLICY IF EXISTS "conversations_access" ON public.conversations;
DROP POLICY IF EXISTS "messages_access" ON public.messages;
DROP POLICY IF EXISTS "handoff_staff" ON public.handoff_requests;
DROP POLICY IF EXISTS "seller_assign_staff" ON public.seller_assignments;
DROP POLICY IF EXISTS "chatbot_rules_read" ON public.chatbot_rules;
DROP POLICY IF EXISTS "chatbot_rules_admin" ON public.chatbot_rules;
DROP POLICY IF EXISTS "chatbot_intent_defs_read" ON public.chatbot_intent_definitions;
DROP POLICY IF EXISTS "chatbot_intent_defs_admin" ON public.chatbot_intent_definitions;
DROP POLICY IF EXISTS "orders_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "order_details_read" ON public.order_details;
DROP POLICY IF EXISTS "payments_staff" ON public.payments;
DROP POLICY IF EXISTS "social_platforms_read" ON public.social_platforms;
DROP POLICY IF EXISTS "social_posts_staff" ON public.social_posts;
DROP POLICY IF EXISTS "ai_content_staff" ON public.ai_generated_contents;
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
DROP POLICY IF EXISTS "audit_admin" ON public.audit_logs;
DROP POLICY IF EXISTS "errors_admin" ON public.error_logs;
DROP POLICY IF EXISTS "settings_read" ON public.system_settings;
DROP POLICY IF EXISTS "settings_admin" ON public.system_settings;
DROP POLICY IF EXISTS "non_mvp_staff_read" ON public.permissions;
DROP POLICY IF EXISTS "non_mvp_admin" ON public.suppliers;
DROP POLICY IF EXISTS "non_mvp_inventory" ON public.inventory_movements;
DROP POLICY IF EXISTS "non_mvp_stock" ON public.stock_entries;
DROP POLICY IF EXISTS "non_mvp_stock_out" ON public.stock_outputs;
DROP POLICY IF EXISTS "non_mvp_carts" ON public.carts;

CREATE POLICY "roles_read" ON public.roles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "profiles_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin" ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "customers_own" ON public.customers FOR ALL TO authenticated
  USING (profile_id = auth.uid() OR public.is_staff())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "sellers_staff" ON public.sellers FOR SELECT TO authenticated
  USING (public.is_staff() OR profile_id = auth.uid());

CREATE POLICY "sellers_admin" ON public.sellers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "product_categories_read" ON public.product_categories FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "products_read_active" ON public.products FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "products_staff" ON public.products FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "products_admin" ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "product_images_read" ON public.product_images FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "order_statuses_read" ON public.order_statuses FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "payment_methods_read" ON public.payment_methods FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "conversations_access" ON public.conversations FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid())
    OR public.is_staff()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid())
    OR public.is_staff()
  );

CREATE POLICY "messages_access" ON public.messages FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations cv
      WHERE cv.id = conversation_id
        AND (
          public.is_staff()
          OR EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = cv.customer_id AND c.profile_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations cv
      WHERE cv.id = conversation_id
        AND (
          public.is_staff()
          OR EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = cv.customer_id AND c.profile_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "handoff_staff" ON public.handoff_requests FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "seller_assign_staff" ON public.seller_assignments FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "chatbot_rules_read" ON public.chatbot_rules FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "chatbot_rules_admin" ON public.chatbot_rules FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "chatbot_intent_defs_read" ON public.chatbot_intent_definitions FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "chatbot_intent_defs_admin" ON public.chatbot_intent_definitions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "orders_own" ON public.orders FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid())
    OR public.is_staff()
  );

CREATE POLICY "orders_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid())
  );

CREATE POLICY "order_details_read" ON public.order_details FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND (c.profile_id = auth.uid() OR public.is_staff())
    )
  );

CREATE POLICY "payments_staff" ON public.payments FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "social_platforms_read" ON public.social_platforms FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "social_posts_staff" ON public.social_posts FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "ai_content_staff" ON public.ai_generated_contents FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE POLICY "audit_admin" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "errors_admin" ON public.error_logs FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "settings_read" ON public.system_settings FOR SELECT TO authenticated
  USING (is_public = TRUE OR public.is_admin());

CREATE POLICY "settings_admin" ON public.system_settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "non_mvp_staff_read" ON public.permissions FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "non_mvp_admin" ON public.suppliers FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "non_mvp_inventory" ON public.inventory_movements FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "non_mvp_stock" ON public.stock_entries FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "non_mvp_stock_out" ON public.stock_outputs FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "non_mvp_carts" ON public.carts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.customers c WHERE c.id = customer_id AND c.profile_id = auth.uid()));

DROP POLICY IF EXISTS "cart_items_own" ON public.cart_items;
DROP POLICY IF EXISTS "order_details_insert" ON public.order_details;
DROP POLICY IF EXISTS "orders_staff_update" ON public.orders;
DROP POLICY IF EXISTS "sales_staff" ON public.sales;
DROP POLICY IF EXISTS "sale_details_staff" ON public.sale_details;
DROP POLICY IF EXISTS "payments_customer_read" ON public.payments;
DROP POLICY IF EXISTS "payments_customer_insert" ON public.payments;
DROP POLICY IF EXISTS "products_stock_staff" ON public.products;
DROP POLICY IF EXISTS "sellers_update_own" ON public.sellers;

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

CREATE POLICY "order_details_insert" ON public.order_details FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND c.profile_id = auth.uid()
    )
    OR public.is_staff()
  );

CREATE POLICY "orders_staff_update" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "sales_staff" ON public.sales FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "sale_details_staff" ON public.sale_details FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "payments_customer_read" ON public.payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "payments_customer_insert" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = order_id AND c.profile_id = auth.uid()
    )
  );

CREATE POLICY "products_stock_staff" ON public.products FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "sellers_update_own" ON public.sellers FOR UPDATE TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- =============================================================================
-- 10. DATOS DE PRUEBA (al final)
-- =============================================================================
INSERT INTO public.suppliers (name, email)
SELECT 'NutriSupply MX', 'ventas@nutrisupply.mx'
WHERE NOT EXISTS (SELECT 1 FROM public.suppliers WHERE name = 'NutriSupply MX');

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

-- Usuarios prueba: NutriStore2025!
DO $$
DECLARE
  v_admin UUID := 'c1000001-0001-4001-8001-000000000001';
  v_seller UUID := 'c1000002-0002-4002-8002-000000000002';
  v_rid_admin UUID;
  v_rid_seller UUID;
BEGIN
  SELECT id INTO v_rid_admin FROM public.roles WHERE code = 'admin';
  SELECT id INTO v_rid_seller FROM public.roles WHERE code = 'seller';

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000', v_admin, 'authenticated', 'authenticated',
      'admin@nutristore.test', crypt('NutriStore2025!', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Admin NutriStore"}',
      NOW(), NOW(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    )
    VALUES (
      v_admin, v_admin,
      jsonb_build_object('sub', v_admin::text, 'email', 'admin@nutristore.test'),
      'email', v_admin::text, NOW(), NOW(), NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_seller) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000', v_seller, 'authenticated', 'authenticated',
      'vendedor@nutristore.test', crypt('NutriStore2025!', gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"María Vendedora"}',
      NOW(), NOW(), '', '', '', ''
    );
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    )
    VALUES (
      v_seller, v_seller,
      jsonb_build_object('sub', v_seller::text, 'email', 'vendedor@nutristore.test'),
      'email', v_seller::text, NOW(), NOW(), NOW()
    );
  END IF;

  UPDATE public.profiles
  SET role_id = v_rid_admin, full_name = 'Admin NutriStore', email = 'admin@nutristore.test'
  WHERE id = v_admin;

  UPDATE public.profiles
  SET role_id = v_rid_seller, full_name = 'María Vendedora', email = 'vendedor@nutristore.test'
  WHERE id = v_seller;

  DELETE FROM public.customers WHERE profile_id IN (v_admin, v_seller);

  INSERT INTO public.sellers (profile_id, employee_code)
  VALUES (v_seller, 'VEN-001')
  ON CONFLICT (profile_id) DO NOTHING;
END $$;

INSERT INTO public.conversations (id, customer_name, customer_email, status)
VALUES ('d2000001-0001-4001-8001-000000000001', 'Cliente Demo', 'demo@test.com', 'pending_handoff')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.handoff_requests (conversation_id, reason, status)
SELECT 'd2000001-0001-4001-8001-000000000001', 'Consulta proteína sin lactosa', 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.handoff_requests
  WHERE conversation_id = 'd2000001-0001-4001-8001-000000000001'
);

INSERT INTO public.messages (conversation_id, sender_type, message)
SELECT 'd2000001-0001-4001-8001-000000000001', 'customer', '¿Tienen whey isolate?'
WHERE NOT EXISTS (
  SELECT 1 FROM public.messages
  WHERE conversation_id = 'd2000001-0001-4001-8001-000000000001'
);

INSERT INTO public.social_posts (platform_id, title, content, status)
SELECT sp.id, 'Promo Verano', '💪 15% en proteínas #NutriStore', 'draft'
FROM public.social_platforms sp
WHERE sp.code = 'instagram'
  AND NOT EXISTS (SELECT 1 FROM public.social_posts WHERE title = 'Promo Verano');

-- =============================================================================
-- FIN — 50 tablas NutriStore
-- =============================================================================
