# Contexto compartido de la tienda astroly

Memoria del proyecto. Se lee al empezar y se actualiza al terminar cada tarea (reglas en `AGENTS.md`).

## Qué es

Tienda en línea de dropshipping de Santiago y su socio, bajo la marca Astroly. En la web se llama solo **astroly**;
en redes es **astroly ventas**. Nicho inicial: productos decorativos para el hogar, sin que la tienda se vea limitada
a eso. Mercado: Colombia, en español, precios en COP o USD a elección del cliente, pago en línea con precio fijo
(no cotizaciones).

## Estado actual

- Prototipo estático (HTML, CSS y módulos JS) listo para convertirse en tema de Shopify (Online Store 2.0).
  La cuenta de Shopify ya existe. Ver "Paso a Shopify" en `README.md`.
- Publicado en https://astrolytienda.vercel.app desde `main` (despliegue automático de Vercel).
- Repositorio privado dentro de una organización; el socio colabora con su propia cuenta.
- Páginas: inicio + catálogo (`index.html`), producto, carrito y cuenta.

## Decisiones vigentes

- **Paleta 60·30·10:** zafiro profundo `#0f2d5e` (60 %: lienzo, portada y tarjetas), blanco perla `#f3f0e8`
  (30 %: texto, fondo de las imágenes de producto, barra lateral y pie) y naranja brasa `#d2461a` (10 %, solo acentos:
  página activa, contador del carrito, filtros elegidos, insignias, estrellas, botones de portada y de pago). El tema
  "noche" oscurece el zafiro (`#071a3a`). Detalle en `DESIGN.md`. Reemplaza a la paleta marfil/negro/turquesa.
- **Esquinas rectas:** radios de 2 a 4 px en tarjetas, botones, chips, campos y paneles. No volver a formas de píldora.
- **Catálogo primero:** textos cortos y títulos pequeños; sin palabras gigantes de fondo. Del kit de Astroly solo se
  usan tipografías (Urbanist, Geist Mono) y efectos (vidrio, movimiento); no su composición de landing.
- **Navegación:** barra lateral (abajo en celular) con Inicio, Categoría (buscador), Tú (cuenta) y Carrito. La barra va
  en zafiro (`--menu`) sobre una página un tono más oscura (`--page`) para que se distinga, con el logo en blanco perla.
- **Portada simple:** título a la izquierda y, a la derecha, el producto destacado en 3D mate (`assets/js/lamp3d.js`,
  la Lámpara Luna: luna con relieve y cráteres sobre base de madera con imán) que sobresale de la tarjeta (efecto pop-out), levita y se desarma en piezas con sus nombres como un
  esquema; el botón "Ver piezas" fija el esquema. Debajo: un panel perla con recuadro de fondo desplazado: nombre, precio, Agregar y tres
  tarjetas (calificación con estrellas, unidades vendidas y reseñas) cuyos números suben al aparecer. Está oculto
  (`showStats: false` en `CONFIG.featured`, `data.js`) hasta tener ventas reales; las cifras actuales son de ejemplo.
  Las redes sociales están solo en el pie. La mascota no aparece en la portada.
- **Mascota:** gato de casa en 8 bits (naranja brasa, collar blanco perla con cascabel, contorno grueso zafiro),
  dibujado píxel a píxel en un lienzo de 36×40 en `assets/js/mascota.js`. Reemplaza a la araña y al gato en vector.
  No aparece en la portada del inicio: al bajar entra de un salto y se sienta abajo a la derecha;
  camina en su sitio mientras haces scroll y se sienta al parar; en el pie se sienta sobre el borde. Reacciona a lo que
  hace el cliente (agregar, favoritos, filtros, búsqueda, formulario, tema, moneda, pago), sigue el cursor con la
  mirada, ronronea si lo tocas, se acicala a los 14 s sin actividad y se duerme enroscado a los 30 s.
- Móvil según las reglas compactas de Astroly: portada en una pantalla, cuadrícula de 2 columnas, chips con scroll
  horizontal, un solo elemento flotante, márgenes de 16 px.

## Pendientes

- **Ventas y calificación del destacado son datos de ejemplo** (`CONFIG.featured` en `data.js`). No integrar a
  `main` (que se publica) presentándolos como reales; en Shopify salen de las ventas y de la app de reseñas.
- Usuarios reales de redes sociales (hoy `@astroly.ventas` es provisional).
- Productos, fotos, precios y textos reales (los carga el socio).
- Conversión a tema de Shopify, Markets (COP/USD) y checkout.

## Registro de sesiones

- **2026-11-27 · Santiago · rama `portada-zafiro` (2.ª tanda):** la lámpara pasa a ser una lámpara luna realista
  (texturas de relieve, cráteres y brillo propias en `assets/img/luna-*.jpg`, base de madera, halo cálido); panel de
  datos con recuadro de fondo y números que suben; gato en 8 bits naranja brasa con collar perla y contorno grueso
  (mismas reacciones, efectos en píxeles); menú en zafiro sobre una página más oscura y logo en blanco perla. Por decisión de Santiago, el panel de cifras
  queda oculto (`showStats: false` en `data.js`) hasta tener ventas y reseñas reales.
- **2026-11-27 · Santiago · rama `portada-zafiro`:** portada nueva con la lámpara 3D mate (levita, se desarma en
  esquema de piezas, pop-out) y ventas/calificación de ejemplo; paleta zafiro profundo / blanco perla / naranja brasa;
  la araña se reemplazó por un gato de casa en vector (elegido por Santiago entre mochi, gato y planetita). Se retiró la
  intro 3D del isotipo (`hero3d.js`).
- **2026-11-27 · Santiago · rama `paleta-marfil`:** paleta marfil antiguo / negro piano / turquesa surf en todos los
  elementos y en la mascota; esquinas rectas (2–4 px); barra lateral en negro piano. Se agregó este sistema de
  memoria (`AGENTS.md`, `CONTEXTO.md`, `CONTRIBUTING.md`, plantillas) copiado del landing de Astroly.
- **2026-11-26 · Santiago · PR #1 (integrado):** rediseño v2: catálogo tipo tienda, barra lateral, página de cuenta,
  portada compacta, mascota más gruesa con hilo de telaraña. Publicado en Vercel.
- **2026-11-26 · Santiago:** primera versión (inicio y catálogo en un recorrido, ficha, carrito, mascota e intro 3D).

## Historia resumida

(Vacío por ahora.)
