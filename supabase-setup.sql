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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla ya existe, aseguramos que la columna 'images' exista:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

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

-- 5. CREACIÓN DEL BUCKET DE IMÁGENES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Permitir subida y lectura pública de imágenes" ON storage.objects;

CREATE POLICY "Permitir subida y lectura pública de imágenes" ON storage.objects
FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
