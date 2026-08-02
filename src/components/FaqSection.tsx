'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '@/data/faqs';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('¡Hola Trío 3D! Tengo una pregunta sobre impresiones 3D que no vi en las FAQ.');
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  return (
    <section id="faq" className="py-28 bg-dark-bg relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
            <HelpCircle className="w-4 h-4 text-brand-500" />
            Resolve tus dudas
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Preguntas <span className="text-brand-500 orange-glow-text">Frecuentes</span>
          </h2>
          <p className="mt-4 text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
            Todo lo que necesitas saber sobre materiales, envíos, formatos de archivos y cotización.
          </p>
        </motion.div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.5 }}
                className={`apple-card rounded-3xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-brand-500/50 shadow-xl shadow-brand-500/10'
                    : ''
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-7 py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`p-2.5 rounded-full transition-colors ${
                      isOpen ? 'bg-brand-500 text-white' : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-6 pt-1 text-sm sm:text-base text-neutral-300 font-light leading-relaxed border-t border-white/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Extra Question CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 text-center"
        >
          <p className="text-neutral-400 text-sm font-light">
            ¿Tenés alguna otra duda específica sobre tu proyecto o prototipo?
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="mt-4 inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-bold text-sm hover:underline transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consultar directamente con nuestro equipo por WhatsApp →</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

