-- =============================================================================
-- Cambiar rol de un usuario (ejecutar en Supabase SQL Editor)
-- Reemplaza 'tu@email.com' por el correo con el que inicias sesión.
-- Después: cierra sesión en la app y vuelve a entrar.
-- =============================================================================

-- ── Opción A: tabla profiles con columna "role" (texto) ──

-- ADMIN
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu@email.com';

-- VENDEDOR / EMPLEADO
UPDATE public.profiles
SET role = 'seller'
WHERE email = 'tu@email.com';

INSERT INTO public.sellers (profile_id, is_available)
SELECT p.id, true
FROM public.profiles p
WHERE p.email = 'tu@email.com'
  AND NOT EXISTS (SELECT 1 FROM public.sellers s WHERE s.profile_id = p.id);

-- CLIENTE
UPDATE public.profiles
SET role = 'customer'
WHERE email = 'tu@email.com';

INSERT INTO public.customers (profile_id)
SELECT p.id
FROM public.profiles p
WHERE p.email = 'tu@email.com'
  AND NOT EXISTS (SELECT 1 FROM public.customers c WHERE c.profile_id = p.id);


-- ── Opción B: tabla profiles con columna "role_id" (UUID) ──
-- Comenta la opción A y usa estas si tu schema tiene role_id:

/*
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE code = 'admin')
WHERE email = 'tu@email.com';

UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE code = 'seller')
WHERE email = 'tu@email.com';

INSERT INTO public.sellers (profile_id, is_available)
SELECT p.id, true FROM public.profiles p
WHERE p.email = 'tu@email.com'
  AND NOT EXISTS (SELECT 1 FROM public.sellers s WHERE s.profile_id = p.id);

UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE code = 'customer')
WHERE email = 'tu@email.com';
*/
