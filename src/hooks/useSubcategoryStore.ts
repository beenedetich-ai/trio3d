'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type SubcategoryMap = Record<string, string[]>;

export const DEFAULT_SUBCATEGORIES: SubcategoryMap = {
  Llaveros: ['Tipográficos', 'Corporativos & Merchandising'],
  Decoración: ['Jarrones & Floreros', 'Esculturas & Arte 3D'],
  Soportes: ['Gaming & Headphones', 'Escritorio & Celulares'],
  Macetas: ['Geométricas & Voronoi', 'Autorregantes'],
  'Regalos personalizados': ['Litofanías & Lámparas', 'Placas & QR'],
  Figuras: ['Coleccionables & Mechs', 'Flexi Articulados', 'Roblox'],
  'Diseño a medida': ['Ingeniería & Repuestos', 'Prototipos & Carcasas'],
};

const SUBCATEGORY_STORAGE_KEY = 'trio3d_subcategories_v3';

export function useSubcategoryStore() {
  const [subcategoriesMap, setSubcategoriesMap] = useState<SubcategoryMap>(DEFAULT_SUBCATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSubcategories() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('subcategories')
            .select('category_name, name');

          if (!error && data && data.length > 0) {
            const mapFromDb: SubcategoryMap = { ...DEFAULT_SUBCATEGORIES };
            data.forEach((row: { category_name: string; name: string }) => {
              if (!mapFromDb[row.category_name]) {
                mapFromDb[row.category_name] = [];
              }
              if (!mapFromDb[row.category_name].includes(row.name)) {
                mapFromDb[row.category_name].push(row.name);
              }
            });

            if (isMounted) {
              setSubcategoriesMap(mapFromDb);
              try {
                localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(mapFromDb));
              } catch (_) {}
              setIsLoaded(true);
              return;
            }
          }
        } catch (err) {
          console.error('Error fetching subcategories from Supabase:', err);
        }
      }

      // Local storage fallback
      try {
        const stored = localStorage.getItem(SUBCATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            const merged: SubcategoryMap = { ...DEFAULT_SUBCATEGORIES };
            Object.keys(parsed).forEach((cat) => {
              if (Array.isArray(parsed[cat])) {
                const unique = Array.from(new Set([...(merged[cat] || []), ...parsed[cat]]));
                merged[cat] = unique;
              }
            });
            if (isMounted) setSubcategoriesMap(merged);
          }
        }
      } catch (error) {
        console.error('Error loading subcategories from localStorage:', error);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    loadSubcategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSubcategoriesMap = (newMap: SubcategoryMap) => {
    setSubcategoriesMap(newMap);
    try {
      localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(newMap));
    } catch (error) {
      console.error('Error saving subcategories to localStorage:', error);
    }
  };

  const addSubcategory = async (category: string, subcategoryName: string) => {
    const trimmed = subcategoryName.trim();
    if (!category || !trimmed) return false;

    const currentList = subcategoriesMap[category] || [];
    if (currentList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      alert(`La subcategoría "${trimmed}" ya existe en ${category}.`);
      return false;
    }

    const updatedList = [...currentList, trimmed];
    const updatedMap = {
      ...subcategoriesMap,
      [category]: updatedList,
    };
    saveSubcategoriesMap(updatedMap);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('subcategories').insert([
          {
            category_name: category,
            name: trimmed,
          },
        ]);
      } catch (err) {
        console.error('Error adding subcategory to Supabase:', err);
      }
    }
    return true;
  };

  const removeSubcategory = async (category: string, subcategoryName: string) => {
    if (!category || !subcategoryName) return false;

    const currentList = subcategoriesMap[category] || [];
    const updatedList = currentList.filter((s) => s !== subcategoryName);
    const updatedMap = {
      ...subcategoriesMap,
      [category]: updatedList,
    };
    saveSubcategoriesMap(updatedMap);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('subcategories')
          .delete()
          .eq('category_name', category)
          .eq('name', subcategoryName);
      } catch (err) {
        console.error('Error deleting subcategory from Supabase:', err);
      }
    }
    return true;
  };

  const getSubcategories = (category: string): string[] => {
    return subcategoriesMap[category] || [];
  };

  return {
    subcategoriesMap,
    isLoaded,
    addSubcategory,
    removeSubcategory,
    getSubcategories,
  };
}
