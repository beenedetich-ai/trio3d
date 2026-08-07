'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/data/products';
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
    name: 'Llaveros',
    desc: 'Nombres, logos de empresas, formas bicolores y destapadores.',
    image: '/images/soportes.png',
    badge: 'Personalizables',
  },
  {
    name: 'Decoración',
    desc: 'Jarrones geométricos, piezas artísticas en espiral y esculturas.',
    image: '/images/decoracion.png',
    badge: 'Diseño Exclusivo',
  },
  {
    name: 'Soportes',
    desc: 'Soportes gamer para auris, celulares, joysticks y notebooks.',
    image: '/images/soportes.png',
    badge: 'Ergonómicos',
  },
  {
    name: 'Macetas',
    desc: 'Macetas Voronoi, autorregantes y geométricas para suculentas.',
    image: '/images/macetas.png',
    badge: 'Impermeables',
  },
  {
    name: 'Regalos personalizados',
    desc: 'Litofanías con luz LED, cuadros 3D con foto y placas de nombre.',
    image: '/images/decoracion.png',
    badge: 'Emotivos',
  },
  {
    name: 'Figuras',
    desc: 'Figuras coleccionables, personajes, mechas y piezas articuladas flexi.',
    image: '/images/figuras.png',
    badge: 'Máximo Detalle',
  },
  {
    name: 'Diseño a medida',
    desc: 'Diseño personalizado de maquetas, repuestos y carcasas a medida.',
    image: '/images/hero.png',
    badge: 'Proyectos 3D',
    featured: true,
  },
];

const CATEGORY_STORAGE_KEY = 'trio3d_category_items_v3';

export function useCategoryStore() {
  // Synchronous initialization from localStorage prevents initial flicker / pantallazo
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
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
      // 1. Read local storage cache first to preserve custom URLs & descriptions
      let localCatMap: Record<string, CategoryItem> = {};
      try {
        const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: CategoryItem) => {
              if (c && c.name) {
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

          if (!error && data && data.length > 0) {
            const fetched: CategoryItem[] = data.map((item: any) => {
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
                || 'Impresión 3D';

              const finalDesc = (item.description && typeof item.description === 'string' && item.description.trim())
                || (localMatch?.desc && typeof localMatch.desc === 'string' && localMatch.desc.trim())
                || defaultMatch?.desc
                || 'Productos y diseños impresos en 3D de alta calidad.';

              return {
                name: item.name,
                badge: finalBadge,
                desc: finalDesc,
                image: finalImage,
                featured: defaultMatch?.featured ?? false,
              };
            });

            // Append any locally created categories that don't exist in Supabase yet
            const fetchedNamesLower = new Set(fetched.map((f) => f.name.toLowerCase()));
            Object.values(localCatMap).forEach((localCat) => {
              if (localCat && localCat.name && !fetchedNamesLower.has(localCat.name.toLowerCase())) {
                fetched.push(localCat);
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
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) setCategoryItems(parsed);
          }
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
    setCategoryItems(newItems);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  };

  const addCategory = async (input: string | CategoryItem) => {
    const newItem: CategoryItem = typeof input === 'string'
      ? {
          name: input.trim(),
          badge: 'Novedad',
          desc: 'Nuevos modelos y accesorios impresos en 3D.',
          image: '/images/hero.png',
        }
      : {
          name: input.name.trim(),
          badge: input.badge?.trim() || 'Novedad',
          desc: input.desc?.trim() || 'Nuevos modelos y accesorios impresos en 3D.',
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
          // Retry inserting without optional columns if DB schema not updated yet
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

  const categoryNames = ['Todos', ...categoryItems.map((c) => c.name)];

  return {
    categoryItems,
    categories: categoryNames,
    formCategories: categoryNames.filter((c) => c !== 'Todos'),
    isLoaded,
    addCategory,
    editCategory,
    removeCategory,
    resetCategories,
  };
}
