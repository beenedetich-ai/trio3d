'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, Sparkles } from 'lucide-react';
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
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="inicio" className="relative pt-24 pb-4 sm:pt-28 sm:pb-6 overflow-hidden bg-dark-bg">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-pink-500/30 text-pink-300 text-xs sm:text-sm font-semibold mb-4 shadow-2xl backdrop-blur-xl animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>📍 Servicio de Impresión 3D & Prototipado en Paraná, Entre Ríos</span>
          </div>
        </motion.div>

        {/* Title with Official Trío 3D Gradient */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl"
        >
          Impresión 3D y{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 trio-glow-text">
            Prototipado
          </span>{' '}
          en Paraná y Entre Ríos
        </motion.h1>

        {/* CTA Button */}
        <motion.div
          variants={itemVariants}
          className="mt-5 sm:mt-6 flex justify-center w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsAppClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm sm:text-base px-7 py-3 rounded-2xl shadow-xl shadow-pink-500/25 border border-white/20 transition-all duration-300 group"
          >
            <MessageCircle className="w-5 h-5 fill-white/20 group-hover:rotate-12 transition-transform duration-300" />
            <span>Solicitar Presupuesto por WhatsApp</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

