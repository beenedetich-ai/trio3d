import { supabase } from '@/lib/supabase';
import { encryptSecret, decryptSecret } from '@/utils/crypto';

export interface MeliTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export interface MeliApiError {
  message: string;
  error?: string;
  status?: number;
  cause?: any[];
}

export interface MeliConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface MeliPublicationItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  status: string; // 'active' | 'paused' | 'closed' | 'under_review'
  thumbnail: string;
  pictures: Array<{ id?: string; url: string; secure_url?: string }>;
  category_id: string;
  category_name?: string;
  date_created?: string;
  last_updated?: string;
  permalink?: string;
  listing_type_id?: string; // 'gold_special' (Clásica) | 'gold_pro' / 'gold_premium' (Premium) | 'free'
  free_shipping?: boolean;
  shipping?: {
    free_shipping?: boolean;
    logistic_type?: string;
    dimensions?: string | null;
  };
  description?: string;
  attributes?: Array<{ id: string; name: string; value_name: string; value_struct?: { number: number; unit: string } }>;
}

export interface MeliSearchFilters {
  status?: string; // 'all' | 'active' | 'paused' | 'closed'
  query?: string;
}



export class MercadoLibreService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string = 'https://api.mercadolibre.com';

  /**
   * Constructor para inicializar el cliente de Mercado Libre
   * @param clientId ID de la aplicación de Mercado Libre (App ID)
   * @param clientSecret Clave secreta de la aplicación
   * @param redirectUri URI de redirección configurada en la App (opcional)
   */
  constructor(
    clientId: string = process.env.MERCADOLIBRE_CLIENT_ID || process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID || '',
    clientSecret: string = process.env.MERCADOLIBRE_CLIENT_SECRET || process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_SECRET || '',
    redirectUri?: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri || process.env.MERCADOLIBRE_REDIRECT_URI || 'https://trio-3d.beenedetich.workers.dev/meli/redirect';
  }

  /**
   * Genera la URL de autorización para el proceso OAuth 2.0 (Authorize)
   * Formato: https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URL
   * @param overrideRedirectUri Opcional para sobrescribir la URI por defecto
   */
  public getAuthorizeUrl(overrideRedirectUri?: string): string {
    const targetRedirect = overrideRedirectUri || this.redirectUri;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: targetRedirect,
    });

    return `https://auth.mercadolibre.com.ar/authorization?${params.toString()}`;
  }

  /**
   * Alias de getAuthorizeUrl para compatibilidad
   */
  public getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
    });

    if (state) {
      params.append('state', state);
    }

    return `https://auth.mercadolibre.com.ar/authorization?${params.toString()}`;
  }

  /**
   * Dispara el proceso de autorización redirigiendo la ventana actual del navegador a Mercado Libre
   * @param overrideRedirectUri Opcional
   */
  public authorize(overrideRedirectUri?: string): void {
    const url = this.getAuthorizeUrl(overrideRedirectUri);
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  }

  /**
   * Guarda las credenciales de Mercado Libre en Supabase (public.mercadolibre_config) y en LocalStorage encriptado como fallback.
   */
  public static async saveConfigToSupabase(config: MeliConfig): Promise<boolean> {
    const encryptedSecret = encryptSecret(config.client_secret);
    const redirectUri = config.redirect_uri || 'https://trio-3d.beenedetich.workers.dev/meli/redirect';

    // 1. Guardar siempre en LocalStorage (encriptado) como fallback local
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('meli_config', JSON.stringify({
          client_id: config.client_id,
          client_secret: encryptedSecret,
          redirect_uri: redirectUri,
          updated_at: new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Error guardando respaldo de meli_config en LocalStorage:', e);
      }
    }

    // 2. Intentar guardar en Supabase si está disponible
    if (supabase) {
      try {
        const { error } = await supabase
          .from('mercadolibre_config')
          .upsert(
            {
              id: 'default',
              client_id: config.client_id,
              client_secret: encryptedSecret,
              redirect_uri: redirectUri,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.warn('Aviso: La tabla mercadolibre_config no existe aún en Supabase. Se utilizará el almacenamiento local encriptado.', error);
        }
      } catch (err) {
        console.warn('Excepción guardando configuración en Supabase:', err);
      }
    }

    return true;
  }

  /**
   * Obtiene las credenciales de Mercado Libre desde Supabase o desde el almacenamiento local desencriptado
   */
  public static async getConfigFromSupabase(): Promise<MeliConfig | null> {
    let config: MeliConfig | null = null;

    // 1. Intentar leer desde Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('mercadolibre_config')
          .select('*')
          .eq('id', 'default')
          .single();

        if (!error && data) {
          config = {
            client_id: data.client_id || '',
            client_secret: decryptSecret(data.client_secret || ''),
            redirect_uri: data.redirect_uri || 'https://trio-3d.beenedetich.workers.dev/meli/redirect',
          };
        }
      } catch (err) {
        console.warn('Aviso leyendo configuración de Supabase:', err);
      }
    }

    // 2. Si no se encontró en Supabase o falló la tabla, intentar leer desde LocalStorage
    if (!config && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('meli_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          config = {
            client_id: parsed.client_id || '',
            client_secret: decryptSecret(parsed.client_secret || ''),
            redirect_uri: parsed.redirect_uri || 'https://trio-3d.beenedetich.workers.dev/meli/redirect',
          };
        }
      } catch (e) {
        console.warn('Error leyendo respaldo meli_config de LocalStorage:', e);
      }
    }

    return config;
  }

  /**
   * Guarda los tokens de acceso obtenidos (access_token, refresh_token, expires_in) en Supabase (public.mercadolibre_tokens)
   * y en LocalStorage encriptado como respaldo.
   */
  public static async saveTokensToSupabase(tokenData: MeliTokenResponse): Promise<boolean> {
    const expiresInSec = tokenData.expires_in || 21600;
    const expiresAt = new Date(Date.now() + expiresInSec * 1000).toISOString();
    const encryptedAccessToken = encryptSecret(tokenData.access_token);
    const encryptedRefreshToken = encryptSecret(tokenData.refresh_token);

    // 1. Guardar en LocalStorage (encriptado)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('meli_tokens', JSON.stringify({
          user_id: tokenData.user_id || null,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_type: tokenData.token_type || 'Bearer',
          expires_in: expiresInSec,
          scope: tokenData.scope || '',
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Error guardando tokens en LocalStorage:', e);
      }
    }

    // 2. Guardar en Supabase si está disponible
    if (supabase) {
      try {
        const { error } = await supabase
          .from('mercadolibre_tokens')
          .upsert(
            {
              id: 'default',
              user_id: tokenData.user_id || null,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
              token_type: tokenData.token_type || 'Bearer',
              expires_in: expiresInSec,
              scope: tokenData.scope || '',
              expires_at: expiresAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.warn('Aviso: La tabla mercadolibre_tokens no existe aún en Supabase. Se utilizará el respaldo local.', error);
        }
      } catch (err) {
        console.warn('Excepción guardando tokens de ML en Supabase:', err);
      }
    }

    return true;
  }

  /**
   * Obtiene los tokens almacenados en Supabase o desde el almacenamiento local desencriptado
   */
  public static async getTokensFromSupabase(): Promise<(MeliTokenResponse & { expires_at?: string; updated_at?: string }) | null> {
    let result: (MeliTokenResponse & { expires_at?: string; updated_at?: string }) | null = null;

    // 1. Leer desde Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('mercadolibre_tokens')
          .select('*')
          .eq('id', 'default')
          .single();

        if (!error && data) {
          result = {
            access_token: decryptSecret(data.access_token || ''),
            refresh_token: decryptSecret(data.refresh_token || ''),
            token_type: data.token_type,
            expires_in: data.expires_in,
            scope: data.scope,
            user_id: Number(data.user_id),
            expires_at: data.expires_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Aviso leyendo tokens de Supabase:', err);
      }
    }

    // 2. Fallback a LocalStorage desencriptado
    if (!result && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('meli_tokens');
        if (cached) {
          const parsed = JSON.parse(cached);
          result = {
            access_token: decryptSecret(parsed.access_token || ''),
            refresh_token: decryptSecret(parsed.refresh_token || ''),
            token_type: parsed.token_type || 'Bearer',
            expires_in: parsed.expires_in,
            scope: parsed.scope || '',
            user_id: Number(parsed.user_id) || 0,
            expires_at: parsed.expires_at,
            updated_at: parsed.updated_at,
          };
        }
      } catch (e) {
        console.warn('Error leyendo respaldo meli_tokens de LocalStorage:', e);
      }
    }

    return result;
  }


  /**
   * Retorna el último token completo guardado en la base de datos (desencriptado)
   */
  public static async getLatestToken(): Promise<(MeliTokenResponse & { expires_at?: string; updated_at?: string }) | null> {
    return this.getTokensFromSupabase();
  }

  /**
   * Retorna un Access Token válido desencriptado.
   * Si el token actual expiró o está por expirar (menos de 5 min restantes),
   * intenta refrescarlo automáticamente utilizando las credenciales guardadas en Supabase / LocalStorage
   * y guarda el nuevo token encriptado.
   */
  public static async getValidAccessToken(): Promise<string | null> {
    const tokenRecord = await this.getTokensFromSupabase();
    if (!tokenRecord || !tokenRecord.access_token) {
      return null;
    }

    // Verificar si el token sigue siendo válido (con margen de seguridad de 5 minutos / 300.000 ms)
    if (tokenRecord.expires_at) {
      const expiresTime = new Date(tokenRecord.expires_at).getTime();
      const nowTime = Date.now();

      if (expiresTime - nowTime > 300000) {
        return tokenRecord.access_token;
      }
    }

    // Si expiró o está próximo a expirar en menos de 5 min, intentamos auto-refrescar
    if (tokenRecord.refresh_token) {
      try {
        console.log('🔄 MercadoLibreService: El Access Token expiró o vencerá pronto. Refrescando con el Refresh Token...');
        const config = await this.getConfigFromSupabase();
        const meliService = new MercadoLibreService(config?.client_id, config?.client_secret, config?.redirect_uri);
        const newTokens = await meliService.refreshToken(tokenRecord.refresh_token);
        await this.saveTokensToSupabase(newTokens);
        console.log('✅ MercadoLibreService: Token de Mercado Libre renovado y guardado encriptado en Supabase exitosamente.');
        return newTokens.access_token;
      } catch (err) {
        console.error('Error al auto-refrescar token en getValidAccessToken:', err);
        return tokenRecord.access_token;
      }
    }

    return tokenRecord.access_token;
  }




  /**
   * Obtiene un Access Token y Refresh Token a partir de un código de autorización (OAuth 2.0 PKCE / Standard)
   * @param code Código devuelto por Mercado Libre tras la autorización del usuario
   * @param redirectUri URI de redirección (si no se proveyó en el constructor)
   */
  public async getTokenFromCode(
    code: string,
    redirectUri: string = this.redirectUri
  ): Promise<MeliTokenResponse> {
    if (!code || code.trim() === '') {
      throw new Error('Error al obtener token: el código de autorización es nulo o vacío');
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Error de configuración: clientId o clientSecret no definidos');
    }

    const payload = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.error || 'Error desconocido al obtener token';
      throw new Error(`Error Mercado Libre (${response.status}): ${errorMsg}`);
    }

    return data as MeliTokenResponse;
  }

  /**
   * Refresca un Access Token caducado utilizando el refresh_token
   * @param refreshToken El refresh_token almacenado previamente
   */
  public async refreshToken(refreshToken: string): Promise<MeliTokenResponse> {
    if (!refreshToken || refreshToken.trim() === '') {
      throw new Error('Error al refrescar token: valor de refresh_token nulo o vacío');
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Error de configuración: clientId o clientSecret no definidos');
    }

    const payload = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.error || 'Error en respuesta de servidor ML';
        throw new Error(`Error al refrescar token: ${errorMsg}`);
      }

      // Conservar user_id si no viene en el payload de refresco
      if (!data.user_id) {
        const existingTokens = await MercadoLibreService.getTokensFromSupabase();
        if (existingTokens?.user_id) {
          data.user_id = existingTokens.user_id;
        }
      }

      return data as MeliTokenResponse;
    } catch (err: any) {

      console.error('MercadoLibreService.refreshToken failed:', err);
      throw new Error(`Error al refrescar token: ${err.message || err}`);
    }
  }

  /**
   * Realiza una petición GET autenticada a la API de Mercado Libre
   */
  public async get<T = any>(path: string, accessToken: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error Mercado Libre (${response.status}): ${data.message || 'Petición GET fallida'}`);
    }

    return data as T;
  }

  /**
   * Realiza una petición POST autenticada a la API de Mercado Libre
   */
  public async post<T = any>(path: string, accessToken: string, body: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error Mercado Libre (${response.status}): ${data.message || 'Petición POST fallida'}`);
    }

    return data as T;
  }

  /**
   * Obtiene el texto plano de la descripción de una publicación de Mercado Libre
   */
  public static async getItemDescription(itemId: string, accessToken?: string): Promise<string> {
    if (!itemId) return '';
    try {
      const url = accessToken
        ? `https://api.mercadolibre.com/items/${itemId}/description?access_token=${encodeURIComponent(accessToken)}`
        : `https://api.mercadolibre.com/items/${itemId}/description`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.plain_text || data.text || '';
      }
    } catch (e) {
      console.warn(`Error obteniendo descripción de ML para ${itemId}:`, e);
    }
    return '';
  }

  private static categoryNameCache: Record<string, string> = {};

  /**
   * Obtiene el nombre legible de una categoría de Mercado Libre (ej: "MLA1430" -> "Hogar y Decoración")
   */
  public static async getCategoryName(categoryId: string): Promise<string> {
    if (!categoryId) return 'General';
    if (this.categoryNameCache[categoryId]) return this.categoryNameCache[categoryId];

    try {
      const res = await fetch(`https://api.mercadolibre.com/categories/${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.name) {
          this.categoryNameCache[categoryId] = data.name;
          return data.name;
        }
      }
    } catch (e) {
      console.warn('Error obteniendo categoría de ML:', e);
    }
    return 'Mercado Libre';
  }

  /**
   * Obtiene los datos del usuario autenticado actual.
   * Revisa primero si ya tenemos el user_id guardado en las credenciales/tokens para evitar bloqueos de CORS en el navegador.
   */
  public static async getCurrentUser(overrideToken?: string): Promise<{ id: number; nickname?: string; [key: string]: any }> {
    const tokenRecord = await this.getTokensFromSupabase();

    // Si ya poseemos el user_id guardado de OAuth y no se pasó un token de anulación, lo retornamos directo
    if (!overrideToken && tokenRecord?.user_id && Number(tokenRecord.user_id) > 0) {
      return {
        id: Number(tokenRecord.user_id),
        nickname: 'Usuario Autenticado ML',
      };
    }

    const accessToken = overrideToken || (await this.getValidAccessToken());
    if (!accessToken) {
      throw new Error('No se encontró un token válido de Mercado Libre. Por favor autorizá la aplicación.');
    }

    try {
      const response = await fetch(`https://api.mercadolibre.com/users/me?access_token=${encodeURIComponent(accessToken)}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.warn('Acceso a /users/me no disponible directamente en navegador por política CORS. Usando id guardado:', err);
    }

    // Fallback de seguridad al user_id guardado
    if (tokenRecord?.user_id && Number(tokenRecord.user_id) > 0) {
      return {
        id: Number(tokenRecord.user_id),
        nickname: 'Usuario Autenticado ML',
      };
    }

    throw new Error('No se pudo determinar el ID de usuario de Mercado Libre (/users/me). Por favor volvé a hacer clic en Iniciar Authorize.');
  }


  public static lastRawDebugInfo: any = null;

  /**
   * Retorna la última información cruda y log de respuesta de la API de Mercado Libre
   */
  public static getLastRawDebugInfo(): any {
    return this.lastRawDebugInfo;
  }

  /**
   * Helper para formatear mensajes de error detallados recibidos de la API de Mercado Libre
   */
  public static formatApiError(status: number, data: any, endpoint: string): string {
    const errorTitle = data?.error || data?.status || 'Error de API';
    const errorMsg = data?.message || data?.error_description || data?.cause?.[0]?.message || 'Sin detalle adicional';

    let causes = '';
    if (Array.isArray(data?.cause) && data.cause.length > 0) {
      causes = data.cause
        .map((c: any) => (typeof c === 'string' ? c : (c.code || c.message || JSON.stringify(c))))
        .join(', ');
    }

    let result = `[HTTP ${status}] ${errorTitle}: ${errorMsg}`;
    if (causes) {
      result += ` (Causa: ${causes})`;
    }
    result += ` | Endpoint: ${endpoint}`;
    return result;
  }

  /**
   * Busca publicaciones del usuario vendedor actual (/users/{user_id}/items/search) en Mercado Libre utilizando el Access Token activo
   */
  public static async searchUserItems(filters: MeliSearchFilters = {}): Promise<MeliPublicationItem[]> {
    const accessToken = await this.getValidAccessToken();

    if (!accessToken) {
      throw new Error('No se encontró un token válido de Mercado Libre. Por favor completá el proceso de Autorización (OAuth) primero.');
    }

    // 1. Obtener datos del usuario actual (/users/me o tokens)
    const currentUser = await this.getCurrentUser(accessToken);
    const userId = currentUser.id;

    // 2. Definir parámetros de consulta
    const baseParams = new URLSearchParams();
    baseParams.append('limit', '50');

    if (filters.status && filters.status !== 'all') {
      baseParams.append('status', filters.status);
    }

    if (filters.query && filters.query.trim()) {
      baseParams.append('q', filters.query.trim());
    }

    const paramsWithToken = new URLSearchParams(baseParams);
    paramsWithToken.append('access_token', accessToken);

    // Tres intentos estratégicos para asegurar compatibilidad CORS y endpoints CBT/Marketplace
    const attempts: Array<{ url: string; headers: Record<string, string>; description: string }> = [
      {
        url: `https://api.mercadolibre.com/users/${userId}/items/search?${paramsWithToken.toString()}`,
        headers: {},
        description: `/users/${userId}/items/search?access_token=... (Query Token)`,
      },
      {
        url: `https://api.mercadolibre.com/marketplace/users/${userId}/items/search?${paramsWithToken.toString()}`,
        headers: {},
        description: `/marketplace/users/${userId}/items/search?access_token=... (Marketplace Query Token)`,
      },
      {
        url: `https://api.mercadolibre.com/users/${userId}/items/search?${baseParams.toString()}`,
        headers: { 'Authorization': `Bearer ${accessToken}` },
        description: `/users/${userId}/items/search (Bearer Header)`,
      },
    ];

    let itemIds: string[] = [];
    const debugAttempts: any[] = [];
    let lastSuccessfulRawJson: any = null;

    for (const attempt of attempts) {
      try {
        const reqHeaders: Record<string, string> = {
          'Accept': 'application/json',
          ...attempt.headers,
        };

        const res = await fetch(attempt.url, {
          method: 'GET',
          headers: reqHeaders,
        });


        const resData = await res.json().catch(() => null);

        debugAttempts.push({
          attempt: attempt.description,
          url: attempt.url,
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          responseJson: resData,
        });

        if (res.ok && resData) {
          lastSuccessfulRawJson = resData;
          if (resData.results && Array.isArray(resData.results)) {
            itemIds = resData.results;
            if (itemIds.length > 0) break;
          }
        }
      } catch (err: any) {
        debugAttempts.push({
          attempt: attempt.description,
          url: attempt.url,
          error: err.message || String(err),
        });
      }
    }

    // Guardar registro de depuración para inspección en tiempo real de JSON crudo
    this.lastRawDebugInfo = {
      timestamp: new Date().toISOString(),
      userId,
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 15)}...` : 'N/A',
      filtersApplied: filters,
      itemIdsFoundCount: itemIds.length,
      itemIds,
      attempts: debugAttempts,
      rawJsonResponse: lastSuccessfulRawJson || debugAttempts[0]?.responseJson || debugAttempts,
    };

    if (itemIds.length === 0) {
      const failedHttp = debugAttempts.find((a) => a.status && a.status !== 200);
      if (failedHttp) {
        const errDetail = this.formatApiError(failedHttp.status, failedHttp.responseJson, failedHttp.attempt);
        throw new Error(`Mercado Libre devolvió un error HTTP: ${errDetail}`);
      }

      const fetchErr = debugAttempts.find((a) => a.error);
      if (fetchErr) {
        throw new Error(`Error de conexión con Mercado Libre (Failed to fetch). Detalle: ${fetchErr.error}`);
      }

      return [];
    }

    // 3. Obtener detalles completos de publicaciones (/items/{id} o multiget /items?ids=...)
    const publications: MeliPublicationItem[] = [];

    // Multiget masivo con access_token en query string
    try {
      const multigetUrl = `https://api.mercadolibre.com/items?ids=${itemIds.slice(0, 50).join(',')}&access_token=${encodeURIComponent(accessToken)}`;
      const multigetRes = await fetch(multigetUrl);
      if (multigetRes.ok) {
        const multigetJson = await multigetRes.json();
        if (Array.isArray(multigetJson)) {
          for (const entry of multigetJson) {
            if (entry.code === 200 && entry.body) {
              const body = entry.body;
              const categoryName = await this.getCategoryName(body.category_id);
              const desc = await MercadoLibreService.getItemDescription(body.id, accessToken);
              publications.push({
                id: body.id,
                title: body.title,
                price: Number(body.price) || 0,
                currency_id: body.currency_id || 'ARS',
                status: body.status || 'active',
                thumbnail: body.secure_thumbnail || body.thumbnail || body.pictures?.[0]?.secure_url || body.pictures?.[0]?.url || '',
                pictures: body.pictures || [{ url: body.thumbnail }],
                category_id: body.category_id,
                category_name: categoryName,
                date_created: body.date_created,
                last_updated: body.last_updated,
                permalink: body.permalink,
                listing_type_id: body.listing_type_id || 'gold_special',
                free_shipping: Boolean(body.shipping?.free_shipping),
                description: desc,
                attributes: body.attributes || [],
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Fallo multiget /items:', e);
    }

    // Si multiget no trajo publicaciones, consultar individualmente /items/${id}
    if (publications.length === 0) {
      const detailPromises = itemIds.slice(0, 50).map(async (itemId) => {
        const itemUrls = [
          `https://api.mercadolibre.com/items/${itemId}?access_token=${encodeURIComponent(accessToken)}`,
          `https://api.mercadolibre.com/marketplace/items/${itemId}?access_token=${encodeURIComponent(accessToken)}`,
          `https://api.mercadolibre.com/items/${itemId}`,
        ];

        for (const itemUrl of itemUrls) {
          try {
            const itemRes = await fetch(itemUrl, {
              headers: itemUrl.includes('access_token') ? {} : { 'Authorization': `Bearer ${accessToken}` },
            });
            if (itemRes.ok) {
              const body = await itemRes.json();
              const categoryName = await this.getCategoryName(body.category_id);
              const desc = await MercadoLibreService.getItemDescription(body.id, accessToken);
              return {
                id: body.id,
                title: body.title,
                price: Number(body.price) || 0,
                currency_id: body.currency_id || 'ARS',
                status: body.status || 'active',
                thumbnail: body.secure_thumbnail || body.thumbnail || body.pictures?.[0]?.secure_url || body.pictures?.[0]?.url || '',
                pictures: body.pictures || [{ url: body.thumbnail }],
                category_id: body.category_id,
                category_name: categoryName,
                date_created: body.date_created,
                last_updated: body.last_updated,
                permalink: body.permalink,
                listing_type_id: body.listing_type_id || 'gold_special',
                free_shipping: Boolean(body.shipping?.free_shipping),
                description: desc,
                attributes: body.attributes || [],
              } as MeliPublicationItem;
            }
          } catch (err) {
            // Probar siguiente opción
          }
        }
        return null;
      });

      const individualResults = await Promise.all(detailPromises);
      for (const pub of individualResults) {
        if (pub) publications.push(pub);
      }
    }

    if (this.lastRawDebugInfo) {
      this.lastRawDebugInfo.publicationsCount = publications.length;
      this.lastRawDebugInfo.publicationsSample = publications.slice(0, 3);
    }

    return publications;
  }

}


