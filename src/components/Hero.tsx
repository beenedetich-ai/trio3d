'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, ArrowRight, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('¡Hola Trío 3D! Quisiera solicitar un presupuesto personalizado para una impresión 3D.');
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden bg-dark-bg">
      {/* Background Image & Apple Ambient Glow */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.png"
          alt="Impresión 3D Trío 3D"
          fill
          className="object-cover object-center opacity-25 scale-105 transition-transform duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/90 to-dark-bg" />
        <div className="absolute inset-0 bg-apple-gradient opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-mesh-pattern opacity-30 pointer-events-none" />
      </div>

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center"
      >
        {/* Top Tagline Pill */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-pink-500/30 text-pink-300 text-xs sm:text-sm font-semibold mb-8 shadow-2xl backdrop-blur-xl animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Impresión 3D de Alta Precisión & Diseños Exclusivos</span>
          </div>
        </motion.div>

        {/* Title with Official Trío 3D Gradient */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.08] max-w-5xl"
        >
          Convertimos tus{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 trio-glow-text">
            ideas
          </span>{' '}
          en realidad 3D
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg sm:text-xl md:text-2xl text-neutral-300 max-w-3xl font-light leading-relaxed"
        >
          Desde figuras personalizadas y regalos emotivos hasta llaveros, soportes útiles y decoración exclusiva de alta definición.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsAppClick}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold text-base sm:text-lg px-9 py-4 rounded-2xl shadow-xl shadow-pink-500/25 border border-white/20 transition-all duration-300 group"
          >
            <MessageCircle className="w-6 h-6 fill-white/20 group-hover:rotate-12 transition-transform duration-300" />
            <span>Solicitar Presupuesto por WhatsApp</span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            href="#galeria"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/15 font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl"
          >
            <span>Ver Catálogo</span>
            <ArrowRight className="w-5 h-5 text-brand-500 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>

        {/* Feature Badges Grid */}
        <motion.div
          variants={itemVariants}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl"
        >
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-5 rounded-3xl flex items-center gap-4 text-left"
          >
            <div className="p-3 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Cotización</p>
              <p className="text-sm sm:text-base font-bold text-white">Rápida & Directa</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-5 rounded-3xl flex items-center gap-4 text-left"
          >
            <div className="p-3 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Materiales</p>
              <p className="text-sm sm:text-base font-bold text-white">PLA & PETG Premium</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-5 rounded-3xl flex items-center gap-4 text-left"
          >
            <div className="p-3 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Garantía</p>
              <p className="text-sm sm:text-base font-bold text-white">Alta Precisión</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="apple-card p-5 rounded-3xl flex items-center gap-4 text-left"
          >
            <div className="p-3 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-neutral-400 font-medium">Envíos</p>
              <p className="text-sm sm:text-base font-bold text-white">A todo el país</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

