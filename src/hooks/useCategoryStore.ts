'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/data/products';

const CATEGORY_STORAGE_KEY = 'trio3d_categories_v2';

export function useCategoryStore() {
  const [categories, setCategories] = useState<string[]>(Array.from(CATEGORIES));
  const [isLoaded, setIsLoaded] = useState(false);

  // Load categories from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure 'Todos' is always the first category
          const unique = Array.from(new Set(['Todos', ...parsed]));
          setCategories(unique);
        }
      }
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save helper
  const saveCategories = (newCategories: string[]) => {
    const cleanList = Array.from(new Set(['Todos', ...newCategories.filter((c) => c !== 'Todos')]));
    setCategories(cleanList);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cleanList));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  };

  // Add new category
  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`La categoría "${trimmed}" ya existe.`);
      return false;
    }

    const updated = [...categories, trimmed];
    saveCategories(updated);
    return true;
  };

  // Remove category
  const removeCategory = (name: string) => {
    if (name === 'Todos') {
      alert('No se puede eliminar la categoría "Todos".');
      return false;
    }

    const updated = categories.filter((c) => c !== name);
    saveCategories(updated);
    return true;
  };

  // Reset to default categories
  const resetCategories = () => {
    saveCategories(Array.from(CATEGORIES));
  };

  return {
    categories,
    formCategories: categories.filter((c) => c !== 'Todos'),
    isLoaded,
    addCategory,
    removeCategory,
    resetCategories,
  };
}
