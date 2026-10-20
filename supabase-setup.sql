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

-- 8. LIMPIEZA DE CATEGORÍAS ANTERIORES Y SEED OFICIAL DE MERCADO LIBRE
DELETE FROM public.subcategories 
WHERE category_name IN ('Llaveros', 'Decoración', 'Decoracion', 'Soportes', 'Macetas', 'Regalos personalizados', 'Figuras', 'Diseño a medida', 'Diseno a medida');

DELETE FROM public.categories 
WHERE name IN ('Llaveros', 'Decoración', 'Decoracion', 'Soportes', 'Macetas', 'Regalos personalizados', 'Figuras', 'Diseño a medida', 'Diseno a medida');

-- Carga de Categorías Oficiales de Mercado Libre
INSERT INTO public.categories (name, badge, description, image) VALUES
  ('Hogar, Muebles y Jardín', 'Hogar & Deco', 'Macetas Voronoi, floreros en espiral paramétricos, lámparas y deco moderna.', '/images/macetas.png'),
  ('Computación', 'Gamer & Desk', 'Soportes para auriculares gamer, elevadores de notebook y organizadores de escritorio.', '/images/soportes.png'),
  ('Celulares y Teléfonos', 'Accesorios Tech', 'Soportes multisuperficie regulables, docks de carga y accesorios móviles.', '/images/soportes.png'),
  ('Juegos y Juguetes', 'Coleccionables', 'Figuras coleccionables, dragones flexi articulados, mechas y personajes en alta resolución.', '/images/figuras.png'),
  ('Souvenirs, Cotillón y Fiestas', 'Personalizados', 'Llaveros tipográficos personalizados, merchandising corporativo y recuerdos para eventos.', '/images/soportes.png'),
  ('Arte, Librería y Mercería', 'Arte Digital', 'Esculturas paramétricas, cajas litofanía con luz LED interior y obras artísticas en 3D.', '/images/decoracion.png'),
  ('Industrias y Oficinas', 'Ingeniería 3D', 'Diseño CAD 3D a medida, repuestos técnicos mecánicos, prototipos y carcasas electrónicas.', '/images/hero.png'),
  ('Accesorios para Vehículos', 'Automotor', 'Repuestos plásticos descatalogados, adaptadores vehiculares y accesorios para autos y motos.', '/images/soportes.png'),
  ('Consolas y Videojuegos', 'Gaming', 'Soportes para joysticks y mandos, stands para consolas y organizadores de setup gamer.', '/images/figuras.png'),
  ('Herramientas', 'Taller & Pro', 'Organizadores de taller, soportes de pared para herramientas y plantillas de precisión.', '/images/hero.png'),
  ('Animales y Mascotas', 'Pet Care', 'Placas identificatorias con nombre y teléfono, comederos elevados y accesorios.', '/images/macetas.png'),
  ('Deportes y Fitness', 'Sport & Outdoor', 'Soportes para ciclocomputadoras, monturas de acción y accesorios deportivos.', '/images/soportes.png')
ON CONFLICT (name) DO UPDATE SET
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  image = EXCLUDED.image;

-- Carga de Subcategorías de Mercado Libre
INSERT INTO public.subcategories (category_name, name) VALUES
  ('Hogar, Muebles y Jardín', 'Macetas & Jardinería'),
  ('Hogar, Muebles y Jardín', 'Jarrones & Floreros'),
  ('Hogar, Muebles y Jardín', 'Decoración & Bazar'),
  ('Hogar, Muebles y Jardín', 'Organización del Hogar'),
  ('Computación', 'Soportes Gamer & Auriculares'),
  ('Computación', 'Elevadores de Notebook'),
  ('Computación', 'Organizadores de Escritorio'),
  ('Computación', 'Periféricos & Cables'),
  ('Celulares y Teléfonos', 'Soportes de Celular & Tablet'),
  ('Celulares y Teléfonos', 'Docks de Carga'),
  ('Celulares y Teléfonos', 'Accesorios Móviles'),
  ('Juegos y Juguetes', 'Figuras de Acción & Mechs'),
  ('Juegos y Juguetes', 'Flexi Articulados'),
  ('Juegos y Juguetes', 'Coleccionables'),
  ('Juegos y Juguetes', 'Juegos de Mesa & Dados'),
  ('Souvenirs, Cotillón y Fiestas', 'Llaveros Personalizados'),
  ('Souvenirs, Cotillón y Fiestas', 'Corporativos & Merchandising'),
  ('Souvenirs, Cotillón y Fiestas', 'Souvenirs para Eventos'),
  ('Souvenirs, Cotillón y Fiestas', 'Adornos para Tortas'),
  ('Arte, Librería y Mercería', 'Esculturas & Arte 3D'),
  ('Arte, Librería y Mercería', 'Litofanías & Lámparas'),
  ('Arte, Librería y Mercería', 'Cuadros & Placas'),
  ('Arte, Librería y Mercería', 'Artículos de Librería'),
  ('Industrias y Oficinas', 'Ingeniería & Repuestos 3D'),
  ('Industrias y Oficinas', 'Carcasas & Prototipos'),
  ('Industrias y Oficinas', 'Placas & Señalética QR'),
  ('Industrias y Oficinas', 'Maquetas & Modelado'),
  ('Accesorios para Vehículos', 'Repuestos de Automotor'),
  ('Accesorios para Vehículos', 'Accesorios para Autos'),
  ('Accesorios para Vehículos', 'Accesorios para Motos'),
  ('Accesorios para Vehículos', 'Llaveros Automotores'),
  ('Consolas y Videojuegos', 'Soportes para Joysticks'),
  ('Consolas y Videojuegos', 'Accesorios de Consolas'),
  ('Consolas y Videojuegos', 'Deco Gamer'),
  ('Herramientas', 'Organizadores de Taller'),
  ('Herramientas', 'Soportes de Pared'),
  ('Herramientas', 'Guías & Plantillas de Precisión'),
  ('Animales y Mascotas', 'Placas Identificatorias'),
  ('Animales y Mascotas', 'Comederos Elevados'),
  ('Animales y Mascotas', 'Accesorios para Mascotas'),
  ('Deportes y Fitness', 'Soportes para Bicicleta'),
  ('Deportes y Fitness', 'Monturas de Acción'),
  ('Deportes y Fitness', 'Accesorios Deportivos')
ON CONFLICT (category_name, name) DO NOTHING;


