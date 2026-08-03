'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Check, ShoppingBag, MessageCircle, Maximize2, Layers, Clock, Scale } from 'lucide-react';
import { Product } from '@/data/products';
import { formatPrice } from '@/utils/formatPrice';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number, selectedMaterial?: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');

  if (!product) return null;

  const currentMaterial = selectedMaterial || product.materials[0];

  const handleSendWhatsApp = () => {
    let msg = `¡Hola Trío 3D! Quisiera consultar/encargar el producto: *${product.name}*.\n`;
    msg += `• Categoría: ${product.category}\n`;
    msg += `• Material elegido: ${currentMaterial}\n`;
    if (customColor) msg += `• Color preferido: ${customColor}\n`;
    if (customNotes) msg += `• Notas/Personalización: ${customNotes}\n`;
    msg += `¿Podrían indicarme precio final y tiempo estimado? ¡Gracias!`;

    window.open(`https://wa.me/5493434381991?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddToCartModal = () => {
    if (onAddToCart && product) {
      onAddToCart(product, 1, currentMaterial);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-brand-500 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-neutral-950 min-h-[280px] md:min-h-[420px] flex items-center justify-center p-6">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:hidden" />
          
          <div className="absolute bottom-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-brand-500/90 text-white text-xs font-bold shadow-md">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Right: Product Details & Customization */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Category, Weight & Dimensions Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                {product.category}
              </span>
              <span className="text-xs text-amber-300 font-mono font-semibold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                <Scale className="w-3 h-3 text-amber-400" />
                Peso: {product.peso && product.peso < 5 ? product.peso * 1000 : (product.peso || 200)} g
              </span>
              {product.dimensions && (
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" />
                  {product.dimensions}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl font-extrabold text-white leading-snug">
              {product.name}
            </h3>
            <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
              {product.description}
            </p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Material Selector */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Layers className="w-4 h-4 text-brand-500" />
                Seleccionar Material:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((mat) => {
                  const active = currentMaterial === mat;
                  return (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Custom Notes */}
            <div className="mt-4 space-y-2">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Color o acabado preferido:</label>
                <input
                  type="text"
                  placeholder="Ej: Naranja sedoso, Negro mate, Bicolor..."
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Nombre / Texto a grabar (opcional):</label>
                <input
                  type="text"
                  placeholder="Ej: Nombre 'Lucas' o dimensiones especiales"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons & Production Time Clarification */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-3">
            {/* Fixed Production Time Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Tiempo de producción: 24 a 72 horas, según el producto.</span>
            </div>

            {onAddToCart && (
              <button
                onClick={handleAddToCartModal}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Agregar al Carrito de Compras</span>
              </button>
            )}

            <button
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-neutral-200 border border-white/15 font-bold py-3 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedir por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

