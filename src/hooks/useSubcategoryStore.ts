'use client';

import { useState, useEffect } from 'react';

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

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SUBCATEGORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          // Merge stored with defaults to ensure all categories exist
          const merged: SubcategoryMap = { ...DEFAULT_SUBCATEGORIES };
          Object.keys(parsed).forEach((cat) => {
            if (Array.isArray(parsed[cat])) {
              const unique = Array.from(new Set([...(merged[cat] || []), ...parsed[cat]]));
              merged[cat] = unique;
            }
          });
          setSubcategoriesMap(merged);
        }
      }
    } catch (error) {
      console.error('Error loading subcategories from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save helper
  const saveSubcategoriesMap = (newMap: SubcategoryMap) => {
    setSubcategoriesMap(newMap);
    try {
      localStorage.setItem(SUBCATEGORY_STORAGE_KEY, JSON.stringify(newMap));
    } catch (error) {
      console.error('Error saving subcategories to localStorage:', error);
    }
  };

  // Add new subcategory to a category
  const addSubcategory = (category: string, subcategoryName: string) => {
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
    return true;
  };

  // Remove subcategory from a category
  const removeSubcategory = (category: string, subcategoryName: string) => {
    if (!category || !subcategoryName) return false;

    const currentList = subcategoriesMap[category] || [];
    const updatedList = currentList.filter((s) => s !== subcategoryName);
    const updatedMap = {
      ...subcategoriesMap,
      [category]: updatedList,
    };
    saveSubcategoriesMap(updatedMap);
    return true;
  };

  // Get subcategories list for a specific category
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
