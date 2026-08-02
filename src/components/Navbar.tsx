'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, MessageCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onOpenAdmin?: () => void;
  onOpenCart?: () => void;
  cartItemCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  onOpenCart,
  cartItemCount = 0,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Categorías', href: '#categorias' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Cómo Comprar', href: '#pasos' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('¡Hola Trío 3D! Quisiera consultar por un presupuesto de impresión 3D.');
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-black/75 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/80'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Official Transparent Logo */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-11 h-11 flex items-center justify-center"
          >
            <Image
              src="/images/logo.png"
              alt="Trío 3D Logo Oficial"
              width={48}
              height={48}
              className="object-contain drop-shadow-xl"
              priority
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white flex items-center gap-1">
              TRÍO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 orange-glow-text">3D</span>
            </span>
            <span className="text-[9px] tracking-widest text-neutral-400 font-mono -mt-1 uppercase">
              Print Studio
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Shopping Cart Button */}
          {onOpenCart && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center justify-center"
              title="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-lg animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </motion.button>
          )}

          {onOpenAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAdmin}
              className="text-xs font-bold text-neutral-300 hover:text-white px-3.5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
              title="Panel para agregar productos sin código"
            >
              <span>⚙️ Panel Admin</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsAppClick}
            className="relative group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-pink-500/25 border border-white/20"
          >
            <MessageCircle className="w-4 h-4 fill-white/20 group-hover:rotate-12 transition-transform duration-300" />
            <span>Presupuesto Rápido</span>
          </motion.button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-neutral-300 hover:text-white bg-white/5 border border-white/10 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-neutral-950/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 flex flex-col gap-2 overflow-hidden"
          >
            {navLinks.map((link, idx) => (
              <motion.a
                key={link.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-neutral-200 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-white/10 hover:text-brand-500 transition-all flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="text-xs text-neutral-500">→</span>
              </motion.a>
            ))}
            {onOpenCart && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="w-full flex items-center justify-between bg-brand-500/20 text-brand-400 font-bold py-3 px-4 rounded-xl border border-brand-500/30 text-sm"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Ver Carrito de Compras</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </motion.button>
            )}

            {onOpenAdmin && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-bold py-3 rounded-xl border border-white/15 text-sm"
              >
                <span>⚙️ Abrir Panel Admin (Sin Código)</span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMobileMenuOpen(false);
                handleWhatsAppClick();
              }}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Presupuesto por WhatsApp</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

