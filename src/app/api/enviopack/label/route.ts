import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId') || 'EP-PARANA-100201';
  const cp = searchParams.get('cp') || '3100';
  const name = searchParams.get('name') || 'Cliente Trío 3D';
  const service = searchParams.get('service') || 'Andreani / Envíopack';

  // Printable HTML Label / Oblea template
  const labelHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Oblea de Envío Envíopack - ${orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; text-align: center; }
    .label-card { width: 400px; margin: 0 auto; background: #fff; border: 3px solid #000; padding: 20px; border-radius: 8px; text-align: left; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 20px; font-weight: 900; color: #ec4899; }
    .tag { background: #000; color: #fff; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; }
    .box { border: 1px dashed #000; padding: 10px; margin-bottom: 12px; font-size: 12px; }
    .title { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; }
    .barcode { background: #000; height: 50px; margin: 15px 0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: monospace; font-size: 18px; letter-spacing: 4px; }
    .footer { font-size: 10px; text-align: center; color: #888; border-top: 1px solid #ddd; pt-2; }
    @media print { body { background: none; padding: 0; } .label-card { shadow: none; border-color: #000; } }
  </style>
</head>
<body>
  <div class="label-card">
    <div class="header">
      <div class="logo">ENVÍOPACK</div>
      <div class="tag">ORDEN DE IMPRESIÓN 3D</div>
    </div>

    <div class="box">
      <div class="title">REMITENTE (ORIGEN)</div>
      <strong>TRÍO 3D PRINT STUDIO</strong><br>
      Paraná, Entre Ríos (CP 3100)<br>
      WhatsApp: +54 9 343 438-1991
    </div>

    <div class="box">
      <div class="title">DESTINATARIO (DESTINO)</div>
      <strong>${name}</strong><br>
      Código Postal: <strong>${cp}</strong><br>
      Servicio: <strong>${service}</strong>
    </div>

    <div class="barcode">
      ||| | |||| | ||| || ||| ${orderId}
    </div>

    <div style="text-align: center; margin-bottom: 10px;">
      <small>ORDEN DE ENVÍO: <strong>${orderId}</strong></small>
    </div>

    <div class="footer">
      Procesado mediante la API Oficial de Envíopack & Trío 3D Studio.<br>
      <button onclick="window.print()" style="margin-top: 10px; padding: 8px 16px; background: #ec4899; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ IMPRIMIR OBLEA PDF</button>
    </div>
  </div>
</body>
</html>`;

  return new Response(labelHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

