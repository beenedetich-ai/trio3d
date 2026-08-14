'use client';

import { useEffect, useRef } from 'react';
import { MercadoLibreService } from '@/services/mercadoLibreService';

/**
 * Hook personalizado que ejecuta una rutina periódica en segundo plano para validar
 * el estado del token de Mercado Libre y refrescarlo automáticamente con el refresh_token
 * si ha expirado o está próximo a expirar.
 *
 * @param intervalMinutes Frecuencia con la que se comprueba el token (por defecto cada 10 minutos)
 */
export function useMeliTokenAutoRefresh(intervalMinutes: number = 10) {
  const isRunningRef = useRef<boolean>(false);

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const activeToken = await MercadoLibreService.getValidAccessToken();
        if (activeToken) {
          // Token verificado / renovado correctamente
          console.log('🛡️ Mercado Libre OAuth Keep-Alive: Token validado correctamente');
        }
      } catch (err) {
        console.error('Error en rutina de auto-refresco Mercado Libre:', err);
      } finally {
        isRunningRef.current = false;
      }
    };

    // 1. Ejecutar verificación inicial inmediatamente al montar la app
    checkAndRefreshToken();

    // 2. Programar intervalo periódico cada N minutos
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;
    const timerId = setInterval(checkAndRefreshToken, intervalMs);

    return () => clearInterval(timerId);
  }, [intervalMinutes]);
}
