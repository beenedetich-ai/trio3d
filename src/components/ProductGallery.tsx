'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  MessageCircle,
  Sparkles,
  Eye,
  Star,
  ShoppingBag,
  Clock,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, Product } from '@/data/products';
import { ProductModal } from './ProductModal';
import { formatPrice } from '@/utils/formatPrice';

interface ProductGalleryProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  productsList?: Product[];
  categoriesListNav?: string[];
  isLoaded?: boolean;
  onAddToCart?: (product: Product) => void;
}

interface GalleryProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onQuickWhatsApp: (e: React.MouseEvent, product: Product) => void;
}

const GalleryProductCard: React.FC<GalleryProductCardProps> = ({
  product,
  onOpenModal,
  onAddToCart,
  onQuickWhatsApp,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const imagesList =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || '/images/soportes.png'];

  const activeImage = imagesList[currentImgIndex] || imagesList[0] || product.image;

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      key={product.id}
      onClick={() => onOpenModal(product)}
      className="group cursor-pointer apple-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all"
    >
      {/* Image Container with aspect-square */}
      <div className="relative aspect-square sm:aspect-auto sm:h-60 w-full bg-neutral-950 overflow-hidden">
        <Image
          src={activeImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-apple"
        />

        {/* Category Pill */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 max-w-[70%] truncate">
          <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/75 backdrop-blur-xl text-white border border-white/15 block truncate">
            {product.category}
          </span>
        </div>

        {/* Popular Badge */}
        {product.isPopular && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-extrabold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-brand-500 text-white shadow-lg border border-white/20">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
            <span className="hidden xs:inline">MÁS VENDIDO</span>
            <span className="xs:hidden">TOP</span>
          </div>
        )}

        {/* Multiple Photos Controls on the card directly */}
        {imagesList.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-1.5 rounded-full bg-black/60 text-white hover:bg-brand-500 transition-colors backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 p-1 sm:p-1.5 rounded-full bg-black/60 text-white hover:bg-brand-500 transition-colors backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Photo Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
              {imagesList.slice(0, 5).map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`h-1 rounded-full transition-all ${
                    dotIdx === currentImgIndex
                      ? 'bg-amber-400 w-2.5'
                      : 'bg-white/40 w-1'
                  }`}
                />
              ))}
              {imagesList.length > 5 && (
                <span className="text-[7px] text-neutral-300 font-bold ml-0.5">+{imagesList.length - 5}</span>
              )}
            </div>
          </>
        )}

        {/* Overlay Quick View Hint */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center backdrop-blur-sm pointer-events-none">
          <span className="bg-white/20 backdrop-blur-xl text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full border border-white/30 flex items-center gap-1.5 sm:gap-2 shadow-2xl">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Ver Detalles
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>
          <p className="mt-1 text-[10px] sm:text-xs text-neutral-400 font-light line-clamp-2 leading-tight sm:leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-2.5 sm:mt-5 pt-2 sm:pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <span className="text-xs sm:text-base font-extrabold text-amber-400 block tracking-tight">
              {formatPrice(product.price)}
            </span>
            <span className="text-[8px] sm:text-[10px] text-amber-300/90 font-medium flex items-center gap-0.5 sm:gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">24 a 72 hs</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {onAddToCart && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 transition-all duration-300 shadow-md shadow-pink-500/20"
                title="Agregar al Carrito"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => onQuickWhatsApp(e, product)}
              className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/10"
              title="Consultar por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  selectedCategory,
  onSelectCategory,
  productsList = [],
  categoriesListNav = CATEGORIES as unknown as string[],
  isLoaded = true,
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Todas');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const categoriesToRender =
    categoriesListNav && categoriesListNav.length > 0 ? categoriesListNav : CATEGORIES;

  // Extract available subcategories for current main category
  const availableSubcategories = React.useMemo(() => {
    const categoryProducts =
      selectedCategory === 'Todos'
        ? productsList
        : productsList.filter((p) => p.category === selectedCategory);

    const subcatsSet = new Set<string>();
    categoryProducts.forEach((p) => {
      if (Array.isArray(p.subcategories) && p.subcategories.length > 0) {
        p.subcategories.forEach((s) => subcatsSet.add(s.trim()));
      } else if (p.subcategory) {
        p.subcategory.split(',').forEach((s) => {
          if (s.trim()) subcatsSet.add(s.trim());
        });
      }
    });

    return Array.from(subcatsSet);
  }, [productsList, selectedCategory]);

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Todos' || product.category === selectedCategory;

    const prodSubcats =
      Array.isArray(product.subcategories) && product.subcategories.length > 0
        ? product.subcategories
        : product.subcategory
        ? product.subcategory.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const matchesSubcategory =
      selectedSubcategory === 'Todas' ||
      prodSubcats.some(
        (s) => s.trim().toLowerCase() === selectedSubcategory.trim().toLowerCase()
      );

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prodSubcats.some((sub) => sub.toLowerCase().includes(searchTerm.toLowerCase())) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const handleQuickWhatsApp = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `¡Hola Trío 3D! Quisiera consultar disponibilidad y encargar el producto: *${product.name}* (${product.category}).`
    );
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  return (
    <section id="galeria" className="py-16 sm:py-28 bg-dark-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">
              Catálogo Interactivo
            </div>
            <h2 className="text-2xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Galería de <span className="text-brand-500 orange-glow-text">Impresiones</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-neutral-400 text-xs sm:text-base max-w-xl font-light">
              Explora modelos en stock y ejemplos de nuestros trabajos personalizados. Cotizá al instante con 1 clic.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:min-w-[300px]">
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por modelo, soporte, figura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/15 rounded-2xl pl-12 pr-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition-colors shadow-inner backdrop-blur-md"
            />
          </div>
        </motion.div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none">
          {categoriesToRender.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setSelectedSubcategory('Todas');
                }}
                className={`relative whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
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

        {/* Subcategory Filter Bar */}
        {availableSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 sm:mb-12 scrollbar-none px-3 py-2 sm:py-2.5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-bold text-pink-400 uppercase tracking-wider px-2 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" />
              Subcategorías:
            </span>

            <button
              onClick={() => setSelectedSubcategory('Todas')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubcategory === 'Todas'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white shadow-md'
                  : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Todas (
              {selectedCategory === 'Todos'
                ? productsList.length
                : productsList.filter((p) => p.category === selectedCategory).length}
              )
            </button>

            {availableSubcategories.map((sub) => {
              const active = selectedSubcategory === sub;
              const count = productsList.filter((p) => {
                const catMatch = selectedCategory === 'Todos' || p.category === selectedCategory;
                const pSubcats =
                  Array.isArray(p.subcategories) && p.subcategories.length > 0
                    ? p.subcategories
                    : p.subcategory
                    ? p.subcategory.split(',').map((s) => s.trim()).filter(Boolean)
                    : [];
                return catMatch && pSubcats.includes(sub);
              }).length;

              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white shadow-md'
                      : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {!isLoaded ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="apple-card rounded-2xl sm:rounded-3xl overflow-hidden h-56 sm:h-80 animate-pulse bg-white/[0.03] border border-white/10"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="apple-card p-8 sm:p-12 rounded-3xl text-center max-w-md mx-auto my-12"
            >
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-brand-500 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg sm:text-xl font-bold text-white">No encontramos ese producto</h3>
              <p className="text-neutral-400 text-xs sm:text-sm mt-2 font-light">
                ¡Pero podemos imprimirlo a medida! Mandanos tu idea o archivo STL/CAD por WhatsApp.
              </p>
              <button
                onClick={() => {
                  const message = encodeURIComponent(
                    '¡Hola Trío 3D! No encontré un modelo específico en la web. ¿Pueden hacerlo a medida?'
                  );
                  window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
                }}
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-orange-600 text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-brand-500/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar A Medida</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6"
            >
              {filteredProducts.map((product) => (
                <GalleryProductCard
                  key={product.id}
                  product={product}
                  onOpenModal={(p) => setActiveProduct(p)}
                  onAddToCart={onAddToCart}
                  onQuickWhatsApp={handleQuickWhatsApp}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <ProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  );
};
