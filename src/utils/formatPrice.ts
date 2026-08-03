/**
 * Formatea un string de precio eliminando "Desde", "precio aprox" y asegurando el símbolo $
 * Ejemplos:
 * - "Desde $1.500" -> "$ 1.500"
 * - "2500" -> "$ 2500"
 * - "$8.500" -> "$ 8.500"
 */
export function formatPrice(price: string | number): string {
  if (price === undefined || price === null || price === '') return '$ 0';
  const str = String(price).trim();
  
  // Remover prefijos como "Desde", "precio aprox", "Aprox", etc.
  let cleaned = str
    .replace(/^Desde\s*/i, '')
    .replace(/^Precio\s*aprox:?\s*/i, '')
    .replace(/^Aprox:?\s*/i, '')
    .trim();

  // Si no tiene el signo $, agregarlo
  if (!cleaned.startsWith('$')) {
    cleaned = `$ ${cleaned}`;
  } else {
    // Asegurar espacio limpio si tiene $1500 -> $ 1500 o mantener $1500 legible
    cleaned = cleaned.replace(/^\$\s*/, '$ ');
  }

  return cleaned;
}
