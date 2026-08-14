'use client';

import { useMeliTokenAutoRefresh } from '@/hooks/useMeliTokenAutoRefresh';

/**
 * Componente Worker en segundo plano (sin renderizado visual) que se monta en la aplicación
 * para mantener siempre activo y renovado el token de Mercado Libre.
 */
export function MeliTokenKeepAlive() {
  // Ejecuta la rutina de validación y refresco automáticamente cada 10 minutos
  useMeliTokenAutoRefresh(10);
  return null;
}
