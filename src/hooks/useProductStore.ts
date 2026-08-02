'use client';

import { useState, useEffect } from 'react';
import { PRODUCTS, Product } from '@/data/products';

const STORAGE_KEY = 'trio3d_custom_products_v2';

export function useProductStore() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load & migrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((p: Product) => {
            let finalPeso = typeof p.peso === 'number' && p.peso > 0 ? p.peso : 200;
            if (finalPeso < 5) finalPeso = Math.round(finalPeso * 1000); // convert legacy kg to grams
            return {
              ...p,
              peso: finalPeso,
              alto: typeof p.alto === 'number' && p.alto > 0 ? p.alto : 10,
              ancho: typeof p.ancho === 'number' && p.ancho > 0 ? p.ancho : 10,
              largo: typeof p.largo === 'number' && p.largo > 0 ? p.largo : 10,
            };
          });
          setProducts(migrated);
        }
      }
    } catch (error) {
      console.error('Error loading products from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save helper
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    } catch (error) {
      console.error('Error saving products to localStorage:', error);
    }
  };

  // Add new product
  const addProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `custom-${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);
  };

  // Edit existing product
  const editProduct = (id: string, updatedData: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
    saveProducts(updated);
  };

  // Delete product
  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
  };

  // Reset to original catalog
  const resetToDefault = () => {
    saveProducts(PRODUCTS);
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
