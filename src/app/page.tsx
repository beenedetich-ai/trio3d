'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { ProductGallery } from '@/components/ProductGallery';
import { HowToBuy } from '@/components/HowToBuy';
import { CraftsmanshipSection } from '@/components/CraftsmanshipSection';
import { FeaturesBar } from '@/components/FeaturesBar';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { AdminPanelModal } from '@/components/AdminPanelModal';
import { CartDrawer } from '@/components/CartDrawer';
import { useProductStore } from '@/hooks/useProductStore';
import { useCartStore } from '@/hooks/useCartStore';
import { useCategoryStore } from '@/hooks/useCategoryStore';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const {
    products,
    addProduct,
    editProduct,
    deleteProduct,
    resetToDefault,
  } = useProductStore();

  const {
    categories,
    addCategory,
    removeCategory,
  } = useCategoryStore();

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  return (
    <main className="min-h-screen bg-dark-bg text-white relative">
      {/* Navigation Header */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartItemCount={getTotalItems()}
      />

      {/* 1. Hero Principal */}
      <Hero />

      {/* 2. Sección de Categorías */}
      <Categories onSelectCategory={setSelectedCategory} />

      {/* 3. Galería de Productos */}
      <ProductGallery
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        productsList={products}
        categoriesListNav={categories}
        onAddToCart={(p) => {
          addToCart(p);
          setIsCartOpen(true);
        }}
      />

      {/* 4. Fabricación Especial On-Demand & Exclusividad */}
      <CraftsmanshipSection />

      {/* 5. Barra de Beneficios (Cotización, Materiales, Garantía, Envíos) */}
      <FeaturesBar />

      {/* 6. Explicación de cómo comprar en 4 pasos */}
      <HowToBuy />

      {/* 6. Preguntas Frecuentes */}
      <FaqSection />

      {/* 7. Footer con Instagram, Facebook y WhatsApp */}
      <Footer />

      {/* Floating Action WhatsApp */}
      <WhatsAppFloat />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
      />

      {/* Admin Panel Modal (Without Code) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        onAddProduct={addProduct}
        onEditProduct={editProduct}
        onDeleteProduct={deleteProduct}
        onResetCatalog={resetToDefault}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
      />
    </main>
  );
}
