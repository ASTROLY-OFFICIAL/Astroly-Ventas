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

- **Paleta 60·30·10:** marfil antiguo `#ebe3d0` (60 %), negro piano `#0f0f11` (30 %), turquesa surf `#2bb3b1`
  (10 %, solo acentos: activo, botones de pago y portada, insignias, foco, selección). Tema oscuro: se invierten
  marfil y negro; el turquesa sigue de acento. Detalle en `DESIGN.md`.
- **Esquinas rectas:** radios de 2 a 4 px en tarjetas, botones, chips, campos y paneles. No volver a formas de píldora.
- **Catálogo primero:** textos cortos y títulos pequeños; sin palabras gigantes de fondo. Del kit de Astroly solo se
  usan tipografías (Urbanist, Geist Mono) y efectos (vidrio, movimiento); no su composición de landing.
- **Navegación:** barra lateral (abajo en celular) con Inicio, Categoría (buscador), Tú (cuenta) y Carrito.
- **Portada compacta:** título a la izquierda, redes a la derecha y la mascota sentada sobre la tarjeta de redes.
- **Mascota:** araña de 8 bits hecha del isotipo (triángulo = cuerpo, hueco = ojo). Reacciona a lo que hace el cliente
  (agregar, favoritos, filtros, formulario, etc.), se duerme sin actividad, se desliza por su hilo al hacer scroll y se
  queda a esa altura; solo baja en la portada y en el pie. Código en `assets/js/mascota.js`.
- Móvil según las reglas compactas de Astroly: portada en una pantalla, cuadrícula de 2 columnas, chips con scroll
  horizontal, un solo elemento flotante, márgenes de 16 px.

## Pendientes

- Usuarios reales de redes sociales (hoy `@astroly.ventas` es provisional).
- Productos, fotos, precios y textos reales (los carga el socio).
- Conversión a tema de Shopify, Markets (COP/USD) y checkout.

## Registro de sesiones

- **2026-11-27 · Santiago · rama `paleta-marfil`:** paleta marfil antiguo / negro piano / turquesa surf en todos los
  elementos y en la mascota; esquinas rectas (2–4 px); barra lateral en negro piano. Se agregó este sistema de
  memoria (`AGENTS.md`, `CONTEXTO.md`, `CONTRIBUTING.md`, plantillas) copiado del landing de Astroly.
- **2026-11-26 · Santiago · PR #1 (integrado):** rediseño v2: catálogo tipo tienda, barra lateral, página de cuenta,
  portada compacta, mascota más gruesa con hilo de telaraña. Publicado en Vercel.
- **2026-11-26 · Santiago:** primera versión (inicio y catálogo en un recorrido, ficha, carrito, mascota e intro 3D).

## Historia resumida

(Vacío por ahora.)
