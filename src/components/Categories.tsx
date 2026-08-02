'use client';

import React from 'react';
import Image from 'next/image';
import { Key, Sparkles, Headphones, Flower2, Gift, Bot, PenTool, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoriesProps {
  onSelectCategory: (category: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  const categoriesList = [
    {
      name: 'Llaveros',
      icon: Key,
      desc: 'Nombres, logos de empresas, formas bicolores y destapadores.',
      image: '/images/soportes.png',
      badge: 'Personalizables',
    },
    {
      name: 'Decoración',
      icon: Sparkles,
      desc: 'Jarrones geométricos, piezas artísticas en espiral y esculturas.',
      image: '/images/decoracion.png',
      badge: 'Diseño Exclusivo',
    },
    {
      name: 'Soportes',
      icon: Headphones,
      desc: 'Soportes gamer para auris, celulares, joysticks y notebooks.',
      image: '/images/soportes.png',
      badge: 'Ergonómicos',
    },
    {
      name: 'Macetas',
      icon: Flower2,
      desc: 'Macetas Voronoi, autorregantes y geométricas para suculentas.',
      image: '/images/macetas.png',
      badge: 'Impermeables',
    },
    {
      name: 'Regalos personalizados',
      icon: Gift,
      desc: 'Litofanías con luz LED, cuadros 3D con foto y placas de nombre.',
      image: '/images/decoracion.png',
      badge: 'Emotivos',
    },
    {
      name: 'Figuras',
      icon: Bot,
      desc: 'Figuras coleccionables, personajes, mechas y piezas articuladas flexi.',
      image: '/images/figuras.png',
      badge: 'Máximo Detalle',
    },
    {
      name: 'Diseño a medida',
      icon: PenTool,
      desc: 'Diseño personalizado de maquetas, repuestos y carcasas a medida.',
      image: '/images/hero.png',
      badge: 'Proyectos 3D',
      featured: true,
    },
  ];

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
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
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
                <div className="absolute top-0 right-0 w-36 h-36 opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={144}
                    height={144}
                    className="object-cover rounded-bl-full"
                  />
                </div>

                <div>
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 backdrop-blur-md">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors flex items-center gap-1.5">
                    {cat.name}
                  </h3>
                  <p className="mt-2.5 text-sm text-neutral-400 font-light leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {/* Bottom Action Arrow */}
                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-neutral-400 group-hover:text-brand-400 transition-colors">
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

