'use client';

import React from 'react';
import Image from 'next/image';
import { Key, Sparkles, Headphones, Flower2, Gift, Bot, PenTool, Layers, ArrowUpRight, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { CategoryItem, DEFAULT_CATEGORY_ITEMS } from '@/hooks/useCategoryStore';

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
  categoriesList?: CategoryItem[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  llaveros: Key,
  decoración: Sparkles,
  decoracion: Sparkles,
  soportes: Headphones,
  macetas: Flower2,
  'regalos personalizados': Gift,
  figuras: Bot,
  'diseño a medida': PenTool,
  'diseno a medida': PenTool,
};

export const Categories: React.FC<CategoriesProps> = ({ onSelectCategory, categoriesList }) => {
  const itemsToRender = categoriesList && categoriesList.length > 0 ? categoriesList : DEFAULT_CATEGORY_ITEMS;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="categorias" className="py-28 bg-dark-bg relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-trio-purple/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-trio-pink/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nuestros Rubros</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Explora las infinitas posibilidades de la{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 trio-glow-text">
              Impresión 3D
            </span>
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
            Descubre la amplia variedad de soluciones en impresión 3D de ingeniería y artesanía que creamos con precisión micrométrica.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {itemsToRender.map((cat) => {
            const Icon = ICON_MAP[cat.name.toLowerCase()] || Layers;
            const badgeText = cat.badge || 'Impresión 3D';
            const descText = cat.desc || 'Productos y artículos personalizados impresos en 3D.';
            const imageSrc = cat.image || '/images/hero.png';

            return (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectCategory(cat.name);
                  const galleryEl = document.getElementById('galeria');
                  if (galleryEl) galleryEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group cursor-pointer relative overflow-hidden rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  cat.featured
                    ? 'apple-card border-2 border-brand-500/50 shadow-2xl shadow-brand-500/15 bg-gradient-to-br from-neutral-900/90 via-neutral-900 to-brand-950/50'
                    : 'apple-card'
                }`}
              >
                {/* Background Image Accent */}
                <div className="absolute top-0 right-0 w-36 h-36 opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 pointer-events-none overflow-hidden rounded-bl-full">
                  <img
                    src={imageSrc}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-bl-full"
                  />
                </div>

                <div>
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="p-3.5 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 backdrop-blur-md">
                      {badgeText}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-1.5 relative z-10">
                    {cat.name}
                  </h3>
                  <p className="mt-2.5 text-sm text-neutral-400 font-light leading-relaxed relative z-10">
                    {descText}
                  </p>
                </div>

                {/* Bottom Action Arrow */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-neutral-400 group-hover:text-brand-400 transition-colors relative z-10">
                  <span>Explorar productos</span>
                  <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
