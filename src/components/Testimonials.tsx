'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { REVIEWS } from '@/data/reviews';

export const Testimonials: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="opiniones" className="py-28 bg-dark-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
            <Star className="w-4 h-4 fill-brand-500 text-brand-500" />
            Experiencias Reales
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Lo que dicen <span className="text-brand-500 orange-glow-text">nuestros clientes</span>
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
            La satisfacción de quienes confían en Trío 3D para dar vida a sus proyectos es nuestra prioridad.
          </p>

          {/* Rating Summary Badge */}
          <div className="mt-8 inline-flex items-center gap-4 apple-glass px-6 py-3 rounded-full shadow-xl">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-white font-black text-xl font-mono">4.9 / 5</span>
            <span className="text-neutral-400 text-xs border-l border-white/10 pl-4 font-medium">+150 clientes satisfechos</span>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {REVIEWS.map((rev) => (
            <motion.div
              key={rev.id}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className="apple-card rounded-3xl p-8 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-500/50 shadow-md">
                      <Image
                        src={rev.avatar}
                        alt={rev.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        {rev.name}
                        <CheckCircle2 className="w-4 h-4 text-brand-500" />
                      </h3>
                      <span className="text-xs text-neutral-400 font-light">{rev.role}</span>
                    </div>
                  </div>

                  <Quote className="w-8 h-8 text-white/10" />
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Bottom product bought pill */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <span className="bg-white/5 px-3 py-1.5 rounded-full text-neutral-300 border border-white/5">
                  Producto: <strong className="text-brand-400 font-semibold">{rev.productBought}</strong>
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">{rev.date}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

