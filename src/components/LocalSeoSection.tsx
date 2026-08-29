'use client';

import React from 'react';
import { MapPin, Truck, Wrench, Cpu, Compass, Layers, CheckCircle2, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const LocalSeoSection: React.FC = () => {
  const handleWhatsAppLocalClick = (topic?: string) => {
    const topicText = topic ? ` sobre ${topic}` : '';
    const message = encodeURIComponent(`¡Hola Trío 3D! Soy de la zona (Paraná / Entre Ríos) y quisiera hacer una consulta técnica${topicText}.`);
    window.open(`https://wa.me/5493434381991?text=${message}`, '_blank');
  };

  const localCities = [
    { name: 'Paraná (Centro & Barrios)', desc: 'Retiro en Coronel Uzin 1216 o cadetería a domicilio', badge: 'Retiro Inmediato' },
    { name: 'Oro Verde & San Benito', desc: 'Entregas coordinadas en Gran Paraná', badge: '24-48 hs' },
    { name: 'Colonia Avellaneda & Crespo', desc: 'Envíos diarios directos por comisionista o correo', badge: 'Frecuencia Diaria' },
    { name: 'Santa Fe Capital', desc: 'Despachos express por túnel subfluvial', badge: 'Envío Express' },
    { name: 'Concordia & Gualeguaychú', desc: 'Despacho asegurado a todo el interior de Entre Ríos', badge: 'Toda la Provincia' },
  ];

  const localServices = [
    {
      icon: Wrench,
      title: 'Repuestos Técnicos & Piezas Discontinuadas',
      desc: 'Reemplazamos engranajes, bujes, soportes, perillas y carcasas rotas de electrodomésticos, vehículos o maquinarias que ya no se consiguen en el mercado.',
      tag: 'Diseño a Medida',
    },
    {
      icon: Cpu,
      title: 'Prototipado Rápido Industrial',
      desc: 'Validá tus inventos o proyectos de ingeniería y arquitectura antes de matricular. Imprimimos modelos funcionales en PETG o Resina de alta resistencia.',
      tag: 'Empresas & PyMEs',
    },
    {
      icon: Compass,
      title: 'Diseño CAD 3D desde Cero',
      desc: '¿Tenés una idea en papel o una pieza rota? Medimos con calibre digital, modelamos en 3D CAD y te entregamos la pieza terminada y probada.',
      tag: 'Asesoramiento Técnico',
    },
    {
      icon: Layers,
      title: 'Tandas Mayoristas & Merchandising',
      desc: 'Llaveros institucionales, trofeos, mates personalizados y regalos empresariales en Paraná con importantes descuentos por volumen.',
      tag: 'Venta Mayorista',
    },
  ];

  return (
    <section id="cobertura-local" className="py-24 bg-gradient-to-b from-dark-bg via-neutral-950 to-dark-bg relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
            <MapPin className="w-4 h-4 text-brand-500" />
            Servicio Local en Paraná y Entre Ríos
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Líderes en Impresión 3D y <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">Prototipado Local</span>
          </h2>
          <p className="mt-4 text-neutral-300 text-base sm:text-lg font-light leading-relaxed">
            Brindamos soluciones integrales de fabricación aditiva para particulares, talleres, profesionales e industrias de <strong className="text-white font-semibold">Paraná, Santa Fe y toda la provincia de Entre Ríos</strong>.
          </p>
        </motion.div>

        {/* 4 Specialized Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {localServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="apple-card p-8 rounded-3xl border border-white/10 hover:border-brand-500/40 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 text-brand-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                      {srv.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-300 font-light leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Garantía de encaje y calidad
                  </span>
                  <button
                    onClick={() => handleWhatsAppLocalClick(srv.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <span>Cotizar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Coverage & Location Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="apple-glass rounded-3xl p-8 sm:p-10 border border-purple-500/30 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Punto de Retiro & Envíos</span>
                  <h3 className="text-2xl font-bold text-white">Retirá en Paraná o recibilo en tu puerta</h3>
                </div>
              </div>
              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-6">
                Contamos con punto de retiro presencial en <strong className="text-white font-semibold">Coronel Uzin 1216 (Paraná)</strong> y envíos programados con embalaje reforzado anti-impacto a Santa Fe y todos los municipios de Entre Ríos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {localCities.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {c.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-light mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Action Box */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center text-center p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-dark-bg to-brand-950/40 border border-white/15">
              <MapPin className="w-10 h-10 text-brand-400 mb-3 animate-bounce" />
              <h4 className="text-lg font-bold text-white">¿Tenés una pieza rota o un proyecto en mente?</h4>
              <p className="text-xs text-neutral-400 font-light mt-2 max-w-xs">
                Mandanos foto, medidas o archivo por WhatsApp y te asesoramos en el acto.
              </p>
              <button
                onClick={() => handleWhatsAppLocalClick('Asesoramiento Local Paraná')}
                className="mt-6 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Consultar por WhatsApp ahora</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
