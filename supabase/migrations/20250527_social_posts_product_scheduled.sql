-- Campos opcionales para publicaciones sociales (producto y programación)
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products (id) ON DELETE SET NULL;

ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_social_posts_product ON public.social_posts (product_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON public.social_posts (scheduled_at);
