export interface Review {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  date: string;
  productBought: string;
  avatar: string;
}

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Martín Benítez',
    role: 'Gamer & Streamer',
    comment: 'Les pedí un soporte personalizado para mis auriculares con mi logo impreso en naranja. La calidad de terminación es impecable, super firme y llegó en 48hs. ¡Recomendadísimos!',
    rating: 5,
    date: 'Hace 3 días',
    productBought: 'Soporte Gamer para Auriculares',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-2',
    name: 'Valentina Rossi',
    role: 'Diseñadora de Interiores',
    comment: 'Compré 4 macetas geométricas Voronoi para un proyecto de decoración. El acabado sedoso y la precisión del patrón encajaron perfecto en el concepto. Trío 3D se convirtió en mi proveedor oficial.',
    rating: 5,
    date: 'Hace 1 semana',
    productBought: 'Maceta Geometric Voronoi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-3',
    name: 'Gonzalo Fernández',
    role: 'Ingeniero Mecánico',
    comment: 'Se me rompió una traba de plástico que no se conseguía como repuesto. Les mandé las fotos y medidas, me hicieron el diseño 3D y la pieza impresa en PETG. Calzo a la perfección.',
    rating: 5,
    date: 'Hace 2 semanas',
    productBought: 'Diseño a medida & Repuesto 3D',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-4',
    name: 'Camila Morales',
    role: 'Cliente Particular',
    comment: 'Pedí una litofanía con luz de una foto familiar para el aniversario de mis padres. Quedó maravillosa, cuando prendes la luz todos lloraron de la emoción. Atención rápida y muy amables por WhatsApp.',
    rating: 5,
    date: 'Hace 2 semanas',
    productBought: 'Caja Litofanía 3D con Luz LED',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
  }
];
