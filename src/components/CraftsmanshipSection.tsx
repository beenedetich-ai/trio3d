'use client';

import React from 'react';
import { Printer, Sparkles, ShieldCheck, Leaf, Layers, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const CraftsmanshipSection: React.FC = () => {
  const highlights = [
    {
      title: 'Fabricación personalizada',
      description: 'Adaptamos colores, nombres y detalles para cada cliente.',
      icon: Sparkles,
    },
    {
      title: 'Calidad garantizada',
      description: 'Inspección meticulosa en cada capa de impresión 3D.',
      icon: ShieldCheck,
    },
    {
      title: 'Producción responsable',
      description: 'Cero residuos innecesarios y materiales biodegradables PLA.',
      icon: Leaf,
    },
    {
      title: 'Diseños únicos',
      description: 'Piezas exclusivas con acabados estéticos de vanguardia.',
      icon: Layers,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-dark-bg via-neutral-950 to-dark-bg relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={containerVariants}
          className="apple-glass p-8 sm:p-12 rounded-3xl border border-pink-500/30 shadow-2xl relative"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-md">
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Impresión 3D On-Demand</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Fabricación Exclusiva <span className="gradient-text">Para Cada Cliente</span>
            </h2>

            <p className="mt-5 text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
              Todas nuestras piezas se fabrican especialmente para cada pedido. Esto nos permite garantizar una impresión de alta calidad, ofrecer opciones de personalización y reducir el desperdicio de materiales, creando productos únicos para cada cliente.
            </p>
          </motion.div>

          {/* 4 Feature Highlights Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          >
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="apple-card p-6 rounded-2xl border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:text-amber-400 transition-colors mb-4 shadow-lg shadow-pink-500/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Production Time Clarification Banner */}
          <motion.div
            variants={itemVariants}
            className="mt-10 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left shadow-lg"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-amber-200">
              <span className="font-extrabold text-amber-300">Tiempo estimado de producción:</span> 24 a 72 horas, según la complejidad del producto.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
