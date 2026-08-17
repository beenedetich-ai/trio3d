'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, Instagram, Facebook, ArrowUp, MapPin, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/10 text-neutral-400 text-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Trío 3D Logo Oficial"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-wider text-white">
                  TRÍO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">3D</span>
                </span>
                <span className="text-[10px] tracking-widest text-neutral-400 font-mono -mt-1 uppercase">
                  PRINT STUDIO
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Estudio de impresión 3D personalizado. Transformamos tus bocetos, imágenes e ideas en objetos reales con la mayor precisión del mercado.
            </p>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/trio3d.parana?igsh=aWRobnNkODE4ZXh5"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-brand-500 hover:border-brand-500 transition-all duration-300 shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-brand-500 hover:border-brand-500 transition-all duration-300 shadow-md"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

              <a
                href="https://wa.me/5493434381991?text=¡Hola%20Tr%C3%ADo%203D!"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-brand-500 hover:border-brand-500 transition-all duration-300 shadow-md"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-2 border-brand-500 pl-3">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#inicio" className="hover:text-brand-500 transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#categorias" className="hover:text-brand-500 transition-colors">Categorías de Impresión</a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-brand-500 transition-colors">Galería de Productos</a>
              </li>
              <li>
                <a href="#pasos" className="hover:text-brand-500 transition-colors">¿Cómo comprar?</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-500 transition-colors">Preguntas Frecuentes</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-2 border-brand-500 pl-3">
              Rubros Principales
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-neutral-400">Llaveros Personalizados & Corp</li>
              <li className="text-neutral-400">Decoración Paramétrica & Espirales</li>
              <li className="text-neutral-400">Soportes Gamer & Escritorio</li>
              <li className="text-neutral-400">Macetas Voronoi & Autorregantes</li>
              <li className="text-neutral-400">Litofanías & Regalos con Foto</li>
              <li className="text-neutral-400">Figuras & Miniaturas Detalladas</li>
              <li className="text-neutral-400">Diseño a Medida & Proyectos Especiales</li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-2 border-brand-500 pl-3">
              Contacto & Atención
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5 text-neutral-300">
                <MessageCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>+54 9 343 438-1991</span>
              </li>
              <li className="flex items-center gap-2.5 text-neutral-300">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>contacto@trio3d.com</span>
              </li>
              <li className="flex items-center gap-2.5 text-neutral-300">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Coronel Uzin 1216, Paraná, Entre Ríos</span>
              </li>
              <li className="flex items-center gap-2.5 text-neutral-300">
                <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Lun a Sáb: 9:00 - 20:00 hs</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Trío 3D. Todos los derechos reservados. Impresión 3D de alta definición.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-neutral-400 hover:text-brand-500 transition-colors p-2 rounded-lg bg-neutral-900 border border-white/5"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
