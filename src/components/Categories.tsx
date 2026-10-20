'use client';

import React from 'react';
import {
  Home,
  Laptop,
  Smartphone,
  Gamepad2,
  Gift,
  Palette,
  Factory,
  Car,
  Gamepad,
  Hammer,
  Dog,
  Trophy,
  Sparkles,
  HeartPulse,
  Tv,
  Layers,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CategoryItem, DEFAULT_CATEGORY_ITEMS } from '@/hooks/useCategoryStore';

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
  categoriesList?: CategoryItem[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  'hogar, muebles y jardín': Home,
  'hogar, muebles y jardin': Home,
  'hogar': Home,
  'computación': Laptop,
  'computacion': Laptop,
  'celulares y teléfonos': Smartphone,
  'celulares y telefonos': Smartphone,
  'juegos y juguetes': Gamepad2,
  'souvenirs, cotillón y fiestas': Gift,
  'souvenirs, cotillon y fiestas': Gift,
  'arte, librería y mercería': Palette,
  'arte, libreria y merceria': Palette,
  'industrias y oficinas': Factory,
  'accesorios para vehículos': Car,
  'accesorios para vehiculos': Car,
  'consolas y videojuegos': Gamepad,
  'herramientas': Hammer,
  'animales y mascotas': Dog,
  'deportes y fitness': Trophy,
  'belleza y cuidado personal': Sparkles,
  'salud y equipamiento médico': HeartPulse,
  'salud y equipamiento medico': HeartPulse,
  'electrónica, audio y video': Tv,
  'electronica, audio y video': Tv,
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
    <section id="categorias" className="py-16 sm:py-28 bg-dark-bg relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-trio-purple/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-trio-pink/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rubros Oficiales Mercado Libre</span>
          </div>
          <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Categorías de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 trio-glow-text">
              Mercado Libre
            </span>{' '}
            en Trío 3D
          </h2>
          <p className="mt-3 sm:mt-4 text-neutral-400 text-xs sm:text-lg font-light leading-relaxed">
            Explora nuestro catálogo estructurado según la clasificación oficial de Mercado Libre. Encuentra con rapidez creaciones, soportes gamer, repuestos y piezas de ingeniería 3D.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
        >
          {itemsToRender.map((cat) => {
            const Icon = ICON_MAP[cat.name.toLowerCase().trim()] || Layers;
            const badgeText = cat.badge || 'Mercado Libre';
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
                className={`group cursor-pointer relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  cat.featured
                    ? 'apple-card border-2 border-brand-500/50 shadow-2xl shadow-brand-500/15 bg-gradient-to-br from-neutral-900/90 via-neutral-900 to-brand-950/50'
                    : 'apple-card'
                }`}
              >
                {/* Background Image Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-36 sm:h-36 opacity-15 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 pointer-events-none overflow-hidden rounded-bl-full">
                  <img
                    src={imageSrc}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-bl-full"
                  />
                </div>

                <div>
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between mb-3 sm:mb-6 relative z-10">
                    <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-md">
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[8px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 backdrop-blur-md max-w-[70px] sm:max-w-none truncate">
                      {badgeText}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xs sm:text-xl font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-1.5 relative z-10 leading-snug line-clamp-2">
                    {cat.name}
                  </h3>
                  <p className="mt-1 sm:mt-2.5 text-[10px] sm:text-sm text-neutral-400 font-light leading-snug sm:leading-relaxed relative z-10 line-clamp-2 sm:line-clamp-3">
                    {descText}
                  </p>
                </div>

                {/* Bottom Action Arrow */}
                <div className="mt-3 sm:mt-8 pt-2 sm:pt-4 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-xs font-bold text-neutral-400 group-hover:text-brand-400 transition-colors relative z-10">
                  <span className="truncate">Ver en Galería</span>
                  <div className="p-1 sm:p-1.5 rounded-full bg-white/5 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-md flex-shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
