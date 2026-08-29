export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export const FAQS: FAQ[] = [
  {
    question: "¿Dónde puedo retirar mi impresión 3D en Paraná?",
    answer: "Podés retirar tu pedido sin costo adicional por nuestro taller ubicado en Coronel Uzin 1216, Paraná, Entre Ríos. Coordinamos el horario de retiro previamente por WhatsApp para tu mayor comodidad."
  },
  {
    question: "¿Realizan envíos a Santa Fe y municipios de Entre Ríos?",
    answer: "Sí, enviamos diariamente a Santa Fe Capital (vía túnel subfluvial), Oro Verde, San Benito, Colonia Avellaneda, Crespo, Diamante, Victoria, Concordia, Gualeguaychú y todo Entre Ríos a través de correo express y cadetería local con embalaje reforzado."
  },
  {
    question: "¿Pueden fabricar o copiar un repuesto roto que no consigo en Paraná?",
    answer: "¡Es nuestra especialidad! Si se te rompió un engranaje, traba, buje, perilla o carcasa de electrodoméstico o auto que ya no se consigue comercialmente en la zona, nos traés o enviás foto/medidas de la pieza rota. La digitalizamos en CAD 3D y la imprimimos en materiales técnicos de alta resistencia como PETG o Resina."
  },
  {
    question: "¿Qué archivos de diseño 3D aceptan para cotizar?",
    answer: "Aceptamos archivos en formatos .STL, .OBJ, .STEP, .3MF o planos en .PDF. Si no tenés el archivo 3D, ¡no te preocupes! Nos enviás fotos con las medidas o un boceto y nuestro equipo de diseñadores modela la pieza desde cero."
  },
  {
    question: "¿Qué materiales utilizan y para qué sirve cada uno?",
    answer: "Utilizamos filamentos y resinas de primera calidad: PLA ecológico (ideal para figuras, decoración, regalos y mates), PETG ultra resistente e impermeable (perfecto para soportes, piezas mecánicas y repuestos de uso rudo) y Resina SLA (para acabados de ultra precisión y detalles microscópicos)."
  },
  {
    question: "¿Cuáles son los tiempos de fabricación en Paraná?",
    answer: "Las impresiones estándar y productos de catálogo se fabrican en 24 a 48 horas hábiles. Para prototipos industriales urgentes o tandas mayoristas coordinamos entregas prioritarias."
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer: "Aceptamos Transferencia Bancaria, Mercado Pago (débito, crédito, dinero en cuenta), y efectivo al retirar en Coronel Uzin 1216, Paraná."
  }
];
