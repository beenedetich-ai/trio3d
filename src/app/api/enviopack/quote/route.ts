import { NextResponse } from 'next/server';
import { EnviopackService } from '@/services/enviopackService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postalCode, weightGrams, weightKg, alto, ancho, largo, valorDeclarado } = body;

    if (!postalCode) {
      return NextResponse.json(
        { error: 'El código postal es requerido' },
        { status: 400 }
      );
    }

    // Convert weightGrams to Kilograms if provided
    let calculatedKg = 0.5;
    if (typeof weightGrams === 'number' && weightGrams > 0) {
      calculatedKg = weightGrams / 1000;
    } else if (typeof weightKg === 'number' && weightKg > 0) {
      calculatedKg = weightKg;
    }

    // Ensure minimum weight floor (0.1 kg) for Envíopack API
    const finalWeightKg = Math.max(0.1, calculatedKg);

    console.log('--- [QUOTE ROUTE BACKEND AUDIT] ---');
    console.log({
      receivedPostalCode: postalCode,
      rawWeightGrams: weightGrams,
      convertedWeightKg: finalWeightKg,
      dimensions: { alto, ancho, largo },
      valorDeclarado: valorDeclarado || 5000,
    });

    const options = await EnviopackService.quoteShipping(
      postalCode,
      finalWeightKg,
      { alto: alto || 10, ancho: ancho || 10, largo: largo || 10 },
      valorDeclarado || 5000
    );

    return NextResponse.json({ success: true, options });
  } catch (error: any) {
    console.error('Error in Envíopack quote API route:', error);
    return NextResponse.json(
      { error: 'Error al cotizar envío en Envíopack' },
      { status: 500 }
    );
  }
}
