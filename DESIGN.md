# Sistema visual de la tienda astroly

Lo que renderiza hoy `assets/css/tienda.css`. Si cambias una decisión, actualiza este archivo y `CONTEXTO.md`.

## Paleta 60·30·10

| Token | Valor | Uso |
| --- | --- | --- |
| `--sapphire` | `#0f2d5e` zafiro profundo | Lienzo, portada, cuerpo de las tarjetas (60 %) |
| `--sapphire-hi` / `-lo` / `-deep` | `#183d78` / `#0a2148` / `#071a3a` | Degradados, texto sobre perla, tema noche |
| `--pearl` | `#f3f0e8` blanco perla | Texto sobre zafiro, logo del menú, pie, panel del destacado, collar del gato (30 %) |
| `--page` / `--menu` | `#0a2149` / zafiro | Fondo de página un tono más oscuro que el menú para que la barra se distinga (noche: `#061530` / `#0d2a58`) |
| `--pearl-hi` / `-lo` | `#f8f6f1` / `#e1dccf` | Fondo de las imágenes de producto / rellenos suaves |
| `--ember` | `#d2461a` naranja brasa | Acentos (10 %): botones de portada y pago, ítem activo, contador, chips activos, insignias, estrellas, aro de la lámpara, cuerpo del gato |
| `--ember-hi` | `#ff7a45` | Naranja para líneas, foco y detalles finos sobre zafiro (contraste) |

Sobre naranja brasa el texto va en blanco. `.band` pone una zona en perla con texto zafiro (el pie). La barra lateral va en `--menu` con el logo en perla.
Tema "noche" (`data-theme="dark"`, en `localStorage astroly-theme`): el lienzo pasa a `--sapphire-deep`.

Los tonos de producto (Blanco, Grafito, Perla, Hueso) y las ilustraciones de `art.js` representan el producto, no la
interfaz: no se pintan con la paleta.

## Forma

- Radios: `--card-r` 4 px, `--pill` 3 px, `--radius-sm` 2 px. Íconos, favoritos y muestras de tono son cuadrados con
  esquina de 3 px. No usar círculos ni píldoras nuevos.
- Vidrio (`--glass`, `--glass-edge`, `--glass-shadow`) teñido de perla sobre el zafiro para tarjetas y paneles.

## Tipografía y movimiento

- Urbanist (texto) y Geist Mono (precios, etiquetas técnicas, globos de la mascota), en `assets/fonts/`.
- h1 entre 26 y 36 px, h2 entre 19 y 22 px. Textos cortos.
- Curva `cubic-bezier(.23,1,.32,1)`. Respetar `prefers-reduced-motion`.

## Portada y producto destacado

Tarjeta zafiro con título a la izquierda y la lámpara 3D mate (three.js, `lamp3d.js`) a la derecha. El lienzo 3D
sobresale por encima de la tarjeta (`--pop`). Esquema de piezas en SVG: puntos naranja, líneas y textos en Geist Mono.
La lámpara es una luna: texturas propias de color, relieve y brillo (`assets/img/luna-*.jpg`), base de madera con aro
naranja, halo cálido. Debajo, panel perla con recuadro desplazado y tarjetas zafiro con números que suben.

## Mascota

Gato de casa en 8 bits (`mascota.js`): lienzo de 36×40 escalado con `image-rendering: pixelated`, cuerpo naranja
brasa con sombra a la derecha, panza y patas en naranja claro, contorno grueso zafiro, collar blanco perla con
cascabel dorado. Efectos en glifos de píxel (corazones, notas, estrellas, monedas en naranja; z, ? y ! en perla).
