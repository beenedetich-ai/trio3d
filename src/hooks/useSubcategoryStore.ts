'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type SubcategoryMap = Record<string, string[]>;

export const DEFAULT_SUBCATEGORIES: SubcategoryMap = {
  'Hogar, Muebles y Jardín': [
    'Macetas & Jardinería',
    'Jarrones & Floreros',
    'Decoración & Bazar',
    'Organización del Hogar',
  ],
  'Computación': [
    'Soportes Gamer & Auriculares',
    'Elevadores de Notebook',
    'Organizadores de Escritorio',
    'Periféricos & Cables',
  ],
  'Celulares y Teléfonos': [
    'Soportes de Celular & Tablet',
    'Docks de Carga',
    'Accesorios Móviles',
  ],
  'Juegos y Juguetes': [
    'Figuras de Acción & Mechs',
    'Flexi Articulados',
    'Coleccionables',
    'Juegos de Mesa & Dados',
  ],
  'Souvenirs, Cotillón y Fiestas': [
    'Llaveros Personalizados',
    'Corporativos & Merchandising',
    'Souvenirs para Eventos',
    'Adornos para Tortas',
  ],
  'Arte, Librería y Mercería': [
    'Esculturas & Arte 3D',
    'Litofanías & Lámparas',
    'Cuadros & Placas',
    'Artículos de Librería',
  ],
  'Industrias y Oficinas': [
    'Ingeniería & Repuestos 3D',
    'Carcasas & Prototipos',
    'Placas & Señalética QR',
    'Maquetas & Modelado',
  ],
  'Accesorios para Vehículos': [
    'Repuestos de Automotor',
    'Accesorios para Autos',
    'Accesorios para Motos',
    'Llaveros Automotores',
  ],
  'Consolas y Videojuegos': [
    'Soportes para Joysticks',
    'Accesorios de Consolas',
    'Deco Gamer',
  ],
  'Herramientas': [
    'Organizadores de Taller',
    'Soportes de Pared',
    'Guías & Plantillas de Precisión',
  ],
  'Animales y Mascotas': [
    'Placas Identificatorias',
    'Comederos Elevados',
    'Accesorios para Mascotas',
  ],
  'Deportes y Fitness': [
    'Soportes para Bicicleta',
    'Monturas de Acción',
    'Accesorios Deportivos',
  ],
  'Belleza y Cuidado Personal': [
    'Organizadores de Cosméticos',
    'Accesorios de Tocador',
  ],
  'Electrónica, Audio y Video': [
    'Carcasas & Enclosures',
    'Soportes para Audio & Parlantes',
  ],
};

const SUBCATEGORY_STORAGE_KEY = 'trio3d_subcategories_meli_v4';
const LEGACY_STORAGE_KEYS = ['trio3d_subcategories_v3', 'trio3d_subcategories_v2', 'trio3d_subcategories'];
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

export function useSubcategoryStore() {
  const [subcategoriesMap, setSubcategoriesMap] = useState<SubcategoryMap>(() => {
    if (typeof window !== 'undefined') {
      try {
        LEGACY_STORAGE_KEYS.forEach((k) => {
          try { localStorage.removeItem(k); } catch (_) {}
        });
        const stored = localStorage.getItem(SUBCATEGORY_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            const hasLegacyKeys = Object.keys(parsed).some((k) => LEGACY_CATEGORY_NAMES.has(k.toLowerCase().trim()));
            if (!hasLegacyKeys) {
              return { ...DEFAULT_SUBCATEGORIES, ...parsed };
            }
          }
        }
      } catch (_) {}
    }
    return DEFAULT_SUBCATEGORIES;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSubcategories() {
      LEGACY_STORAGE_KEYS.forEach((k) => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('subcategories')
            .select('category_name, name');

          if (!error && data) {
            // Delete legacy subcategories from Supabase if found
            const hasLegacy = data.some((row: any) =>
              row?.category_name && LEGACY_CATEGORY_NAMES.has(row.category_name.toLowerCase().trim())
            );

            if (hasLegacy) {
              for (const legacyName of Array.from(LEGACY_CATEGORY_NAMES)) {
                await supabase.from('subcategories').delete().ilike('category_name', legacyName);
              }
            }

            const mapFromDb: SubcategoryMap = { ...DEFAULT_SUBCATEGORIES };
            data
              .filter((row: any) => !LEGACY_CATEGORY_NAMES.has(row.category_name?.toLowerCase()?.trim()))
              .forEach((row: { category_name: string; name: string }) => {
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
              if (!LEGACY_CATEGORY_NAMES.has(cat.toLowerCase().trim()) && Array.isArray(parsed[cat])) {
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
    // Clean any legacy category keys
    const cleaned: SubcategoryMap = {};
    Object.keys(newMap).forEach((k) => {
      if (!LEGACY_CATEGORY_NAMES.has(k.toLowerCase().trim())) {
        cleaned[k] = newMap[k];
      }
    });

    setSubcategoriesMap(cleaned);
    try {
      localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(cleaned));
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
