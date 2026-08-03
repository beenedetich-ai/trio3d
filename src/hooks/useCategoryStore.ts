'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const CATEGORY_STORAGE_KEY = 'trio3d_categories_v2';

export function useCategoryStore() {
  const [categories, setCategories] = useState<string[]>(Array.from(CATEGORIES));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('name')
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            const fetched = data.map((item: any) => item.name);
            const unique = Array.from(new Set(['Todos', ...fetched]));
            if (isMounted) {
              setCategories(unique);
              try {
                localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(unique));
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
            const unique = Array.from(new Set(['Todos', ...parsed]));
            if (isMounted) setCategories(unique);
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

  const saveCategories = async (newCategories: string[]) => {
    const cleanList = Array.from(new Set(['Todos', ...newCategories.filter((c) => c !== 'Todos')]));
    setCategories(cleanList);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cleanList));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  };

  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`La categoría "${trimmed}" ya existe.`);
      return false;
    }

    const updated = [...categories, trimmed];
    saveCategories(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').insert([{ name: trimmed }]);
      } catch (err) {
        console.error('Error adding category to Supabase:', err);
      }
    }
    return true;
  };

  const removeCategory = async (name: string) => {
    if (name === 'Todos') {
      alert('No se puede eliminar la categoría "Todos".');
      return false;
    }

    const updated = categories.filter((c) => c !== name);
    saveCategories(updated);

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
