'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WhatsAppFloat: React.FC = () => {
  const [tooltipVisible, setTooltipVisible] = useState(true);

  const handleClick = () => {
    const message = encodeURIComponent('¡Hola Trío 3D! Quisiera hacer una consulta o solicitar un presupuesto de impresión 3D.');
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Tooltip Popup */}
      <AnimatePresence>
        {tooltipVisible && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative apple-glass text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>¡Hola! Cotizá tu idea por WhatsApp</span>
            <button
              onClick={() => setTooltipVisible(false)}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="pointer-events-auto relative p-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl shadow-emerald-500/40 border border-white/20 flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white/20 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-black rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-black rounded-full" />
      </motion.button>
    </div>
  );
};

