'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MercadoLibreService, MeliTokenResponse } from '@/services/mercadoLibreService';
import { CheckCircle2, AlertTriangle, Key, RefreshCw, Copy, Check, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function MeliRedirectContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const [loading, setLoading] = useState<boolean>(false);
  const [tokenResult, setTokenResult] = useState<MeliTokenResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states for manual credentials if env vars are missing
  const [clientId, setClientId] = useState<string>(
    process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_ID || ''
  );
  const [clientSecret, setClientSecret] = useState<string>(
    process.env.NEXT_PUBLIC_MERCADOLIBRE_CLIENT_SECRET || ''
  );

  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/meli/redirect`
    : 'https://trio-3d.beenedetich.workers.dev/meli/redirect';

  const [savedToDb, setSavedToDb] = useState<boolean>(false);

  // Auto-cargar credenciales desde Supabase si existen
  useEffect(() => {
    MercadoLibreService.getConfigFromSupabase().then((cfg) => {
      if (cfg) {
        if (cfg.client_id && !clientId) setClientId(cfg.client_id);
        if (cfg.client_secret && !clientSecret) setClientSecret(cfg.client_secret);
      }
    });
  }, []);

  const handleExchangeToken = async (overrideCode?: string) => {
    const targetCode = overrideCode || codeParam;


    if (!targetCode) {
      setErrorMsg('No se proporcionó ningún parámetro "code" en la URL.');
      return;
    }

    // Si aún no tenemos credenciales en el estado, intentamos leerlas de Supabase
    let activeClientId = clientId;
    let activeClientSecret = clientSecret;

    if (!activeClientId || !activeClientSecret) {
      const cfg = await MercadoLibreService.getConfigFromSupabase();
      if (cfg) {
        activeClientId = cfg.client_id;
        activeClientSecret = cfg.client_secret;
        setClientId(cfg.client_id);
        setClientSecret(cfg.client_secret);
      }
    }

    if (!activeClientId.trim() || !activeClientSecret.trim()) {
      setErrorMsg('Client ID y Client Secret son requeridos. Configuralos en el Panel Admin o en las variables de entorno.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSavedToDb(false);

    try {
      const meliService = new MercadoLibreService(activeClientId, activeClientSecret, redirectUri);
      const data = await meliService.getTokenFromCode(targetCode, redirectUri);
      setTokenResult(data);

      // Guardar automáticamente token, refresh_token y expiración en Supabase (public.mercadolibre_tokens)
      const saved = await MercadoLibreService.saveTokensToSupabase(data);
      if (saved) {
        setSavedToDb(true);
      }
    } catch (err: any) {
      console.error('Error al procesar token OAuth de Mercado Libre:', err);
      setErrorMsg(err.message || 'Error desconocido al solicitar el token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (errorParam) {
      setErrorMsg(`Error de Mercado Libre: ${errorParam} ${errorDescription ? `- ${errorDescription}` : ''}`);
      return;
    }

    if (codeParam) {
      handleExchangeToken(codeParam);
    }
  }, [codeParam, errorParam]);


  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Inicio
        </Link>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">OAuth Redirect Mercado Libre</h1>
              <p className="text-sm text-slate-400">Captura de authorization code e intercambio por Access Token</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            /meli/redirect
          </span>
        </div>

        {/* Credentials Form if needed */}
        <div className="mb-8 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center">
            <Key className="w-4 h-4 mr-2 text-amber-400" />
            Configuración de Credenciales Mercado Libre
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client ID / App ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Ej: 1234567890"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Clave secreta de ML"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {codeParam && !tokenResult && !loading && (
            <button
              onClick={() => handleExchangeToken()}
              className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Intercambiar Code por Token</span>
            </button>
          )}
        </div>

        {/* Dynamic Status / Output Section */}
        {codeParam && (
          <div className="mb-6 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Code recibido en URL:
            </span>
            <code className="text-sm font-mono text-amber-300 break-all">{codeParam}</code>
          </div>
        )}

        {loading && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            <p className="text-slate-300 font-medium">Solicitando tokens a api.mercadolibre.com...</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 mb-6 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-300 text-sm">Error en proceso de autenticación</h4>
              <p className="text-sm text-red-200/90 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {tokenResult && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-300">¡Token obtenido con éxito!</h4>
                  <p className="text-xs text-emerald-200/80">User ID de Mercado Libre: {tokenResult.user_id}</p>
                </div>
              </div>
              {savedToDb && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  ☁️ Tokens Guardados en Supabase
                </span>
              )}
            </div>
            {savedToDb && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 font-medium flex items-center gap-2 sm:hidden">
                <span>☁️ Tokens guardados en Supabase (public.mercadolibre_tokens)</span>
              </div>
            )}


            <div className="grid grid-cols-1 gap-4">
              {/* Access Token Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Access Token</span>
                  <button
                    onClick={() => copyToClipboard(tokenResult.access_token, 'access_token')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'access_token' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-200 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {tokenResult.access_token}
                </p>
                <div className="mt-2 text-xs text-slate-500">
                  Expira en: {tokenResult.expires_in} segundos ({Math.round(tokenResult.expires_in / 3600)} horas)
                </div>
              </div>

              {/* Refresh Token Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Refresh Token</span>
                  <button
                    onClick={() => copyToClipboard(tokenResult.refresh_token, 'refresh_token')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'refresh_token' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-xs text-amber-300 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  {tokenResult.refresh_token}
                </p>
              </div>
            </div>

            {/* Raw JSON viewer */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Respuesta JSON Completa</h4>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto">
                {JSON.stringify(tokenResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!codeParam && !tokenResult && !loading && (
          <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="text-slate-300 text-sm font-medium">Esperando redirección de Mercado Libre</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Configura este endpoint (<code className="text-amber-400 font-mono">https://trio-3d.beenedetich.workers.dev/meli/redirect</code>) como URI de redirección en tu aplicación de Mercado Libre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MeliRedirectPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-slate-400">
        Cargando endpoint Mercado Libre...
      </div>
    }>
      <MeliRedirectContent />
    </Suspense>
  );
}
