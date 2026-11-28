# Sistema visual de la tienda astroly

Lo que renderiza hoy `assets/css/tienda.css` (sistema de la v2). Si cambias una decisión, actualiza este archivo y
`CONTEXTO.md`.

## Color

Monocromo, del kit de Astroly.

| Token | Claro | Noche | Uso |
| --- | --- | --- | --- |
| `--c-bg` | `#979797` gris | `#050505` negro | Lienzo de la página |
| `--c-ink` | `#0a0a0a` | `#f2f2f2` | Texto, botones principales, contador |
| `--c-muted` / `--c-soft` | `#262626` / `#8a8a8a` | `#8c8c8c` / `#161616` | Texto secundario y rellenos |
| `--b-bg` / `--b-ink` | `#000` / `#f2f2f2` | `#ececec` / `#0a0a0a` | Bandas invertidas (`.band`), como el pie |

- Tarjetas de producto blancas sobre el lienzo; vidrio (`--glass`, `--glass-edge`, `--glass-shadow`) en la portada,
  la tarjeta de redes y los paneles.
- Tema "noche" con `data-theme="dark"` (se guarda en `localStorage astroly-theme`).
- Los tonos de producto (Blanco, Grafito, Perla, Hueso) y las ilustraciones de `art.js` representan el producto, no
  la interfaz.

## Forma y densidad

- Esquinas poco curvas: tarjetas 8 px (`--card-r`), botones, chips y campos 6–8 px (`--pill`, `--radius`), portada 12 px.
- Densidad de tienda grande: cuadrícula de 6 columnas (5 y 4 en pantallas medianas, 2 en celular) con 8–10 px de
  separación; tarjeta con imagen cuadrada, categoría pequeña, nombre en dos líneas, precio en Geist Mono 15 px y
  botón Agregar de 32 px. Novedades en fila de 7.
- La barra del catálogo (título, búsqueda, orden y filtros) queda fija arriba al bajar. Al acercarse al final de la
  cuadrícula se cargan más productos solos.

## Tipografía y movimiento

- Urbanist (texto) y Geist Mono (precios, etiquetas técnicas, globos de la mascota), en `assets/fonts/`.
- Textos cortos y títulos pequeños: la atención va a los productos.
- Curva `cubic-bezier(.23,1,.32,1)`. Respetar `prefers-reduced-motion`.

## Portada

Tarjeta de vidrio compacta: a la izquierda "Encuentra lo que buscas", texto corto y botones; a la derecha la escena en
8 bits (`escena.js`, lienzo de 200×80 sin suavizado): cajas de cartón en grises con contorno negro, Astro busca en
ellas y en la tercera aparece una lámpara con rayos cálidos. Entonces se despliega la promoción: tarjeta blanca con
borde negro de 2 px, sombra dura de 4 px y apertura en pasos (estilo 8 bits). En celular la promoción va debajo de
la escena. Tocar la escena la repite.

## Mascota: Astro

Estrellita de 8 bits (`mascota.js`): estrella gordita de cinco puntas, negra con brillo gris en el borde de arriba,
ojos blancos con pupila de 1×2 y boca blanca; en fondo oscuro lleva contorno gris claro de 2 px. Sprite de 56×74
píxeles (con espacio arriba para el paracaídas y abajo para las llamas) escalado sin suavizado. Al hacer scroll:
paracaídas de gajos blanco y gris al bajar, jetpack gris con llamas amarillas y naranjas al subir, y estela de
escarcha (chispas blancas y celestes) en ambos casos. Efectos en glifos de píxel (corazones, notas, estrellas,
monedas, z, ?, !) en negro sobre fondo claro y en blanco sobre fondo oscuro.
