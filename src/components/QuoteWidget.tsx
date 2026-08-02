'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Calculator, MessageCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const QuoteWidget: React.FC = () => {
  const [material, setMaterial] = useState<'PLA' | 'PETG' | 'Resina'>('PLA');
  const [size, setSize] = useState<'pequeño' | 'mediano' | 'grande'>('mediano');
  const [infill, setInfill] = useState<number>(20);
  const [description, setDescription] = useState<string>('');

  // Estimate price calculation logic
  const getEstimatedPrice = () => {
    let base = 2500;
    if (size === 'mediano') base = 6500;
    if (size === 'grande') base = 14500;

    if (material === 'PETG') base *= 1.25;
    if (material === 'Resina') base *= 1.6;

    if (infill > 40) base *= 1.15;

    return Math.round(base);
  };

  const handleSendWhatsAppQuote = () => {
    // Trigger confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff5500', '#ffffff', '#ff8800'],
    });

    const priceEst = getEstimatedPrice().toLocaleString('es-AR');
    let message = `¡Hola Trío 3D! Usé la calculadora web y quisiera cotizar un proyecto:\n`;
    message += `• Material: ${material}\n`;
    message += `• Tamaño estimado: ${size.toUpperCase()}\n`;
    message += `• Relleno (Infill): ${infill}%\n`;
    if (description) message += `• Descripción de la idea: ${description}\n`;
    message += `• Estimación web aproximada: $${priceEst}\n`;
    message += `¿Me ayudan a confirmarlo e iniciar la impresión?`;

    window.open(`https://wa.me/5491123456789?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="cotizador" className="py-24 bg-dark-bg relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="apple-glass rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-brand-500/30"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left: Text & Features */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Calculator className="w-4 h-4 text-brand-500" />
                Calculadora Instantánea
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Cotizá tu impresión en <span className="text-brand-500 orange-glow-text">tiempo real</span>
              </h3>
              <p className="mt-4 text-neutral-300 text-sm sm:text-base font-light leading-relaxed">
                Personalizá el material, volumen y nivel de resistencia para calcular una estimación precisa en segundos.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                  <div className="p-1 rounded-full bg-brand-500/20 text-brand-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Sin compromiso de compra.</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                  <div className="p-1 rounded-full bg-brand-500/20 text-brand-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Asesoramiento técnico en elección de filamento/resina.</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300">
                  <div className="p-1 rounded-full bg-brand-500/20 text-brand-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Descuentos automáticos para series y mayoristas.</span>
                </div>
              </div>
            </div>

            {/* Right: Calculator Controls */}
            <div className="lg:w-1/2 w-full apple-card p-6 sm:p-8 rounded-3xl border border-white/10">
              {/* Material Select */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-widest mb-3">
                  1. Material Principal
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['PLA', 'PETG', 'Resina'] as const).map((m) => (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      key={m}
                      onClick={() => setMaterial(m)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                        material === m
                          ? 'bg-gradient-to-r from-brand-500 to-orange-600 text-white shadow-lg shadow-brand-500/30 border border-white/20'
                          : 'bg-white/[0.05] text-neutral-400 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {m}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Size Select */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-widest mb-3">
                  2. Tamaño Aproximado
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['pequeño', 'mediano', 'grande'] as const).map((s) => (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-3 rounded-2xl text-xs font-bold capitalize transition-all ${
                        size === s
                          ? 'bg-gradient-to-r from-brand-500 to-orange-600 text-white shadow-lg shadow-brand-500/30 border border-white/20'
                          : 'bg-white/[0.05] text-neutral-400 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Infill Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
                    3. Relleno Interior (Infill)
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-400 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30">
                    {infill}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={infill}
                  onChange={(e) => setInfill(Number(e.target.value))}
                  className="w-full accent-brand-500 cursor-pointer bg-neutral-800 rounded-lg h-2"
                />
              </div>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-widest mb-2">
                  4. Detalle de tu idea (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Llavero con logo de empresa, Soporte blanco..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/15 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Estimated Price Display & WhatsApp Button */}
              <div className="pt-5 border-t border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Estimación orientativa:</span>
                  <motion.span
                    key={getEstimatedPrice()}
                    initial={{ scale: 1.15, color: '#ff5500' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-2xl font-black font-mono"
                  >
                    ~ ${getEstimatedPrice().toLocaleString('es-AR')}
                  </motion.span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendWhatsAppQuote}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-brand-500 via-orange-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-500/30 border border-white/20 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  <span>Enviar Presupuesto por WhatsApp</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

