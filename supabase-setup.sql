-- =========================================================================
-- SCRIPT DE CONFIGURACIÓN INICIAL DE BASE DE DATOS SUPABASE PARA TRIO 3D
-- Copiá y pegá este código en el SQL Editor de tu proyecto en Supabase (https://supabase.com)
-- =========================================================================

-- 1. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  subcategories TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  price TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  materials TEXT[] DEFAULT ARRAY['PLA']::TEXT[],
  dimensions TEXT,
  tags TEXT[] DEFAULT ARRAY['3D']::TEXT[],
  peso INTEGER DEFAULT 200,
  alto INTEGER DEFAULT 10,
  ancho INTEGER DEFAULT 10,
  largo INTEGER DEFAULT 10,
  meli_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla ya existe, aseguramos que las columnas adicionales existan:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategories TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS meli_id TEXT;


-- 2. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS public.categories (
  name TEXT PRIMARY KEY,
  badge TEXT,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT;

-- 3. TABLA DE SUBCATEGORÍAS
CREATE TABLE IF NOT EXISTS public.subcategories (
  category_name TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (category_name, name)
);

-- 4. POLÍTICAS DE SEGURIDAD (RLS) - LECTURA Y ESCRITURA PÚBLICA / ADMIN
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo en productos" ON public.products;
DROP POLICY IF EXISTS "Permitir todo en categorías" ON public.categories;
DROP POLICY IF EXISTS "Permitir todo en subcategorías" ON public.subcategories;

CREATE POLICY "Permitir todo en productos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en categorías" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en subcategorías" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);

-- 5. TABLA DE CONFIGURACIÓN DE MERCADO LIBRE
CREATE TABLE IF NOT EXISTS public.mercadolibre_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL DEFAULT 'https://trio-3d.beenedetich.workers.dev/meli/redirect',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mercadolibre_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en mercadolibre_config" ON public.mercadolibre_config;
CREATE POLICY "Permitir todo en mercadolibre_config" ON public.mercadolibre_config FOR ALL USING (true) WITH CHECK (true);

-- 6. TABLA DE TOKENS OAUTH DE MERCADO LIBRE
CREATE TABLE IF NOT EXISTS public.mercadolibre_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  user_id BIGINT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_in INTEGER NOT NULL,
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mercadolibre_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en mercadolibre_tokens" ON public.mercadolibre_tokens;
CREATE POLICY "Permitir todo en mercadolibre_tokens" ON public.mercadolibre_tokens FOR ALL USING (true) WITH CHECK (true);

-- 7. CREACIÓN DEL BUCKET DE IMÁGENES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Permitir subida y lectura pública de imágenes" ON storage.objects;

CREATE POLICY "Permitir subida y lectura pública de imágenes" ON storage.objects
FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');


