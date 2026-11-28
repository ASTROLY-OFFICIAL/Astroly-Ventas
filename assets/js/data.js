// Catálogo de ejemplo. Tu socio reemplaza estos datos por los productos reales
// (en Shopify vendrán de Productos y Colecciones; aquí solo sirven para diseñar).
// price: precio en pesos colombianos (COP). La conversión a USD usa CONFIG.usdRate.

export const CONFIG = {
  store: 'astroly',
  usdRate: 4000,            // 1 USD = 4.000 COP (solo para la vista previa; Shopify Markets lo calcula de verdad)
  defaultCurrency: 'COP',
  // Promoción que se despliega en la portada cuando Astro encuentra el producto. Sin descuentos inventados:
  // si hay una oferta real, ponla en "offer" (por ejemplo "10 % de descuento hasta el domingo").
  promo: {id: 'lampara-halo', label: 'Hallazgo de la semana', offer: ''},
  socials: [
    {key: 'instagram', name: 'Instagram', handle: '@astroly.ventas', url: '#'},
    {key: 'tiktok', name: 'TikTok', handle: '@astroly.ventas', url: '#'},
    {key: 'facebook', name: 'Facebook', handle: 'Astroly Ventas', url: '#'},
    {key: 'whatsapp', name: 'WhatsApp', handle: 'Escríbenos', url: '#'}
  ]
};

// Colecciones: el nicho de hoy es decoración para el hogar, pero la lista está pensada para crecer.
export const COLLECTIONS = [
  {key: 'sala', name: 'Sala', line: 'Piezas para el lugar donde se recibe.', art: 'vase'},
  {key: 'dormitorio', name: 'Dormitorio', line: 'Calma para el final del día.', art: 'cushion'},
  {key: 'mesa', name: 'Cocina y mesa', line: 'Objetos que se usan todos los días.', art: 'bowl'},
  {key: 'luz', name: 'Iluminación', line: 'Luz cálida que cambia una habitación.', art: 'lamp'},
  {key: 'muros', name: 'Muros', line: 'Lo que se cuelga y se mira.', art: 'frame'},
  {key: 'pronto', name: 'Lo que viene', line: 'Nuevas categorías en camino.', art: 'crate', soon: true}
];

// tones: variantes de color. m = cerámica blanca, s = grafito, c = gris perla, p = hueso.
export const PRODUCTS = [
  {id: 'jarron-orbita', name: 'Jarrón Órbita', col: 'sala', art: 'vase', price: 129000, tones: ['m', 's', 'c'], badge: 'Nuevo',
    short: 'Cerámica mate de cuello alto para ramas secas o sola sobre la mesa.'},
  {id: 'lampara-halo', name: 'Lámpara Halo', col: 'luz', art: 'lamp', price: 219000, tones: ['m', 's'], badge: 'Nuevo',
    short: 'Pantalla en cúpula y base pesada. Luz cálida y difusa para la mesa de noche.'},
  {id: 'vela-monolito', name: 'Vela Monolito', col: 'dormitorio', art: 'candle', price: 49000, tones: ['p', 's'],
    short: 'Vela geométrica de cera de soya en un bloque de líneas limpias.'},
  {id: 'marco-umbral', name: 'Marco Umbral', col: 'muros', art: 'frame', price: 89000, tones: ['s', 'm'],
    short: 'Marco de perfil delgado para láminas, fotos o un espejo pequeño.'},
  {id: 'reloj-eclipse', name: 'Reloj Eclipse', col: 'muros', art: 'clock', price: 159000, tones: ['m', 's', 'c'],
    short: 'Reloj de pared silencioso con esfera limpia y agujas finas.'},
  {id: 'cojin-nube', name: 'Cojín Nube', col: 'dormitorio', art: 'cushion', price: 69000, tones: ['p', 'c', 's'],
    short: 'Funda de textura suave con relleno firme que mantiene la forma.'},
  {id: 'espejo-portal', name: 'Espejo Portal', col: 'sala', art: 'mirror', price: 249000, tones: ['c', 's'], badge: 'Destacado',
    short: 'Espejo en arco con marco metálico. Abre y amplía cualquier pared.'},
  {id: 'maceta-cubo', name: 'Maceta Cubo', col: 'sala', art: 'plant', price: 79000, tones: ['m', 's', 'p'],
    short: 'Maceta de concreto con plato oculto para plantas de interior.'},
  {id: 'cuenco-luna', name: 'Cuenco Luna', col: 'mesa', art: 'bowl', price: 59000, tones: ['m', 'p', 's'],
    short: 'Cuenco de cerámica para frutas, llaves o como pieza central.'},
  {id: 'escultura-prisma', name: 'Escultura Prisma', col: 'sala', art: 'sculpture', price: 139000, tones: ['s', 'm'],
    short: 'Pieza de autor en formas apiladas para estantes y consolas.'},
  {id: 'repisa-linea', name: 'Repisa Línea', col: 'muros', art: 'shelf', price: 119000, tones: ['c', 's', 'm'],
    short: 'Repisa flotante de fijación oculta para libros y objetos.'},
  {id: 'difusor-bruma', name: 'Difusor Bruma', col: 'dormitorio', art: 'diffuser', price: 99000, tones: ['m', 's'], badge: 'Nuevo',
    short: 'Difusor de aroma con varillas y frasco de vidrio esmerilado.'},
  {id: 'bandeja-plano', name: 'Bandeja Plano', col: 'mesa', art: 'tray', price: 75000, tones: ['s', 'c', 'p'],
    short: 'Bandeja de borde bajo para servir u ordenar la entrada.'},
  {id: 'lampara-pilar', name: 'Lámpara Pilar', col: 'luz', art: 'pillar', price: 289000, tones: ['m', 's'],
    short: 'Lámpara de piso en columna con luz hacia arriba.'}
];

export const TONE_NAMES = {m: 'Blanco', s: 'Grafito', c: 'Perla', p: 'Hueso'};

export const byId = id => PRODUCTS.find(p => p.id === id);
export const collectionName = key => COLLECTIONS.find(c => c.key === key)?.name || '';
