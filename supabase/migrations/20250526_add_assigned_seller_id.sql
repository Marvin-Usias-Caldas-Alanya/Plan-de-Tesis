-- Ejecutar en Supabase SQL Editor si la BD ya existe sin assigned_seller_id
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS assigned_seller_id UUID REFERENCES public.sellers (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_assigned_seller
  ON public.conversations (assigned_seller_id);
