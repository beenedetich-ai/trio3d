/**
 * Motor de Recálculo de Precios, Sanitización y Consolidación de Publicaciones de Mercado Libre
 * 
 * Permite eliminar comisiones de la plataforma (Clásica/Premium), recargos por cuotas/financiación,
 * costo de envío gratis integrado y referencias/marcas de Mercado Libre para adaptar los productos
 * a la tienda propia con precios limpios y tono oficial.
 */

import { MeliPublicationItem } from '@/services/mercadoLibreService';
import { Product, ProductVariant } from '@/data/products';

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
  /** Si debe agrupar/consolidar publicaciones duplicadas en variantes */
  groupDuplicates: boolean;
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
  groupDuplicates: true,
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

export interface LogisticData {
  peso: number; // en gramos
  alto: number; // en cm
  ancho: number; // en cm
  largo: number; // en cm
  requiresManualDimensions: boolean;
  formattedDimensions: string;
}

export interface ConsolidatedMeliProduct {
  /** ID representativo único (ej: ID de la publicación principal) */
  id: string;
  /** Título sanitizado representativo */
  title: string;
  /** Categoría de Mercado Libre */
  category_name: string;
  /** Categoría ID */
  category_id: string;
  /** Precio base más bajo encontrado entre el grupo de publicaciones */
  lowestBasePrice: number;
  /** Publicación base de menor costo */
  lowestPriceItem: MeliPublicationItem;
  /** Resultado del cálculo de precio neto limpio sobre la publicación de menor costo */
  cleanPriceResult: CleanPriceResult;
  /** Colección de todas las fotos de las publicaciones del grupo sin duplicados */
  pictures: Array<{ url: string }>;
  /** Lista de publicaciones agrupadas */
  groupedItems: MeliPublicationItem[];
  /** IDs de las publicaciones de ML consolidadas */
  meli_ids: string[];
  /** Variantes generadas a partir de las diferencias entre las publicaciones */
  variants: ProductVariant[];
  /** Descripción consolidada sanitizada */
  description: string;
  /** Permalink a la publicación base de ML */
  permalink?: string;
  /** Indizador que indica si el producto ya existe publicado en la tienda web */
  isAlreadyPublished?: boolean;
  /** Producto correspondiente en el catálogo de la tienda web si ya fue publicado */
  existingStoreProduct?: Product | null;
  /** Datos logísticos extraídos (peso en g, dimensiones en cm, etiqueta de manual) */
  logisticData: LogisticData;
}

/**
 * Extrae y estandariza peso (en gramos) y dimensiones (en centímetros)
 * a partir de la información logística de Mercado Libre (shipping.dimensions, attributes o descripción/título).
 */
export function extractLogisticDimensions(
  inputItem: MeliPublicationItem | MeliPublicationItem[]
): LogisticData {
  const items = Array.isArray(inputItem) ? inputItem : [inputItem];

  let foundAlto: number | null = null;
  let foundAncho: number | null = null;
  let foundLargo: number | null = null;
  let foundPeso: number | null = null;

  for (const item of items) {
    // 1. Parsear shipping.dimensions (formato nativo de ML: "ALTOxANCHOxLARGO,PESO_GRAMOS")
    if (item.shipping && item.shipping.dimensions) {
      const dimStr = item.shipping.dimensions.trim();
      const match = dimStr.match(/^(\d+(?:[\.,]\d+)?)\s*x\s*(\d+(?:[\.,]\d+)?)\s*x\s*(\d+(?:[\.,]\d+)?)(?:,\s*(\d+(?:[\.,]\d+)?))?$/i);
      if (match) {
        if (foundAlto === null) foundAlto = parseFloat(match[1].replace(',', '.'));
        if (foundAncho === null) foundAncho = parseFloat(match[2].replace(',', '.'));
        if (foundLargo === null) foundLargo = parseFloat(match[3].replace(',', '.'));
        if (foundPeso === null && match[4]) foundPeso = parseFloat(match[4].replace(',', '.'));
      }
    }

    // 2. Parsear ficha técnica / atributos de Mercado Libre
    if (item.attributes && Array.isArray(item.attributes)) {
      item.attributes.forEach((attr) => {
        const id = (attr.id || '').toUpperCase();
        const valName = attr.value_name || '';
        const numVal = attr.value_struct?.number;
        const unit = (attr.value_struct?.unit || '').toLowerCase();

        // Extraer Alto
        if (['PACKAGE_HEIGHT', 'HEIGHT', 'ALTO'].includes(id) || /alto/i.test(attr.name || '')) {
          if (foundAlto === null) {
            if (numVal !== undefined && numVal > 0) {
              foundAlto = unit === 'mm' ? numVal / 10 : unit === 'm' ? numVal * 100 : numVal;
            } else {
              const m = valName.match(/(\d+(?:[\.,]\d+)?)\s*(cm|mm|m)?/i);
              if (m) {
                const n = parseFloat(m[1].replace(',', '.'));
                const u = (m[2] || 'cm').toLowerCase();
                foundAlto = u === 'mm' ? n / 10 : u === 'm' ? n * 100 : n;
              }
            }
          }
        }

        // Extraer Ancho
        if (['PACKAGE_WIDTH', 'WIDTH', 'ANCHO'].includes(id) || /ancho/i.test(attr.name || '')) {
          if (foundAncho === null) {
            if (numVal !== undefined && numVal > 0) {
              foundAncho = unit === 'mm' ? numVal / 10 : unit === 'm' ? numVal * 100 : numVal;
            } else {
              const m = valName.match(/(\d+(?:[\.,]\d+)?)\s*(cm|mm|m)?/i);
              if (m) {
                const n = parseFloat(m[1].replace(',', '.'));
                const u = (m[2] || 'cm').toLowerCase();
                foundAncho = u === 'mm' ? n / 10 : u === 'm' ? n * 100 : n;
              }
            }
          }
        }

        // Extraer Largo / Profundidad
        if (['PACKAGE_LENGTH', 'LENGTH', 'LARGO', 'PROFUNDIDAD'].includes(id) || /largo|profundidad/i.test(attr.name || '')) {
          if (foundLargo === null) {
            if (numVal !== undefined && numVal > 0) {
              foundLargo = unit === 'mm' ? numVal / 10 : unit === 'm' ? numVal * 100 : numVal;
            } else {
              const m = valName.match(/(\d+(?:[\.,]\d+)?)\s*(cm|mm|m)?/i);
              if (m) {
                const n = parseFloat(m[1].replace(',', '.'));
                const u = (m[2] || 'cm').toLowerCase();
                foundLargo = u === 'mm' ? n / 10 : u === 'm' ? n * 100 : n;
              }
            }
          }
        }

        // Extraer Peso
        if (['PACKAGE_WEIGHT', 'WEIGHT', 'PESO'].includes(id) || /peso/i.test(attr.name || '')) {
          if (foundPeso === null) {
            if (numVal !== undefined && numVal > 0) {
              foundPeso = unit === 'kg' ? numVal * 1000 : numVal;
            } else {
              const m = valName.match(/(\d+(?:[\.,]\d+)?)\s*(g|kg|gr|gramos|kilos)?/i);
              if (m) {
                const n = parseFloat(m[1].replace(',', '.'));
                const u = (m[2] || 'g').toLowerCase();
                foundPeso = u === 'kg' || u === 'kilos' ? n * 1000 : n;
              }
            }
          }
        }
      });
    }

    // 3. Parsear texto de descripción o título mediante Expresiones Regulares
    const fullText = `${item.title || ''} ${item.description || ''}`;

    if (foundAlto === null || foundAncho === null || foundLargo === null) {
      const dimRegex = /(\d+(?:[\.,]\d+)?)\s*(cm|mm|m)?\s*x\s*(\d+(?:[\.,]\d+)?)\s*(cm|mm|m)?\s*x\s*(\d+(?:[\.,]\d+)?)\s*(cm|mm|m)?/i;
      const dimMatch = fullText.match(dimRegex);
      if (dimMatch) {
        const uDefault = dimMatch[6] || dimMatch[4] || dimMatch[2] || 'cm';
        const parseUnit = (valStr: string, uStr: string) => {
          const n = parseFloat(valStr.replace(',', '.'));
          const u = uStr.toLowerCase();
          return u === 'mm' ? n / 10 : u === 'm' ? n * 100 : n;
        };
        if (foundAlto === null) foundAlto = parseUnit(dimMatch[1], dimMatch[2] || uDefault);
        if (foundAncho === null) foundAncho = parseUnit(dimMatch[3], dimMatch[4] || uDefault);
        if (foundLargo === null) foundLargo = parseUnit(dimMatch[5], dimMatch[6] || uDefault);
      }
    }

    if (foundPeso === null) {
      const weightRegex = /(\d+(?:[\.,]\d+)?)\s*(kg|g|gr|gramos|kilos)\b/i;
      const wMatch = fullText.match(weightRegex);
      if (wMatch) {
        const n = parseFloat(wMatch[1].replace(',', '.'));
        const u = wMatch[2].toLowerCase();
        foundPeso = u === 'kg' || u === 'kilos' ? n * 1000 : n;
      }
    }
  }

  // Determinar si falta alguna medida fundamental
  const requiresManualDimensions =
    foundAlto === null ||
    foundAncho === null ||
    foundLargo === null ||
    foundPeso === null ||
    foundAlto <= 0 ||
    foundAncho <= 0 ||
    foundLargo <= 0 ||
    foundPeso <= 0;

  const finalAlto = Math.round(foundAlto && foundAlto > 0 ? foundAlto : 10);
  const finalAncho = Math.round(foundAncho && foundAncho > 0 ? foundAncho : 10);
  const finalLargo = Math.round(foundLargo && foundLargo > 0 ? foundLargo : 10);
  const finalPeso = Math.round(foundPeso && foundPeso > 0 ? foundPeso : 200);

  const formattedDimensions = requiresManualDimensions
    ? `⚠️ REQUIERE MEDIDAS MANUALES (Est.: ${finalPeso}g | ${finalAlto}x${finalAncho}x${finalLargo}cm)`
    : `📦 ${finalPeso}g | ${finalAlto} × ${finalAncho} × ${finalLargo} cm`;

  return {
    peso: finalPeso,
    alto: finalAlto,
    ancho: finalAncho,
    largo: finalLargo,
    requiresManualDimensions,
    formattedDimensions,
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

/**
 * Normaliza el título de una publicación para agrupar ítems idénticos
 */
export function normalizeTitleForGrouping(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(clasica|premium|cuotas?|sin|interes|envio|gratis|oferta|promo|pack|combo|descuento)\b/gi, '')
    .replace(/[^a-z0-9]/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Busca si una publicación o grupo de publicaciones de ML ya existe en el catálogo de la tienda web
 */
export function findMatchingStoreProduct(
  itemIds: string[],
  cleanTitle: string,
  existingProducts: Product[] = []
): Product | null {
  if (!existingProducts || existingProducts.length === 0) return null;

  // 1. Coincidencia primaria por meli_id o meli_ids
  const matchById = existingProducts.find((p) => {
    if (p.meli_id && itemIds.includes(p.meli_id)) return true;
    if (p.meli_ids && p.meli_ids.some((id) => itemIds.includes(id))) return true;
    return false;
  });

  if (matchById) return matchById;

  // 2. Coincidencia secundaria por nombre normalizado
  const normTitle = normalizeTitleForGrouping(cleanTitle);
  if (normTitle.length < 4) return null;

  const matchByName = existingProducts.find((p) => {
    const normStoreName = normalizeTitleForGrouping(p.name);
    return normStoreName === normTitle || (normStoreName.length > 5 && normTitle.includes(normStoreName));
  });

  return matchByName || null;
}

/**
 * Agrupa publicaciones de Mercado Libre duplicadas o con variantes (ej: Clásica vs Premium)
 * y calcula el precio neto limpio tomando como base la publicación de MENOR PRECIO.
 * Además, verifica contra el catálogo existente de la tienda web para señalar [NUEVO] o [YA PUBLICADO]
 * y extrae las especificaciones logísticas (peso y dimensiones).
 */
export function groupAndDeduplicateMeliPublications(
  items: MeliPublicationItem[],
  customConfig: Partial<MeliPricingConfig> = {},
  existingProducts: Product[] = []
): ConsolidatedMeliProduct[] {
  if (!items || items.length === 0) return [];

  const config = { ...DEFAULT_MELI_PRICING_CONFIG, ...customConfig };

  if (!config.groupDuplicates) {
    // Si la consolidación está desactivada, cada publicación se procesa individualmente
    return items.map((item) => {
      const cleanPriceResult = calculateCleanPrice(
        item.price,
        item.listing_type_id || 'gold_special',
        Boolean(item.free_shipping),
        config
      );
      const cleanTitle = config.sanitizeTitle ? sanitizeMeliTitle(item.title) : item.title;
      const cleanDesc = config.sanitizeDescription ? sanitizeMeliDescription(item.description || '', cleanTitle) : item.description || '';
      const existingMatch = findMatchingStoreProduct([item.id], cleanTitle, existingProducts);
      const logisticData = extractLogisticDimensions(item);

      return {
        id: item.id,
        title: cleanTitle,
        category_name: item.category_name || 'Mercado Libre',
        category_id: item.category_id,
        lowestBasePrice: item.price,
        lowestPriceItem: item,
        cleanPriceResult,
        pictures: item.pictures.map((p) => ({ url: p.url })),
        groupedItems: [item],
        meli_ids: [item.id],
        variants: [],
        description: cleanDesc,
        permalink: item.permalink,
        isAlreadyPublished: Boolean(existingMatch),
        existingStoreProduct: existingMatch || null,
        logisticData,
      };
    });
  }

  const groupsMap = new Map<string, MeliPublicationItem[]>();

  // 1. Agrupar publicaciones por título normalizado
  for (const item of items) {
    const normKey = normalizeTitleForGrouping(item.title);
    const key = normKey.length >= 4 ? normKey : item.id;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key)!.push(item);
  }

  const consolidatedList: ConsolidatedMeliProduct[] = [];

  // 2. Procesar cada grupo de publicaciones
  groupsMap.forEach((groupItems) => {
    // A. Encontrar la publicación con el MENOR PRECIO base (priorizar Clásica / menor costo real)
    const sortedByPrice = [...groupItems].sort((a, b) => a.price - b.price);
    const lowestItem = sortedByPrice[0];

    // B. Calcular el precio limpio basándonos en la oferta más económica de la lista
    const cleanPriceResult = calculateCleanPrice(
      lowestItem.price,
      lowestItem.listing_type_id || 'gold_special',
      Boolean(lowestItem.free_shipping),
      config
    );

    // C. Sanitizar el título principal
    const cleanTitle = config.sanitizeTitle ? sanitizeMeliTitle(lowestItem.title) : lowestItem.title;

    // D. Fusionar imágenes de todas las publicaciones del grupo sin duplicados
    const allPicturesMap = new Map<string, string>();
    groupItems.forEach((item) => {
      if (item.pictures) {
        item.pictures.forEach((pic) => {
          if (pic.url) allPicturesMap.set(pic.url, pic.url);
        });
      }
      if (item.thumbnail) allPicturesMap.set(item.thumbnail, item.thumbnail);
    });
    const combinedPictures = Array.from(allPicturesMap.keys()).map((url) => ({ url }));

    // E. Extraer variantes entre publicaciones
    const variants: ProductVariant[] = [];
    groupItems.forEach((item) => {
      const isPremium = item.listing_type_id === 'gold_pro' || item.listing_type_id === 'gold_premium';
      const variantLabel = isPremium ? 'Opción Cuotas (Premium)' : 'Opción Clásica';

      variants.push({
        id: item.id,
        name: groupItems.length > 1 ? 'Versión ML' : 'Variante',
        value: `${variantLabel}${item.free_shipping ? ' + Envío Gratis' : ''}`,
        price: `$ ${item.price.toLocaleString('es-AR')}`,
        meli_id: item.id,
      });

      if (item.attributes && Array.isArray(item.attributes)) {
        item.attributes.forEach((attr) => {
          if (attr.name && attr.value_name && ['Color', 'Talle', 'Tamaño', 'Modelo', 'Material', 'Capacidad'].includes(attr.name)) {
            variants.push({
              id: `${item.id}-${attr.id || attr.name}`,
              name: attr.name,
              value: attr.value_name,
              price: `$ ${item.price.toLocaleString('es-AR')}`,
              meli_id: item.id,
            });
          }
        });
      }
    });

    // F. Generar descripción limpia combinada
    const rawDesc = lowestItem.description || groupItems.find((i) => i.description)?.description || '';
    const cleanDesc = config.sanitizeDescription ? sanitizeMeliDescription(rawDesc, cleanTitle) : rawDesc;

    // G. Verificar si ya existe en el catálogo web
    const meliIds = groupItems.map((i) => i.id);
    const existingMatch = findMatchingStoreProduct(meliIds, cleanTitle, existingProducts);

    // H. Extraer especificaciones logísticas (peso y dimensiones)
    const logisticData = extractLogisticDimensions(groupItems);

    consolidatedList.push({
      id: lowestItem.id,
      title: cleanTitle,
      category_name: lowestItem.category_name || 'Mercado Libre',
      category_id: lowestItem.category_id,
      lowestBasePrice: lowestItem.price,
      lowestPriceItem: lowestItem,
      cleanPriceResult,
      pictures: combinedPictures.length > 0 ? combinedPictures : [{ url: lowestItem.thumbnail }],
      groupedItems: groupItems,
      meli_ids: meliIds,
      variants,
      description: cleanDesc,
      permalink: lowestItem.permalink,
      isAlreadyPublished: Boolean(existingMatch),
      existingStoreProduct: existingMatch || null,
      logisticData,
    });
  });

  return consolidatedList;
}
