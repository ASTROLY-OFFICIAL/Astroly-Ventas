# astroly · tienda en línea (diseño e interfaz)

Prototipo navegable de la tienda: **inicio y catálogo en un solo recorrido**, ficha de producto y carrito.
Paleta zafiro profundo (60 %), blanco perla (30 %) y naranja brasa (10 %), esquinas rectas, tipografías Urbanist y
Geist Mono del kit de Astroly, un producto destacado en 3D en la portada y un gato como mascota.

Publicada en https://astrolytienda.vercel.app: cada cambio que entra a `main` se publica solo.

**Antes de trabajar en el repositorio (personas o IA), lee [AGENTS.md](AGENTS.md) y [CONTEXTO.md](CONTEXTO.md).**

## Cómo verla

Requiere Node.js 18 o superior.

```powershell
cd C:\ASTROLY\TIENDA
node server.mjs
```

Abre http://127.0.0.1:4180. (Con doble clic sobre `index.html` no carga: los módulos necesitan un servidor.)

## Páginas

- Barra lateral en todas las páginas (abajo en celular): **Inicio**, **Categoría** (buscador con resultados en vivo
  y lista de categorías), **Tú** (cuenta) y **Carrito** (abre el panel; también se le pueden arrastrar productos).
  Moneda COP/USD y tema claro/oscuro al pie de la barra (arriba en celular).
- `index.html`: portada simple (título a la izquierda, lámpara destacada en 3D a la derecha), fila de novedades
  y catálogo con búsqueda, filtros por categoría, precio y tono, y orden.
- `producto.html?id=…`: vistas Frente / Detalle / De noche, tonos, cantidad, favoritos y relacionados.
- `cuenta.html`: el cliente diligencia sus datos (personales y dirección de envío en Colombia), ve sus favoritos y sus pedidos.
- `carrito.html`: líneas con cantidad, resumen, moneda y pago.

Del kit de diseño de Astroly se usan los colores, las tipografías y los efectos (vidrio, tarjetas blancas, movimiento);
la composición es de tienda, con textos cortos para que la atención quede en los productos.

## La mascota

Un gato de casa en vector (blanco perla con collar naranja brasa). Código en `assets/js/mascota.js`.

- No sale en la portada. Al bajar entra de un salto y se sienta abajo a la derecha; camina en su sitio mientras haces
  scroll y se sienta al parar. En el pie se sienta sobre el borde y saluda.
- Catálogo: salta y suelta corazones al agregar, se pone triste al quitar, ojos de corazón con favoritos, mira con
  curiosidad lo que señalas, lee mientras buscas y se confunde sin resultados.
- Producto: lupa en la vista Detalle, sueño en la vista De noche. Cuenta: mira el teclado mientras escribes, te saluda
  por tu nombre y niega con la cabeza si falta un dato. Pago: baila.
- Tema claro: gafas de sol. Moneda: se marea. Tocarlo: ronronea o saluda; muchos toques: se marea.
- 14 s sin actividad: se acicala. 30 s: se duerme enroscado. Cualquier acción lo despierta.
- Consola: `astrolyMascot.idle(31)` (dormir) o `astrolyMascot.react('add')`.

## Lo que reemplaza tu socio

- `assets/js/data.js`: productos, colecciones, redes (`CONFIG.socials`: los usuarios y enlaces son provisionales)
  y la tasa `usdRate` de la vista previa.
- Las ilustraciones isométricas de `assets/js/art.js` ocupan el lugar de las fotos: con fotos reales, la tarjeta
  usa un `<img>` en el mismo contenedor.
- Los textos de medidas, envío, cambios y cuidados de la ficha son espacios a completar.

## Paso a Shopify

La cuenta de Shopify ya existe; el siguiente paso es convertir esto en un tema (Online Store 2.0):

- Barra lateral, panel de Categoría, pie y panel del carrito → `sections/sidebar.liquid`, `snippets/search.liquid`, `footer.liquid`, `snippets/cart-drawer.liquid`.
- Inicio → secciones editables desde el personalizador (portada, novedades, catálogo); el catálogo usa los filtros de Shopify (Search & Discovery).
- Cuenta → cuentas de cliente de Shopify (datos, direcciones y pedidos).
- Tarjeta de producto → `snippets/product-card.liquid`; ficha → `sections/main-product.liquid` (los tonos serán variantes).
- `assets/js/store.js` ya agrupa el carrito en `add / setQty / remove`: se cambian por la Ajax API (`/cart/add.js`, `/cart/change.js`).
- Moneda: Shopify Markets con COP y USD; el selector cambia el mercado en vez de calcular con `usdRate`.
- Pago: el botón lleva a `/checkout` (pasarela de Shopify). Por eso aquí solo muestra un aviso.
- La mascota, el 3D y las ilustraciones pasan tal cual como archivos de `assets/`.

## Archivos

- `assets/css/tienda.css`: todo el estilo (paleta, temas, móvil compacto, movimiento reducido).
- `assets/js/`: `ui.js` (piezas compartidas), `home.js`, `producto.js`, `carrito.js`, `cuenta.js`, `store.js`, `data.js`,
  `art.js`, `mascota.js`, `lamp3d.js` (lámpara 3D de la portada).
- `assets/vendor/`: three.js (licencia MIT). `assets/fonts/`: Urbanist y Geist Mono. `assets/img/`: isotipos.
- Colaboración: `AGENTS.md` (reglas), `CONTEXTO.md` (memoria y resumen de decisiones), `CONTRIBUTING.md` (paso a paso),
  `DESIGN.md` (sistema visual), `PRODUCT.md` (qué es la tienda), `INSTRUCCIONES_OTRA_IA.md` y las plantillas de `.github/`.
