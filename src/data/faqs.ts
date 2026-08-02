export interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

export const FAQS: FAQ[] = [
  {
    question: "¿Qué materiales utilizan para las impresiones 3D?",
    answer: "Utilizamos materiales de primera calidad según el uso de la pieza: PLA ecológico y biodegradable (ideal para decoración, regalos y figuras) y PETG ultra resistente e impermeable (para soportes, exterior y piezas de uso diario)."
  },
  {
    question: "¿Cómo solicito un presupuesto personalizado por WhatsApp?",
    answer: "¡Es super simple! Haces clic en el botón de WhatsApp, nos contás tu idea o nos enviás una foto/archivo .STL. Si no tenés archivo 3D, nuestro equipo de diseño lo crea por vos. Te enviamos la cotización con tiempos de entrega en menos de 30 minutos."
  },
  {
    question: "¿Realizan envíos a todo el país?",
    answer: "Sí, realizamos envíos a todo el país mediante correo express y encomienda con embalaje reforzado anti-impacto. También podés retirar sin cargo por nuestro punto de retiro."
  },
  {
    question: "¿Tienen un pedido mínimo de piezas?",
    answer: "No, imprimimos desde 1 sola pieza personalizada hasta tandas mayoristas para empresas o eventos. Cuantas más unidades solicites del mismo modelo, mayor es el descuento por volumen."
  },
  {
    question: "¿Pueden diseñar una pieza que se me rompió o no consigo?",
    answer: "¡Absolutamente! Es uno de nuestros servicios estrella en 'Diseño a medida'. Nos enviás la pieza rota o las medidas, la modelamos en software 3D profesional y la imprimimos en un material técnico resistente como PETG."
  },
  {
    question: "¿Cuáles son los tiempos de fabricación y entrega?",
    answer: "Las piezas de catálogo en stock o impresiones estándar tardan entre 24 y 48 hs hábiles en fabricarse. Proyectos grandes o diseños a medida toman entre 3 a 5 días hábiles."
  },
  {
    question: "¿Qué medios de pago aceptan?",
    answer: "Aceptamos Transferencia bancaria, Mercado Pago (débito, crédito, dinero en cuenta), y tarjetas de crédito."
  }
];
