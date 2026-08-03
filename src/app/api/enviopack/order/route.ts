import { NextResponse } from 'next/server';
import { EnviopackService } from '@/services/enviopackService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderPayload } = body;

    if (!orderPayload || !orderPayload.customerCP || !orderPayload.shippingOption) {
      return NextResponse.json(
        { error: 'Datos incompletos para generar el pedido en Envíopack' },
        { status: 400 }
      );
    }

    const orderResult = await EnviopackService.createOrder(orderPayload);

    return NextResponse.json({ success: true, ...orderResult });
  } catch (error: any) {
    console.error('Error in Envíopack order API route:', error);
    return NextResponse.json(
      { error: 'Error al generar la orden en Envíopack' },
      { status: 500 }
    );
  }
}
