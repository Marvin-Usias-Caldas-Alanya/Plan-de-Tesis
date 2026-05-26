-- Intenciones detectables (configuración admin). chatbot_intents sigue siendo log por conversación.
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

ALTER TABLE public.chatbot_intent_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chatbot_intent_defs_read" ON public.chatbot_intent_definitions;
DROP POLICY IF EXISTS "chatbot_intent_defs_admin" ON public.chatbot_intent_definitions;

CREATE POLICY "chatbot_intent_defs_read" ON public.chatbot_intent_definitions
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "chatbot_intent_defs_admin" ON public.chatbot_intent_definitions
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "chatbot_rules_admin" ON public.chatbot_rules;

CREATE POLICY "chatbot_rules_admin" ON public.chatbot_rules
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_admin" ON public.system_settings;

CREATE POLICY "settings_admin" ON public.system_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.system_settings (setting_key, setting_value, is_public) VALUES
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
