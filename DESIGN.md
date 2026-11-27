# Sistema visual de la tienda astroly

Lo que renderiza hoy `assets/css/tienda.css`. Si cambias una decisión, actualiza este archivo y `CONTEXTO.md`.

## Paleta 60·30·10

| Token | Valor | Uso |
| --- | --- | --- |
| `--ivory` | `#ebe3d0` marfil antiguo | Lienzo (60 %) |
| `--ivory-hi` | `#f6f1e6` | Fondo de las imágenes de producto, globos de la mascota |
| `--ivory-lo` | `#d9cfb8` | Rellenos suaves |
| `--piano` | `#0f0f11` negro piano | Texto, barra lateral, pie, botón Agregar (30 %) |
| `--surf` | `#2bb3b1` turquesa surf | Acentos (10 %): ítem activo, contador del carrito, chips activos, insignias, botones de portada y pago, foco, selección |
| `--surf-ink` | `#0f6e6c` | Turquesa para texto o íconos sobre marfil (contraste) |

Sobre turquesa el texto va en negro piano (`--on-surf`). Tema oscuro (`data-theme="dark"`, guardado en
`localStorage astroly-theme`): lienzo negro piano, texto marfil, barra lateral y pie en marfil; el turquesa no cambia.
`.band` invierte los colores en una zona (barra lateral y pie la usan).

Los tonos de producto (Blanco, Grafito, Perla, Hueso) y las ilustraciones de `art.js` representan el producto, no la
interfaz: no se pintan con la paleta.

## Forma

- Radios: `--card-r` 4 px, `--pill` 3 px, `--radius-sm` 2 px. Íconos, favoritos y muestras de tono son cuadrados con
  esquina de 3 px. No usar círculos ni píldoras nuevos.
- Vidrio (`--glass`, `--glass-edge`, `--glass-shadow`) teñido de marfil para portada, tarjetas y paneles.

## Tipografía y movimiento

- Urbanist (texto) y Geist Mono (precios, etiquetas técnicas, globos de la mascota), en `assets/fonts/`.
- h1 entre 26 y 36 px, h2 entre 19 y 22 px. Textos cortos.
- Curva `cubic-bezier(.23,1,.32,1)`. Respetar `prefers-reduced-motion`.

## Mascota

Araña de 8 bits (`mascota.js`): cuerpo negro piano, ojo marfil, efectos (corazones, chispas, monedas) en turquesa.
Sobre fondos oscuros cambia sola a patas claras.
