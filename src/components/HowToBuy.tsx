'use client';

import React from 'react';
import { Send, FileText, Printer, Truck, ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowToBuy: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Elegí o envíanos tu idea',
      desc: 'Seleccioná un producto del catálogo o mandanos tu archivo 3D (.STL, .OBJ), foto o bosquejo por WhatsApp.',
      icon: Send,
      badge: 'Paso Inicial',
    },
    {
      number: '02',
      title: 'Cotización en minutos',
      desc: 'Analizamos el volumen, peso y tiempo de impresión para darte el mejor presupuesto con opciones de materiales.',
      icon: FileText,
      badge: 'Sin Compromiso',
    },
    {
      number: '03',
      title: 'Impresión 3D de precisión',
      desc: 'Ponemos en marcha la fabricación layer-by-layer con tecnología de punta y control de calidad exhaustivo.',
      icon: Printer,
      badge: 'Calidad Premium',
    },
    {
      number: '04',
      title: 'Envío o Retiro en tu puerta',
      desc: 'Embalamos tu pedido en paquete protegido anti-impactos y lo despachamos directo a tu domicilio.',
      icon: Truck,
      badge: 'Entrega Rápida',
    },
  ];

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('¡Hola Trío 3D! Quisiera iniciar un pedido en 4 pasos. ¿Cómo empezamos?');
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section id="pasos" className="py-28 bg-dark-bg relative overflow-hidden">
      {/* Background Subtle Mesh Pattern */}
      <div className="absolute inset-0 bg-mesh-pattern opacity-30 pointer-events-none" />

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
            Proceso Transparente
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            ¿Cómo comprar en <span className="text-brand-500 orange-glow-text">4 simples pasos</span>?
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
            Te acompañamos paso a paso desde la idea inicial hasta el objeto físico final en tus manos.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative apple-card rounded-3xl p-7 flex flex-col justify-between"
              >
                {/* Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-orange-400">
                      {step.number}
                    </span>
                    <div className="p-3.5 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-neutral-300 mb-4 border border-white/10 backdrop-blur-md">
                    {step.badge}
                  </span>

                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-neutral-400 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Step Connector Icon */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-neutral-900 border border-white/20 flex items-center justify-center text-neutral-400 shadow-lg">
                      <ArrowRight className="w-3.5 h-3.5 text-brand-500" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 apple-glass p-8 sm:p-10 rounded-3xl border border-brand-500/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">¿Tenés tu archivo 3D o una idea en mente?</h3>
            <p className="text-neutral-300 text-sm sm:text-base mt-2 font-light">
              Enviánosla ahora mismo por WhatsApp y te respondemos con la cotización en minutos.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsAppClick}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-brand-500 via-orange-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-brand-500/30 border border-white/20 whitespace-nowrap transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-white/20" />
            <span>Iniciar Pedido por WhatsApp</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

