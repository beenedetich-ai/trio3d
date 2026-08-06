'use client';

import { useState, useEffect } from 'react';
import { PRODUCTS, Product } from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEY = 'trio3d_custom_products_v2';
const HAS_SEEDED_KEY = 'trio3d_has_seeded_v2';

export function useProductStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load products from Supabase (with one-time initial seed, or local fallback)
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            const hasSeededBefore = localStorage.getItem(HAS_SEEDED_KEY) === 'true';

            // Only seed on the VERY FIRST initialization if database is empty and never seeded
            if (data.length === 0 && !hasSeededBefore) {
              const dbRows = PRODUCTS.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                subcategory: p.subcategory || null,
                description: p.description,
                price: p.price,
                is_popular: p.isPopular ?? false,
                image: p.image,
                images: p.images && p.images.length > 0 ? p.images : [p.image],
                materials: p.materials,
                dimensions: p.dimensions || null,
                tags: p.tags,
                peso: p.peso || 200,
                alto: p.alto || 10,
                ancho: p.ancho || 10,
                largo: p.largo || 10,
              }));

              const { error: seedError } = await supabase.from('products').insert(dbRows);
              localStorage.setItem(HAS_SEEDED_KEY, 'true');

              if (!seedError && isMounted) {
                setProducts(PRODUCTS);
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(PRODUCTS));
                } catch (_) {}
                setIsLoaded(true);
                return;
              }
            } else {
              // Map DB rows directly (even if data is empty [] after user deleted everything)
              const mapped: Product[] = data.map((item: any) => {
                const rawImages = Array.isArray(item.images) && item.images.length > 0
                  ? item.images
                  : [item.image || '/images/soportes.png'];
                return {
                  id: item.id,
                  name: item.name,
                  category: item.category,
                  subcategory: item.subcategory || '',
                  description: item.description || '',
                  price: item.price || '0',
                  isPopular: item.is_popular ?? false,
                  image: item.image || rawImages[0] || '/images/soportes.png',
                  images: rawImages,
                  materials: Array.isArray(item.materials) ? item.materials : ['PLA'],
                  dimensions: item.dimensions || '',
                  tags: Array.isArray(item.tags) ? item.tags : ['3D'],
                  peso: item.peso || 200,
                  alto: item.alto || 10,
                  ancho: item.ancho || 10,
                  largo: item.largo || 10,
                };
              });

              if (isMounted) {
                setProducts(mapped);
                localStorage.setItem(HAS_SEEDED_KEY, 'true');
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
                } catch (_) {}
                setIsLoaded(true);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching products from Supabase:', error);
        }
      }

      // Fallback if Supabase is offline or not configured: LocalStorage or static catalog
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const migrated = parsed.map((p: Product) => {
              let finalPeso = typeof p.peso === 'number' && p.peso > 0 ? p.peso : 200;
              if (finalPeso < 5) finalPeso = Math.round(finalPeso * 1000);
              const rawImgs = Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : [p.image || '/images/soportes.png'];
              return {
                ...p,
                image: p.image || rawImgs[0],
                images: rawImgs,
                peso: finalPeso,
                alto: typeof p.alto === 'number' && p.alto > 0 ? p.alto : 10,
                ancho: typeof p.ancho === 'number' && p.ancho > 0 ? p.ancho : 10,
                largo: typeof p.largo === 'number' && p.largo > 0 ? p.largo : 10,
              };
            });
            if (isMounted) setProducts(migrated);
          }
        }
      } catch (error) {
        console.error('Error loading products from localStorage:', error);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to sync local state & storage
  const saveLocalState = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(HAS_SEEDED_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  };

  // Add new product
  const addProduct = async (newProductData: Omit<Product, 'id'>) => {
    const id = `custom-${Date.now()}`;
    const rawImages = newProductData.images && newProductData.images.length > 0
      ? newProductData.images.slice(0, 5)
      : [newProductData.image || '/images/soportes.png'];
    const newProduct: Product = {
      ...newProductData,
      image: rawImages[0],
      images: rawImages,
      id,
    };

    const updated = [newProduct, ...products];
    saveLocalState(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            category: newProduct.category,
            subcategory: newProduct.subcategory || null,
            description: newProduct.description,
            price: newProduct.price,
            is_popular: newProduct.isPopular ?? false,
            image: newProduct.image,
            images: newProduct.images,
            materials: newProduct.materials,
            dimensions: newProduct.dimensions || null,
            tags: newProduct.tags,
            peso: newProduct.peso || 200,
            alto: newProduct.alto || 10,
            ancho: newProduct.ancho || 10,
            largo: newProduct.largo || 10,
          },
        ]);
        if (error) {
          console.error('Error inserting product into Supabase:', error);
        }
      } catch (err) {
        console.error('Exception inserting product into Supabase:', err);
      }
    }
  };

  // Edit existing product
  const editProduct = async (id: string, updatedData: Partial<Product>) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const mergedImages = updatedData.images !== undefined
          ? updatedData.images
          : (updatedData.image ? [updatedData.image] : (p.images || [p.image]));
        const mainImage = mergedImages[0] || updatedData.image || p.image;
        return { ...p, ...updatedData, image: mainImage, images: mergedImages };
      }
      return p;
    });
    saveLocalState(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload: any = {};
        if (updatedData.name !== undefined) dbPayload.name = updatedData.name;
        if (updatedData.category !== undefined) dbPayload.category = updatedData.category;
        if (updatedData.subcategory !== undefined) dbPayload.subcategory = updatedData.subcategory;
        if (updatedData.description !== undefined) dbPayload.description = updatedData.description;
        if (updatedData.price !== undefined) dbPayload.price = updatedData.price;
        if (updatedData.isPopular !== undefined) dbPayload.is_popular = updatedData.isPopular;
        if (updatedData.images !== undefined) {
          dbPayload.images = updatedData.images;
          if (updatedData.images.length > 0) dbPayload.image = updatedData.images[0];
        } else if (updatedData.image !== undefined) {
          dbPayload.image = updatedData.image;
        }
        if (updatedData.materials !== undefined) dbPayload.materials = updatedData.materials;
        if (updatedData.dimensions !== undefined) dbPayload.dimensions = updatedData.dimensions;
        if (updatedData.tags !== undefined) dbPayload.tags = updatedData.tags;
        if (updatedData.peso !== undefined) dbPayload.peso = updatedData.peso;
        if (updatedData.alto !== undefined) dbPayload.alto = updatedData.alto;
        if (updatedData.ancho !== undefined) dbPayload.ancho = updatedData.ancho;
        if (updatedData.largo !== undefined) dbPayload.largo = updatedData.largo;

        const { error } = await supabase.from('products').update(dbPayload).eq('id', id);
        if (error) {
          console.error('Error updating product in Supabase:', error);
        }
      } catch (err) {
        console.error('Exception updating product in Supabase:', err);
      }
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveLocalState(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Error deleting product from Supabase:', error);
        }
      } catch (err) {
        console.error('Exception deleting product from Supabase:', err);
      }
    }
  };

  // Reset catalog
  const resetToDefault = async () => {
    saveLocalState(PRODUCTS);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().neq('id', '___none___');
        const dbRows = PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          subcategory: p.subcategory || null,
          description: p.description,
          price: p.price,
          is_popular: p.isPopular ?? false,
          image: p.image,
          images: p.images && p.images.length > 0 ? p.images : [p.image],
          materials: p.materials,
          dimensions: p.dimensions || null,
          tags: p.tags,
          peso: p.peso || 200,
          alto: p.alto || 10,
          ancho: p.ancho || 10,
          largo: p.largo || 10,
        }));
        await supabase.from('products').upsert(dbRows);
      } catch (err) {
        console.error('Exception resetting products in Supabase:', err);
      }
    }
  };

  return {
    products,
    isLoaded,
    addProduct,
    editProduct,
    deleteProduct,
    resetToDefault,
  };
}
