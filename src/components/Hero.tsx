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

        {/* Top Direct Navigation Badges: Catálogo Interactivo & Galería de Impresiones */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl"
        >
          <motion.a
            href="#categorias"
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="apple-card p-6 rounded-3xl flex items-center gap-5 text-left border border-purple-500/30 hover:border-pink-500/50 bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-transparent group cursor-pointer shadow-2xl transition-all"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">Exploración 3D</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                Catálogo Interactivo
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light mt-0.5">
                Filtrá por categorías y encontrá tu producto ideal
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          <motion.a
            href="#galeria"
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="apple-card p-6 rounded-3xl flex items-center gap-5 text-left border border-amber-500/30 hover:border-amber-400/50 bg-gradient-to-r from-amber-900/20 via-purple-900/10 to-transparent group cursor-pointer shadow-2xl transition-all"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Modelos Reales</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                Galería de Impresiones
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-light mt-0.5">
                Mirá los modelos terminados y alta definición
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

