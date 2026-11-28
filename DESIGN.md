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

## Forma

- Redondeado suave: `--card-r` 20 px en tarjetas, `--radius` 10 px, `--radius-sm` 8 px, botones y chips en píldora
  (`--pill`).

## Tipografía y movimiento

- Urbanist (texto) y Geist Mono (precios, etiquetas técnicas, globos de la mascota), en `assets/fonts/`.
- Textos cortos y títulos pequeños: la atención va a los productos.
- Curva `cubic-bezier(.23,1,.32,1)`. Respetar `prefers-reduced-motion`.

## Portada

Tarjeta de vidrio compacta: título a la izquierda y, a la derecha, la tarjeta de redes con la mascota sentada encima.
En la primera visita el isotipo 3D (`hero3d.js`) gira sobre esa tarjeta y se convierte en la mascota.

## Mascota: Astro

Estrellita de 8 bits (`mascota.js`): estrella gordita de cinco puntas en blanco con sombra gris, contorno negro de
2 px, ojos negros con brillo y mejillas rosadas cuando está contenta. Sprite de 56×48 píxeles escalado sin suavizado.
La punta de arriba es la cabeza, las de los lados los brazos y las de abajo las piernas: se mueven para saludar,
celebrar, leer, pintar o agarrarse del hilo. Efectos en glifos de píxel (corazones, notas, estrellas, monedas, z, ?,
!) en negro sobre fondo claro y en blanco sobre fondo oscuro.
