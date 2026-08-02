'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, MessageCircle, Sparkles, Eye, Star, ShoppingBag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, CATEGORIES, Product } from '@/data/products';
import { ProductModal } from './ProductModal';

interface ProductGalleryProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  productsList?: Product[];
  categoriesListNav?: string[];
  onAddToCart?: (product: Product) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  selectedCategory,
  onSelectCategory,
  productsList = PRODUCTS,
  categoriesListNav = CATEGORIES as unknown as string[],
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const categoriesToRender = categoriesListNav && categoriesListNav.length > 0 ? categoriesListNav : CATEGORIES;

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleQuickWhatsApp = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `¡Hola Trío 3D! Quisiera consultar precio y disponibilidad del producto: *${product.name}* (${product.category}).`
    );
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  return (
    <section id="galeria" className="py-28 bg-dark-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">
              Catálogo Interactivo
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Galería de <span className="text-brand-500 orange-glow-text">Impresiones</span>
            </h2>
            <p className="mt-3 text-neutral-400 text-base max-w-xl font-light">
              Explora modelos en stock y ejemplos de nuestros trabajos personalizados. Cotizá al instante con 1 clic.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[300px]">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por modelo o etiqueta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/15 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition-colors shadow-inner backdrop-blur-md"
            />
          </div>
        </motion.div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {categoriesToRender.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`relative whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  active ? 'text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 rounded-full shadow-lg shadow-pink-500/30 border border-white/20"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="apple-card p-12 rounded-3xl text-center max-w-md mx-auto my-12"
            >
              <Sparkles className="w-12 h-12 text-brand-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white">No encontramos ese producto</h3>
              <p className="text-neutral-400 text-sm mt-2 font-light">
                ¡Pero podemos imprimirlo a medida! Mandanos tu idea o archivo STL/CAD por WhatsApp.
              </p>
              <button
                onClick={() => {
                  const message = encodeURIComponent('¡Hola Trío 3D! No encontré un modelo específico en la web. ¿Pueden hacerlo a medida?');
                  window.open(`https://wa.me/5491123456789?text=${message}`, '_blank');
                }}
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-orange-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-brand-500/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar A Medida</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  key={product.id}
                  onClick={() => setActiveProduct(product)}
                  className="group cursor-pointer apple-card rounded-3xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative h-60 w-full bg-neutral-950 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-apple"
                    />

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/70 backdrop-blur-xl text-white border border-white/15">
                        {product.category}
                      </span>
                    </div>

                    {/* Popular Badge */}
                    {product.isPopular && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full bg-brand-500 text-white shadow-lg border border-white/20">
                        <Star className="w-3 h-3 fill-white" />
                        MÁS VENDIDO
                      </div>
                    )}

                    {/* Overlay Quick View Hint */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-white/20 backdrop-blur-xl text-white text-xs font-bold px-4 py-2.5 rounded-full border border-white/30 flex items-center gap-2 shadow-2xl">
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                          Precio aprox
                        </span>
                        <span className="text-base font-extrabold text-amber-400 block">
                          {product.price}
                        </span>
                        <span className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>24 a 72 hs de prod.</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onAddToCart && (
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-all duration-300 shadow-md shadow-pink-500/20"
                            title="Agregar al Carrito"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </motion.button>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => handleQuickWhatsApp(e, product)}
                          className="p-2.5 rounded-2xl bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/10"
                          title="Consultar por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <ProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      </div>
    </section>
  );
};

