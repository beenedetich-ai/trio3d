'use client';

import React from 'react';
import { ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const FeaturesBar: React.FC = () => {
  return (
    <section className="py-16 bg-dark-bg/80 border-y border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-6 rounded-3xl flex items-center gap-4 text-left border border-white/10 shadow-xl"
          >
            <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Cotización</p>
              <p className="text-base font-bold text-white">Rápida & Directa</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-6 rounded-3xl flex items-center gap-4 text-left border border-white/10 shadow-xl"
          >
            <div className="p-3.5 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Materiales</p>
              <p className="text-base font-bold text-white">PLA & PETG Premium</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-6 rounded-3xl flex items-center gap-4 text-left border border-white/10 shadow-xl"
          >
            <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Garantía</p>
              <p className="text-base font-bold text-white">Alta Precisión</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-6 rounded-3xl flex items-center gap-4 text-left border border-white/10 shadow-xl"
          >
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Envíos</p>
              <p className="text-base font-bold text-white">A todo el país</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
