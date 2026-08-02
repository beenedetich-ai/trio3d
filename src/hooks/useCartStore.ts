'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedMaterial?: string;
}

const CART_STORAGE_KEY = 'trio3d_shopping_cart_v1';

export function useCartStore() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage helper
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  // Helper to extract numeric price from string like "Desde $4.500" or "$3.200"
  const parsePriceNumber = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    const val = parseInt(cleaned, 10);
    return isNaN(val) ? 0 : val;
  };

  // Add item to cart
  const addToCart = (product: Product, quantity: number = 1, selectedMaterial?: string) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedMaterial === selectedMaterial
    );

    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          product,
          quantity,
          selectedMaterial: selectedMaterial || product.materials[0] || 'PLA',
        },
      ];
    }

    saveCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (productId: string, selectedMaterial?: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.selectedMaterial === selectedMaterial)
    );
    saveCart(updatedCart);
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number, selectedMaterial?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedMaterial);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.product.id === productId && item.selectedMaterial === selectedMaterial
        ? { ...item, quantity }
        : item
    );
    saveCart(updatedCart);
  };

  // Clear entire cart
  const clearCart = () => {
    saveCart([]);
  };

  // Total items count
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Total price in ARS
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const unitPrice = parsePriceNumber(item.product.price);
      return total + unitPrice * item.quantity;
    }, 0);
  };

  // Total weight in Kg
  const getTotalWeightKg = () => {
    const total = cart.reduce((accum, item) => {
      const itemWeight = typeof item.product.peso === 'number' && item.product.peso > 0 ? item.product.peso : 0.2;
      return accum + itemWeight * item.quantity;
    }, 0);
    return Math.max(0.1, Math.round(total * 100) / 100);
  };

  // Calculated package dimensions (Alto, Ancho, Largo in cm)
  const getPackageDimensions = () => {
    if (cart.length === 0) return { alto: 10, ancho: 10, largo: 10 };

    let totalAlto = 0;
    let maxAncho = 10;
    let maxLargo = 10;

    cart.forEach((item) => {
      const h = typeof item.product.alto === 'number' && item.product.alto > 0 ? item.product.alto : 10;
      const w = typeof item.product.ancho === 'number' && item.product.ancho > 0 ? item.product.ancho : 10;
      const l = typeof item.product.largo === 'number' && item.product.largo > 0 ? item.product.largo : 10;

      totalAlto += h * Math.min(item.quantity, 3); // realistic stacking height
      if (w > maxAncho) maxAncho = w;
      if (l > maxLargo) maxLargo = l;
    });

    return {
      alto: Math.max(10, Math.round(totalAlto)),
      ancho: Math.max(10, Math.round(maxAncho)),
      largo: Math.max(10, Math.round(maxLargo)),
    };
  };

  return {
    cart,
    isLoaded,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalWeightKg,
    getPackageDimensions,
    parsePriceNumber,
  };
}
