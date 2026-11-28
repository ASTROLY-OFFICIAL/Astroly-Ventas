# astroly · tienda en línea (diseño e interfaz)

Prototipo navegable de la tienda: **inicio y catálogo en un solo recorrido**, ficha de producto y carrito.
Usa el kit de diseño de Astroly (Urbanist y Geist Mono, lienzo gris o negro, bandas invertidas, palabras
gigantes, vidrio y tarjetas blancas) y Astro, la estrellita de 8 bits.

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
- `index.html`: portada compacta (título general a la izquierda, escena 8 bits de Astro y promoción a la derecha), fila de novedades
  y catálogo con búsqueda, filtros por categoría, precio y tono, y orden.
- `producto.html?id=…`: vistas Frente / Detalle / De noche, tonos, cantidad, favoritos y relacionados.
- `cuenta.html`: el cliente diligencia sus datos (personales y dirección de envío en Colombia), ve sus favoritos y sus pedidos.
- `carrito.html`: líneas con cantidad, resumen, moneda y pago.

Del kit de diseño de Astroly se usan los colores, las tipografías y los efectos (vidrio, tarjetas blancas, movimiento);
la composición es de tienda, con textos cortos para que la atención quede en los productos.

## La mascota

Es **Astro**, una estrellita de 8 bits negra con ojos blancos: sus puntas son la cabeza, los brazos y las piernas.
Código en `assets/js/mascota.js`; la escena de la portada está en `assets/js/escena.js`.

- Portada: Astro busca entre cajas; en la tercera encuentra una lámpara y se despliega la promoción (`CONFIG.promo`).
- Al bajar flota a la derecha. Con el scroll se vuelve estrella fugaz: paracaídas al bajar, jetpack al subir, con
  estela de escarcha. En el pie se sienta sobre el borde; con el carrito vacío baja grande al centro.
- Catálogo: celebra al agregar, se pone triste al quitar, ojos de corazón con favoritos, cambia de tono con brillo,
  mira con curiosidad el producto bajo el cursor, lee mientras buscas y se confunde sin resultados.
- Producto: lupa en la vista Detalle, se adormece en la vista De noche. Cuenta: "escribe" mientras llenas el
  formulario, te saluda por tu nombre y niega si falta un dato. Pago: baila.
- Tema claro: lentes de sol. Moneda: se marea con monedas. Tocarla: saluda; muchos toques: se marea.
- 14 s sin actividad: une estrellas en una constelación. 30 s: se duerme. Cualquier acción la despierta.
- Consola: `astrolyMascot.fly(1)` (paracaídas), `astrolyMascot.fly(-1)` (jetpack), `astrolyMascot.idle(31)` (dormir).

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

- `assets/css/tienda.css`: todo el estilo (tokens del kit, temas, móvil compacto, movimiento reducido).
- `assets/js/`: `ui.js` (piezas compartidas), `home.js`, `producto.js`, `carrito.js`, `cuenta.js`, `store.js`, `data.js`,
  `art.js`, `mascota.js`, `escena.js`.
- `assets/fonts/`: Urbanist y Geist Mono. `assets/img/`: isotipos.
