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
- Publicado en https://astrolytienda.vercel.app. Desde que el repositorio pasó a una organización privada, Vercel
  (plan Hobby) ya no despliega solo desde `main`: se publica a mano con `vercel --prod` desde `C:\ASTROLY\TIENDA`.
- Repositorio privado dentro de una organización; el socio colabora con su propia cuenta.
- Páginas: inicio + catálogo (`index.html`), producto, carrito y cuenta.

## Decisiones vigentes

- **Sistema de diseño de la v2** (decidido por Santiago el 2026-11-27 tras probar otras paletas): lienzo gris
  `#979797` (negro en tema noche), texto negro, bandas invertidas, vidrio y tarjetas de producto blancas. Desde el
  2026-11-28 con esquinas menos curvas (tarjetas de 8 px, botones y chips de 6–8 px) y densidad de tienda grande tipo
  Temu o AliExpress: 6 columnas en escritorio y 2 en celular, tarjetas juntas, nombre en dos líneas, precio
  destacado, barra de búsqueda y filtros fija al bajar y carga continua al llegar al final. Detalle en `DESIGN.md`.
  Las paletas marfil/negro/turquesa y zafiro/perla/brasa, la lámpara luna 3D y el gato se descartaron; están en el
  historial de git si se quieren retomar.
- **Catálogo primero:** textos cortos y títulos pequeños; sin palabras gigantes de fondo. Del kit de Astroly se
  usan tipografías (Urbanist, Geist Mono), color monocromo y efectos (vidrio, movimiento); no su composición de landing.
- **Navegación:** barra lateral (abajo en celular) con Inicio, Categoría (buscador), Tú (cuenta) y Carrito.
- **Portada compacta y general:** título "Encuentra lo que buscas" (no encierra la tienda en un nicho) y, a la derecha,
  una escena en 8 bits (`assets/js/escena.js`): Astro busca en tres cajas, en la tercera encuentra una lámpara que se
  enciende y se despliega la promoción (`CONFIG.promo` en `data.js`: producto, etiqueta y oferta opcional; no se
  inventan descuentos). Ya no hay tarjeta de redes ni intro 3D del isotipo; las redes están en el pie.
- **Mascota: Astro, una estrellita de 8 bits** (elegida por Santiago entre estrellita, cubito y gotita), en
  `assets/js/mascota.js`. Totalmente negra con ojos blancos; sus puntas son cabeza, brazos y piernas. No sale mientras
  se ve la escena de la portada. Al bajar flota a la derecha; al hacer scroll se vuelve estrella fugaz con estela de
  escarcha: con paracaídas si bajas y con jetpack si subes. Se sienta sobre el pie y en el carrito vacío. Reacciona a
  lo que hace el cliente, sigue el cursor con la mirada, a los 14 s sin actividad une estrellas y a los 30 s se duerme.
- Móvil según las reglas compactas de Astroly: portada en una pantalla, cuadrícula de 2 columnas, chips con scroll
  horizontal, un solo elemento flotante, márgenes de 16 px.

## Pendientes

- Usuarios reales de redes sociales (hoy `@astroly.ventas` es provisional).
- Productos, fotos, precios y textos reales (los carga el socio).
- Conversión a tema de Shopify, Markets (COP/USD) y checkout.

## Registro de sesiones

- **2026-11-28 · Santiago · rama `diseno-v2` (2.ª tanda):** catálogo más denso tipo marketplace y esquinas menos
  curvas; Astro pasa a negra con ojos blancos, sin hilo: escarcha, paracaídas al bajar y jetpack al subir; portada
  compacta con título general y escena 8 bits de las cajas con la promoción. Se retiraron `hero3d.js` y three.js.
  El tema de Shopify del socio (1.1.0, zafiro) todavía no tiene estos cambios.
- **2026-11-28 · Santiago · rama `diseno-v2`:** vuelta al sistema de diseño de la v2 (gris/negro, vidrio, bordes
  redondeados, portada con tarjeta de redes e intro del isotipo). La mascota pasa a ser Astro, una estrellita de
  8 bits que cuelga de su hilo. Se quitaron la lámpara luna, el panel de cifras y el gato.
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
