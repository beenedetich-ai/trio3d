'use client';

import { useState, useEffect } from 'react';
import { MELI_CATEGORIES } from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface CategoryItem {
  name: string;
  badge?: string;
  desc?: string;
  image?: string;
  featured?: boolean;
}

export const DEFAULT_CATEGORY_ITEMS: CategoryItem[] = [
  {
    name: 'Hogar, Muebles y Jardín',
    desc: 'Macetas Voronoi, floreros en espiral paramétricos, lámparas y deco moderna.',
    image: '/images/macetas.png',
    badge: 'Hogar & Deco',
  },
  {
    name: 'Computación',
    desc: 'Soportes para auriculares gamer, elevadores de notebook y organizadores de escritorio.',
    image: '/images/soportes.png',
    badge: 'Gamer & Desk',
  },
  {
    name: 'Celulares y Teléfonos',
    desc: 'Soportes multisuperficie regulables, docks de carga y accesorios móviles.',
    image: '/images/soportes.png',
    badge: 'Accesorios Tech',
  },
  {
    name: 'Juegos y Juguetes',
    desc: 'Figuras coleccionables, dragones flexi articulados, mechas y personajes en alta resolución.',
    image: '/images/figuras.png',
    badge: 'Coleccionables',
  },
  {
    name: 'Souvenirs, Cotillón y Fiestas',
    desc: 'Llaveros tipográficos personalizados, merchandising corporativo y recuerdos para eventos.',
    image: '/images/soportes.png',
    badge: 'Personalizados',
  },
  {
    name: 'Arte, Librería y Mercería',
    desc: 'Esculturas paramétricas, cajas litofanía con luz LED interior y obras artísticas en 3D.',
    image: '/images/decoracion.png',
    badge: 'Arte Digital',
  },
  {
    name: 'Industrias y Oficinas',
    desc: 'Diseño CAD 3D a medida, repuestos técnicos mecánicos, prototipos y carcasas electrónicas.',
    image: '/images/hero.png',
    badge: 'Ingeniería 3D',
    featured: true,
  },
  {
    name: 'Accesorios para Vehículos',
    desc: 'Repuestos plásticos descatalogados, adaptadores vehiculares y accesorios para autos y motos.',
    image: '/images/soportes.png',
    badge: 'Automotor',
  },
  {
    name: 'Consolas y Videojuegos',
    desc: 'Soportes para joysticks y mandos, stands para consolas y organizadores de setup gamer.',
    image: '/images/figuras.png',
    badge: 'Gaming',
  },
  {
    name: 'Herramientas',
    desc: 'Organizadores de taller, soportes de pared para herramientas y plantillas de precisión.',
    image: '/images/hero.png',
    badge: 'Taller & Pro',
  },
  {
    name: 'Animales y Mascotas',
    desc: 'Placas identificatorias con nombre y teléfono, comederos elevados y accesorios.',
    image: '/images/macetas.png',
    badge: 'Pet Care',
  },
  {
    name: 'Deportes y Fitness',
    desc: 'Soportes para ciclocomputadoras, monturas de acción y accesorios deportivos.',
    image: '/images/soportes.png',
    badge: 'Sport & Outdoor',
  },
];

const CATEGORY_STORAGE_KEY = 'trio3d_category_items_meli_v4';
const LEGACY_STORAGE_KEYS = ['trio3d_category_items_v3', 'trio3d_category_items_v2', 'trio3d_category_items'];
const LEGACY_CATEGORY_NAMES = new Set([
  'llaveros',
  'decoración',
  'decoracion',
  'soportes',
  'macetas',
  'regalos personalizados',
  'figuras',
  'diseño a medida',
  'diseno a medida',
]);

function isLegacyList(list: CategoryItem[]): boolean {
  if (!Array.isArray(list) || list.length === 0) return false;
  // If more than 30% of items belong to the legacy set, it's the old category list
  const legacyCount = list.filter((item) => item?.name && LEGACY_CATEGORY_NAMES.has(item.name.toLowerCase().trim())).length;
  return legacyCount >= 2;
}

export function useCategoryStore() {
  // Synchronous initialization from localStorage
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clean up legacy keys
        LEGACY_STORAGE_KEYS.forEach((key) => {
          try { localStorage.removeItem(key); } catch (_) {}
        });

        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0 && !isLegacyList(parsed)) {
            return parsed;
          }
        }
      } catch (_) {}
    }
    return DEFAULT_CATEGORY_ITEMS;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      // 1. Read local storage cache first
      let localCatMap: Record<string, CategoryItem> = {};
      try {
        LEGACY_STORAGE_KEYS.forEach((key) => {
          try { localStorage.removeItem(key); } catch (_) {}
        });

        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && !isLegacyList(parsed)) {
            parsed.forEach((c: CategoryItem) => {
              if (c && c.name && !LEGACY_CATEGORY_NAMES.has(c.name.toLowerCase().trim())) {
                localCatMap[c.name.toLowerCase()] = c;
              }
            });
          }
        }
      } catch (_) {}

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

          if (!error && data) {
            // Check if Supabase still contains old legacy categories
            const hasLegacy = data.some((item: any) =>
              item?.name && LEGACY_CATEGORY_NAMES.has(item.name.toLowerCase().trim())
            );

            if (hasLegacy) {
              // Delete legacy categories from Supabase
              for (const legacyName of Array.from(LEGACY_CATEGORY_NAMES)) {
                await supabase.from('categories').delete().ilike('name', legacyName);
              }

              // Seed default Mercado Libre categories into Supabase
              const seedRows = DEFAULT_CATEGORY_ITEMS.map((item) => ({
                name: item.name,
                badge: item.badge,
                description: item.desc,
                image: item.image,
              }));
              await supabase.from('categories').upsert(seedRows, { onConflict: 'name' });
            }

            // Filter out any legacy entries
            const validMeliData = data.filter(
              (item: any) => !LEGACY_CATEGORY_NAMES.has(item.name?.toLowerCase()?.trim())
            );

            if (validMeliData.length > 0) {
              const fetched: CategoryItem[] = validMeliData.map((item: any) => {
                const localMatch = localCatMap[item.name.toLowerCase()];
                const defaultMatch = DEFAULT_CATEGORY_ITEMS.find(
                  (d) => d.name.toLowerCase() === item.name.toLowerCase()
                );

                const finalImage = (item.image && typeof item.image === 'string' && item.image.trim())
                  || (localMatch?.image && typeof localMatch.image === 'string' && localMatch.image.trim())
                  || defaultMatch?.image
                  || '/images/hero.png';

                const finalBadge = (item.badge && typeof item.badge === 'string' && item.badge.trim())
                  || (localMatch?.badge && typeof localMatch.badge === 'string' && localMatch.badge.trim())
                  || defaultMatch?.badge
                  || 'Mercado Libre';

                const finalDesc = (item.description && typeof item.description === 'string' && item.description.trim())
                  || (localMatch?.desc && typeof localMatch.desc === 'string' && localMatch.desc.trim())
                  || defaultMatch?.desc
                  || 'Productos y diseños en 3D organizados según rubros oficiales de Mercado Libre.';

                return {
                  name: item.name,
                  badge: finalBadge,
                  desc: finalDesc,
                  image: finalImage,
                  featured: defaultMatch?.featured ?? false,
                };
              });

              // Ensure all default Mercado Libre categories are present
              DEFAULT_CATEGORY_ITEMS.forEach((defCat) => {
                if (!fetched.some((f) => f.name.toLowerCase() === defCat.name.toLowerCase())) {
                  fetched.push(defCat);
                }
              });

              if (isMounted) {
                setCategoryItems(fetched);
                try {
                  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(fetched));
                } catch (_) {}
                setIsLoaded(true);
                return;
              }
            } else {
              // If Supabase categories were empty, seed them
              const seedRows = DEFAULT_CATEGORY_ITEMS.map((item) => ({
                name: item.name,
                badge: item.badge,
                description: item.desc,
                image: item.image,
              }));
              await supabase.from('categories').upsert(seedRows, { onConflict: 'name' });
            }
          }
        } catch (err) {
          console.error('Error fetching categories from Supabase:', err);
        }
      }

      // Local storage fallback
      try {
        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0 && !isLegacyList(parsed)) {
            if (isMounted) setCategoryItems(parsed);
          } else {
            if (isMounted) setCategoryItems(DEFAULT_CATEGORY_ITEMS);
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORY_ITEMS));
          }
        } else {
          if (isMounted) setCategoryItems(DEFAULT_CATEGORY_ITEMS);
          localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORY_ITEMS));
        }
      } catch (error) {
        console.error('Error loading categories from localStorage:', error);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveCategoryItems = (newItems: CategoryItem[]) => {
    const cleaned = newItems.filter((i) => !LEGACY_CATEGORY_NAMES.has(i.name.toLowerCase().trim()));
    setCategoryItems(cleaned);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cleaned));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  };

  const addCategory = async (input: string | CategoryItem) => {
    const newItem: CategoryItem = typeof input === 'string'
      ? {
          name: input.trim(),
          badge: 'Mercado Libre',
          desc: 'Categoría oficial de Mercado Libre para productos y diseños 3D.',
          image: '/images/hero.png',
        }
      : {
          name: input.name.trim(),
          badge: input.badge?.trim() || 'Mercado Libre',
          desc: input.desc?.trim() || 'Categoría oficial de Mercado Libre para productos y diseños 3D.',
          image: input.image || '/images/hero.png',
        };

    if (!newItem.name) return false;

    if (categoryItems.some((c) => c.name.toLowerCase() === newItem.name.toLowerCase())) {
      alert(`La categoría "${newItem.name}" ya existe.`);
      return false;
    }

    const updated = [...categoryItems, newItem];
    saveCategoryItems(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = {
          name: newItem.name,
          badge: newItem.badge,
          description: newItem.desc,
          image: newItem.image,
        };
        const { error } = await supabase.from('categories').insert([dbPayload]);
        if (error && (error.message?.includes('badge') || error.message?.includes('description') || error.message?.includes('image'))) {
          await supabase.from('categories').insert([{ name: newItem.name }]);
        }
      } catch (err) {
        console.error('Error adding category to Supabase:', err);
      }
    }
    return true;
  };

  const editCategory = async (name: string, updatedData: Partial<CategoryItem>) => {
    const updated = categoryItems.map((c) =>
      c.name.toLowerCase() === name.toLowerCase() ? { ...c, ...updatedData } : c
    );
    saveCategoryItems(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload: any = {};
        if (updatedData.name !== undefined) dbPayload.name = updatedData.name;
        if (updatedData.badge !== undefined) dbPayload.badge = updatedData.badge;
        if (updatedData.desc !== undefined) dbPayload.description = updatedData.desc;
        if (updatedData.image !== undefined) dbPayload.image = updatedData.image;

        const { error } = await supabase.from('categories').update(dbPayload).eq('name', name);
        if (error && (error.message?.includes('badge') || error.message?.includes('description') || error.message?.includes('image'))) {
          const { badge, description, image, ...fallback } = dbPayload;
          if (Object.keys(fallback).length > 0) {
            await supabase.from('categories').update(fallback).eq('name', name);
          }
        }
      } catch (err) {
        console.error('Error editing category in Supabase:', err);
      }
    }
  };

  const removeCategory = async (name: string) => {
    if (name === 'Todos') {
      alert('No se puede eliminar la categoría "Todos".');
      return false;
    }

    const updated = categoryItems.filter((c) => c.name.toLowerCase() !== name.toLowerCase());
    saveCategoryItems(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').delete().eq('name', name);
      } catch (err) {
        console.error('Error deleting category from Supabase:', err);
      }
    }
    return true;
  };

  const resetCategories = () => {
    saveCategoryItems(DEFAULT_CATEGORY_ITEMS);
  };

  // List of active categories starting with 'Todos'
  const categoryNames = ['Todos', ...categoryItems.map((c) => c.name)];

  return {
    categoryItems,
    categories: categoryNames,
    allMeliCategories: MELI_CATEGORIES,
    formCategories: categoryNames.filter((c) => c !== 'Todos'),
    isLoaded,
    addCategory,
    editCategory,
    removeCategory,
    resetCategories,
  };
}
