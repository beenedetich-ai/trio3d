'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, MessageCircle, Truck, Calculator, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '@/hooks/useCartStore';
import { EnviopackQuoteOption } from '@/services/enviopackService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedMaterial?: string) => void;
  onRemoveItem: (productId: string, selectedMaterial?: string) => void;
  onClearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  getTotalPrice,
  getTotalItems,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [deliveryMethod, setDeliveryMethod] = useState<'envio' | 'retiro'>('envio');
  const [shippingOptions, setShippingOptions] = useState<EnviopackQuoteOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<EnviopackQuoteOption | null>(null);
  
  const [isQuoting, setIsQuoting] = useState(false);
  const [isProcessingMP, setIsProcessingMP] = useState(false);
  
  const [generatedLabelUrl, setGeneratedLabelUrl] = useState<string | null>(null);
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);

  const subtotalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shippingCost = deliveryMethod === 'envio' && selectedShipping ? selectedShipping.costo : 0;
  const finalTotal = subtotalPrice + shippingCost;

  const calculatePackageSpecs = () => {
    let totalWeightGrams = 0;
    let totalAlto = 0;
    let maxAncho = 10;
    let maxLargo = 10;

    cart.forEach((item) => {
      // Get weight in grams (if legacy decimal < 5, convert to grams)
      let wGrams = typeof item.product.peso === 'number' && item.product.peso > 0 ? item.product.peso : 200;
      if (wGrams < 5) wGrams = Math.round(wGrams * 1000);

      const h = typeof item.product.alto === 'number' && item.product.alto > 0 ? item.product.alto : 10;
      const anc = typeof item.product.ancho === 'number' && item.product.ancho > 0 ? item.product.ancho : 10;
      const lar = typeof item.product.largo === 'number' && item.product.largo > 0 ? item.product.largo : 10;

      totalWeightGrams += wGrams * item.quantity;
      totalAlto += h * Math.min(item.quantity, 3);
      if (anc > maxAncho) maxAncho = anc;
      if (lar > maxLargo) maxLargo = lar;
    });

    // Convert grams to kg for Envíopack API with a minimum 0.1 kg floor
    const calculatedKg = Math.round((totalWeightGrams / 1000) * 100) / 100;
    const finalWeightKg = Math.max(0.1, calculatedKg);

    return {
      weightGrams: totalWeightGrams,
      weightKg: finalWeightKg,
      alto: Math.max(10, Math.round(totalAlto)),
      ancho: Math.max(10, Math.round(maxAncho)),
      largo: Math.max(10, Math.round(maxLargo)),
    };
  };

  const packageSpecs = calculatePackageSpecs();

  // Real-time Envíopack Quote handler
  const handleQuoteEnviopack = async () => {
    if (!postalCode || postalCode.trim().length < 4) {
      alert('Por favor ingresa un Código Postal válido (ej: 3100 o 1414).');
      return;
    }

    setIsQuoting(true);
    try {
      const res = await fetch('/api/enviopack/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: postalCode.trim(),
          weightGrams: packageSpecs.weightGrams,
          weightKg: packageSpecs.weightKg,
          alto: packageSpecs.alto,
          ancho: packageSpecs.ancho,
          largo: packageSpecs.largo,
          valorDeclarado: subtotalPrice > 0 ? subtotalPrice : 5000,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.options) && data.options.length > 0) {
        setShippingOptions(data.options);
        setSelectedShipping(data.options[0]); // Select first option by default
      }
    } catch (err) {
      console.error('Error enviopack quote:', err);
    } finally {
      setIsQuoting(false);
    }
  };

  // Create Envíopack Shipment & Get Label PDF
  const processEnviopackOrder = async () => {
    try {
      const res = await fetch('/api/enviopack/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderPayload: {
            customerName: customerName || 'Cliente Web',
            customerPhone: customerPhone || '3434381991',
            customerAddress: customerAddress || 'A coordinar',
            customerCP: postalCode || '3100',
            items: cart.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
            shippingOption: selectedShipping || {
              id: 'ep-standard',
              correo: 'Envíopack Express',
              servicio: 'Envío a Domicilio',
              tipo: 'domicilio',
              costo: shippingCost,
              plazoDias: '2 a 4 días',
            },
            totalPrice: finalTotal,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedLabelUrl(data.labelUrl);
        setGeneratedOrderId(data.orderId);
      }
    } catch (err) {
      console.error('Error generating Envíopack order label:', err);
    }
  };

  // WhatsApp Checkout with Envíopack shipping detail
  const handleWhatsAppCheckout = async () => {
    if (cart.length === 0) return;

    await processEnviopackOrder();

    let message = `¡Hola Trío 3D! Quisiera confirmar el siguiente pedido de la web:\n\n`;
    message += `🛒 *RESUMEN DEL PEDIDO (${totalItems} ítems):*\n`;

    cart.forEach((item, idx) => {
      message += `${idx + 1}. *${item.product.name}* (x${item.quantity}) - Mat: ${item.selectedMaterial} - ${item.product.price}\n`;
    });

    message += `\n📦 *ENVÍOPACK:* ${deliveryMethod === 'envio' && selectedShipping ? `${selectedShipping.correo} (${selectedShipping.servicio}) - $${selectedShipping.costo.toLocaleString('es-AR')}` : 'Retiro en Taller'}\n`;
    message += `💰 *TOTAL FINAL: $${finalTotal.toLocaleString('es-AR')} ARS*\n\n`;

    if (customerName) message += `👤 *Cliente:* ${customerName}\n`;
    if (customerPhone) message += `📞 *Teléfono:* ${customerPhone}\n`;
    if (postalCode) message += `📮 *Código Postal:* ${postalCode}\n`;
    if (customerAddress) message += `📍 *Dirección:* ${customerAddress}\n\n`;
    message += `💳 Quisiera solicitar los datos de Mercado Pago (Alias/CBU) y la oblea de envío.`;

    window.open(`https://wa.me/5493434381991?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Mercado Pago Checkout with Envíopack
  const handleMercadoPagoCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessingMP(true);
    await processEnviopackOrder();

    setTimeout(() => {
      setIsProcessingMP(false);

      const mpMessage = `¡Hola Trío 3D! Inicié un pago con *Mercado Pago* por un total de *$${finalTotal.toLocaleString('es-AR')} ARS* (Incluye envío Envíopack).\n\n` +
        `🛒 Ítems: ${cart.map(i => `${i.product.name} x${i.quantity}`).join(', ')}\n` +
        `📦 Envío: ${selectedShipping ? `${selectedShipping.correo} - $${selectedShipping.costo}` : 'Retiro'}\n` +
        `👤 Nombre: ${customerName || 'Cliente Web'} (CP: ${postalCode || '3100'})\n\n` +
        `¿Me generan el link de preferencia de Mercado Pago y la oblea de envío?`;

      window.open(`https://wa.me/5493434381991?text=${encodeURIComponent(mpMessage)}`, '_blank');
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Drawer */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen max-w-md bg-neutral-950 border-l border-white/15 shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Carrito de Compras</h3>
                  <p className="text-xs text-neutral-400 font-light">{totalItems} productos seleccionados</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body - List of Items */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 scrollbar-none">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-neutral-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Tu carrito está vacío</h4>
                  <p className="text-xs text-neutral-400 mt-2 font-light max-w-xs mx-auto">
                    Explorá el catálogo de impresiones 3D y agregá tus favoritos para cotizar y comprar.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-pink-500/30"
                  >
                    Ver Catálogo de Productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-xs text-neutral-400 font-semibold">Productos agregados</span>
                    <button
                      onClick={onClearCart}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Vaciar
                    </button>
                  </div>

                  {cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedMaterial}-${idx}`}
                      className="apple-card p-4 rounded-2xl flex gap-4 items-center"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                        <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md font-mono border border-pink-500/20 inline-block mt-0.5">
                          Mat: {item.selectedMaterial}
                        </span>
                        <p className="text-xs font-extrabold text-amber-400 mt-1">{item.product.price}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedMaterial)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedMaterial)
                            }
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedMaterial)
                            }
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Customer Information & Envíopack Shipping Calculator */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-amber-400" />
                        <span>Cotización de Envío Envíopack</span>
                      </h5>
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono font-bold">
                        {packageSpecs.weightGrams}g ({packageSpecs.weightKg}kg) | {packageSpecs.alto}x{packageSpecs.ancho}x{packageSpecs.largo} cm
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('envio')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          deliveryMethod === 'envio'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                            : 'bg-white/5 text-neutral-400 border-white/10'
                        }`}
                      >
                        <span>🚚 Envío Envíopack</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMethod('retiro');
                          setSelectedShipping(null);
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                          deliveryMethod === 'retiro'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/5 text-neutral-400 border-white/10'
                        }`}
                      >
                        <span>🏬 Retiro en Taller (Paraná)</span>
                      </button>
                    </div>

                    {deliveryMethod === 'envio' && (
                      <div className="space-y-2.5 pt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Código Postal (ej: 3100 / 1414)"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
                          />
                          <button
                            type="button"
                            onClick={handleQuoteEnviopack}
                            disabled={isQuoting}
                            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-pink-500/20"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>{isQuoting ? '...' : 'Cotizar'}</span>
                          </button>
                        </div>

                        {/* Real-time Envíopack Shipping Options List */}
                        {shippingOptions.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="text-[11px] text-neutral-400 font-semibold block">
                              Empresas disponibles (Origen: Paraná 3100):
                            </span>
                            {shippingOptions.map((opt) => {
                              const isSelected = selectedShipping?.id === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedShipping(opt)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-pink-500/15 border-pink-500/50 text-white'
                                      : 'bg-white/[0.02] border-white/10 text-neutral-300 hover:border-white/20'
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold flex items-center gap-1.5 text-white">
                                      <span className="text-pink-400">{opt.correo}</span>
                                      <span className="text-[10px] text-neutral-400">({opt.servicio})</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                                      ⏱️ Plazo: {opt.plazoDias}
                                    </span>
                                  </div>

                                  <span className="font-mono font-extrabold text-amber-400 text-sm">
                                    ${opt.costo.toLocaleString('es-AR')}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer Inputs */}
                    <div className="space-y-2 pt-2">
                      <input
                        type="text"
                        placeholder="Nombre y Apellido del Destinatario"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
                      />
                      <input
                        type="text"
                        placeholder="Dirección de Entrega (Calle, Altura, Piso)"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer / Checkout Actions */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-neutral-900/60 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400 font-light">
                    <span>Subtotal ({totalItems} productos):</span>
                    <span className="font-mono text-white font-semibold">${subtotalPrice.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 font-light">
                    <span>Envío Envíopack:</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {deliveryMethod === 'retiro'
                        ? 'Gratis (Retiro Taller)'
                        : selectedShipping
                        ? `$${selectedShipping.costo.toLocaleString('es-AR')}`
                        : 'Ingresá tu CP para cotizar'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                    <span>Total Final:</span>
                    <span className="font-mono text-amber-400 text-lg">${finalTotal.toLocaleString('es-AR')} ARS</span>
                  </div>
                </div>

                {/* Generated Oblea PDF Action Banner */}
                {generatedLabelUrl && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Orden Envíopack Creada</span>
                    </div>
                    <a
                      href={generatedLabelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md hover:bg-emerald-600 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Oblea PDF</span>
                    </a>
                  </div>
                )}

                {/* Checkout Buttons */}
                <div className="space-y-2.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMercadoPagoCheckout}
                    disabled={isProcessingMP}
                    className="w-full flex items-center justify-center gap-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-sky-500/25 border border-white/20 transition-all text-xs sm:text-sm"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{isProcessingMP ? 'Generando Pedido Mercado Pago...' : 'Pagar con Mercado Pago'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppCheckout}
                    className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 border border-white/20 transition-all text-xs sm:text-sm"
                  >
                    <MessageCircle className="w-5 h-5 fill-white/20" />
                    <span>Confirmar Pedido por WhatsApp</span>
                  </motion.button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-light">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Envíos Seguros a Todo el País con Envíopack</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
