/**
 * Motor de Recálculo de Precios y Sanitización de Publicaciones de Mercado Libre
 * 
 * Permite eliminar comisiones de la plataforma (Clásica/Premium), recargos por cuotas/financiación,
 * costo de envío gratis integrado y referencias/marcas de Mercado Libre para adaptar los productos
 * a la tienda propia con precios limpios y tono oficial.
 */

export interface MeliPricingConfig {
  /** % de comisión cobrada por Mercado Libre en publicaciones Clásicas (def: 14%) */
  classicCommissionPercent: number;
  /** % de comisión cobrada por Mercado Libre en publicaciones Premium (def: 29%, incluye financiación cuotas) */
  premiumCommissionPercent: number;
  /** % adicional de recargo por financiación/cuotas a deducir (si no estuviera en la comisión Premium) */
  financingSurchargePercent: number;
  /** Si debe deducirse el costo de envío gratis en publicaciones que lo incluyen */
  deductFreeShipping: boolean;
  /** Monto estimado de costo de envío gratis en $ ARS que fue absorbido en la publicación */
  estimatedFreeShippingCost: number;
  /** % de recargo al comprador o cargos administrativos de plataforma a eliminar */
  buyerSurchargePercent: number;
  /** % de descuento directo adicional opcional configurado por el usuario */
  customDiscountPercent: number;
  /** Si debe sanitizarse el título (eliminar "Envío gratis", "Cuotas", "Mercado Libre", etc.) */
  sanitizeTitle: boolean;
  /** Si debe sanitizarse la descripción al tono de tienda oficial */
  sanitizeDescription: boolean;
}

export const DEFAULT_MELI_PRICING_CONFIG: MeliPricingConfig = {
  classicCommissionPercent: 14,
  premiumCommissionPercent: 29,
  financingSurchargePercent: 0,
  deductFreeShipping: true,
  estimatedFreeShippingCost: 0,
  buyerSurchargePercent: 0,
  customDiscountPercent: 0,
  sanitizeTitle: true,
  sanitizeDescription: true,
};

export interface CleanPriceResult {
  /** Precio final limpio redondeado en números */
  cleanPrice: number;
  /** Precio formateado con símbolo de moneda (ej: "$ 15.400") */
  formattedPrice: string;
  /** Precio original de Mercado Libre */
  originalPrice: number;
  /** Tipo de publicación identificada ('gold_special' | 'gold_pro' | 'gold_premium' | 'free' | 'unknown') */
  listingType: string;
  /** % total de comisión/recargos deducidos */
  totalDeductionPercent: number;
  /** Monto total deducido en $ ARS */
  totalDeductionAmount: number;
  /** Desglose detallado de las deducciones */
  breakdown: {
    commissionDeduction: number;
    financingDeduction: number;
    shippingDeduction: number;
    buyerSurchargeDeduction: number;
    customDiscountDeduction: number;
  };
}

/**
 * Calcula el precio limpio y libre de comisiones/recargos de Mercado Libre
 */
export function calculateCleanPrice(
  mlPrice: number,
  listingTypeId: string = 'gold_special',
  hasFreeShipping: boolean = false,
  customConfig: Partial<MeliPricingConfig> = {}
): CleanPriceResult {
  const config = { ...DEFAULT_MELI_PRICING_CONFIG, ...customConfig };
  const basePrice = Math.max(0, mlPrice || 0);

  // 1. Determinar porcentaje de comisión por tipo de publicación de Mercado Libre
  // 'gold_special' = Clásica (comisión estándar)
  // 'gold_pro' / 'gold_premium' = Premium (incluye costo de cuotas sin interés)
  const isPremium = listingTypeId === 'gold_pro' || listingTypeId === 'gold_premium';
  const commissionPercent = isPremium
    ? config.premiumCommissionPercent
    : listingTypeId === 'free'
    ? 0
    : config.classicCommissionPercent;

  // 2. Calcular deducciones
  let currentPrice = basePrice;

  // A. Deducción de Comisión de ML
  const commissionFactor = Math.max(0, 1 - commissionPercent / 100);
  const priceAfterCommission = basePrice * commissionFactor;
  const commissionDeduction = basePrice - priceAfterCommission;
  currentPrice = priceAfterCommission;

  // B. Deducción de Recargo por Cuotas / Financiación (si aplica por separado)
  let financingDeduction = 0;
  if (config.financingSurchargePercent > 0) {
    const financingFactor = Math.max(0, 1 - config.financingSurchargePercent / 100);
    const priceAfterFinancing = currentPrice * financingFactor;
    financingDeduction = currentPrice - priceAfterFinancing;
    currentPrice = priceAfterFinancing;
  }

  // C. Deducción de Recargo al Comprador / Gastos Administrativos
  let buyerSurchargeDeduction = 0;
  if (config.buyerSurchargePercent > 0) {
    const buyerFactor = Math.max(0, 1 - config.buyerSurchargePercent / 100);
    const priceAfterBuyer = currentPrice * buyerFactor;
    buyerSurchargeDeduction = currentPrice - priceAfterBuyer;
    currentPrice = priceAfterBuyer;
  }

  // D. Deducción de Costo de Envío Gratis Integrado (si el producto incluía envío gratis)
  let shippingDeduction = 0;
  if (hasFreeShipping && config.deductFreeShipping && config.estimatedFreeShippingCost > 0) {
    shippingDeduction = Math.min(currentPrice, config.estimatedFreeShippingCost);
    currentPrice = Math.max(0, currentPrice - shippingDeduction);
  }

  // E. Descuento adicional directo opcional del usuario
  let customDiscountDeduction = 0;
  if (config.customDiscountPercent > 0) {
    const customFactor = Math.max(0, 1 - config.customDiscountPercent / 100);
    const priceAfterCustom = currentPrice * customFactor;
    customDiscountDeduction = currentPrice - priceAfterCustom;
    currentPrice = priceAfterCustom;
  }

  const cleanPrice = Math.round(currentPrice);
  const totalDeductionAmount = basePrice - cleanPrice;
  const totalDeductionPercent = basePrice > 0 ? Math.round((totalDeductionAmount / basePrice) * 100) : 0;
  const formattedPrice = `$ ${cleanPrice.toLocaleString('es-AR')}`;

  return {
    cleanPrice,
    formattedPrice,
    originalPrice: basePrice,
    listingType: isPremium ? 'Premium (Cuotas)' : listingTypeId === 'gold_special' ? 'Clásica' : listingTypeId,
    totalDeductionPercent,
    totalDeductionAmount,
    breakdown: {
      commissionDeduction: Math.round(commissionDeduction),
      financingDeduction: Math.round(financingDeduction),
      shippingDeduction: Math.round(shippingDeduction),
      buyerSurchargeDeduction: Math.round(buyerSurchargeDeduction),
      customDiscountDeduction: Math.round(customDiscountDeduction),
    },
  };
}

/**
 * Palabras clave y expresiones asociadas a Mercado Libre que deben ser eliminadas
 */
const FORBIDDEN_MELI_TERMS = [
  /mercado\s*libre/gi,
  /mercadolibre/gi,
  /\bml\b/gi,
  /mercado\s*líder/gi,
  /mercadolíder/gi,
  /mercado\s*lider/gi,
  /mercadolider/gi,
  /mercado\s*envíos/gi,
  /mercadoenvíos/gi,
  /mercado\s*envios/gi,
  /mercadoenvios/gi,
  /envío\s*flex/gi,
  /envio\s*flex/gi,
  /mercado\s*pago/gi,
  /mercadopago/gi,
  /mercado\s*puntos/gi,
  /mercadopuntos/gi,
  /cuotas?\s*sin\s*interés/gi,
  /cuotas?\s*sin\s*interes/gi,
  /\b[0-9]{1,2}\s*cuotas\s*sin\s*interés\b/gi,
  /\b[0-9]{1,2}\s*cuotas\s*sin\s*interes\b/gi,
  /envío\s*gratis/gi,
  /envio\s*gratis/gi,
  /envío\s*gratis\s*a\s*todo\s*el\s*país/gi,
  /envio\s*gratis\s*a\s*todo\s*el\s*pais/gi,
  /oferta\s*por\s*tiempo\s*limitado/gi,
  /promoción\s*exclusiva\s*(en\s*ml|mercado\s*libre)?/gi,
  /despachamos\s*por\s*mercado\s*envíos/gi,
  /hacemos\s*envíos\s*por\s*mercado\s*envíos/gi,
  /aceptamos\s*mercado\s*pago/gi,
  /revisá\s*nuestra\s*reputación/gi,
  /100%\s*de\s*calificaciones\s*positivas/gi,
  /consul(tar|te)\s*stock\s*antes\s*de\s*(ofertar|comprar)/gi,
  /haz\s*clic\s*en\s*comprar/gi,
  /hacé\s*clic\s*en\s*comprar/gi,
  /hacer\s*todas\s*las\s*preguntas\s*antes\s*de\s*ofertar/gi,
];

/**
 * Sanitiza el título de un producto eliminando menciones a ML, envíos gratis, cuotas, etc.
 */
export function sanitizeMeliTitle(rawTitle: string): string {
  if (!rawTitle) return '';

  let clean = rawTitle;

  // Aplicar patrones de términos prohibidos
  FORBIDDEN_MELI_TERMS.forEach((regex) => {
    clean = clean.replace(regex, '');
  });

  // Limpiar caracteres sobrantes como guiones sueltos, comas finales, espacios múltiples
  clean = clean
    .replace(/[-–—|/]\s*$/g, '')
    .replace(/^\s*[-–—|/]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Capitalizar adecuadamente la primera letra
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean || rawTitle;
}

/**
 * Sanitiza la descripción de una publicación de Mercado Libre:
 * - Elimina términos y disclaimers de la plataforma
 * - Modifica el tono para que parezca una tienda oficial propia
 * - Preserva intactas las especificaciones técnicas, dimensiones, materiales y variantes
 */
export function sanitizeMeliDescription(rawDescription: string, productTitle?: string): string {
  if (!rawDescription || rawDescription.trim().length === 0) {
    return `Producto oficial de diseño e impresión 3D${productTitle ? ` - ${productTitle}` : ''}. Fabricado con materiales de alta calidad y precisión profesional.`;
  }

  let text = rawDescription;

  // 1. Reemplazar URLs de ML o MP
  text = text.replace(/https?:\/\/[^\s]*(mercadolibre|mercadopago)[^\s]*/gi, '');

  // 2. Eliminar líneas completas que sean exclusivas de políticas o despachos de ML
  const lines = text.split(/\r?\n/);
  const cleanLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true; // conservar saltos de línea para estructura

    // Si la línea contiene solo avisos de ML/Envíos/Calificaciones, se descarta
    const isMeliDisclaimerLine = FORBIDDEN_MELI_TERMS.some((regex) => {
      // Si el match abarca casi toda la línea o es un disclaimer directo
      const match = trimmed.match(regex);
      return match && (trimmed.length < 50 || /despachamos|reputación|calificaciones|ofertar|envíos por|aceptamos/i.test(trimmed));
    });

    return !isMeliDisclaimerLine;
  });

  text = cleanLines.join('\n');

  // 3. Aplicar limpieza fina de términos prohibidos en el cuerpo restante
  FORBIDDEN_MELI_TERMS.forEach((regex) => {
    text = text.replace(regex, '');
  });

  // 4. Limpieza de espacios múltiples y líneas vacías excesivas
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // 5. Agregar encabezado oficial si el texto no tiene un encabezado estructurado
  const hasOfficialIntro = /bienvenido|tienda oficial|trio\s*3d|características/i.test(text);

  if (!hasOfficialIntro && productTitle) {
    text = `✨ ${productTitle.toUpperCase()} - TIENDA OFICIAL 3D ✨\n\n${text}`;
  }

  return text;
}
