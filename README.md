# astroly · tienda en línea (diseño e interfaz)

Prototipo navegable de la tienda: **inicio y catálogo en un solo recorrido**, ficha de producto y carrito.
Usa el kit de diseño de Astroly (Urbanist y Geist Mono, lienzo gris o negro, bandas invertidas, palabras
gigantes, vidrio, tarjetas blancas, isotipo 3D y entradas palabra por palabra) y la mascota de 8 bits.

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
- `index.html`: portada compacta (título a la izquierda, redes a la derecha con la mascota encima), fila de novedades
  y catálogo con búsqueda, filtros por categoría, precio y tono, y orden.
- `producto.html?id=…`: vistas Frente / Detalle / De noche, tonos, cantidad, favoritos y relacionados.
- `cuenta.html`: el cliente diligencia sus datos (personales y dirección de envío en Colombia), ve sus favoritos y sus pedidos.
- `carrito.html`: líneas con cantidad, resumen, moneda y pago.

Del kit de diseño de Astroly se usan los colores, las tipografías y los efectos (vidrio, tarjetas blancas, movimiento);
la composición es de tienda, con textos cortos para que la atención quede en los productos.

## La mascota

Es el isotipo convertido en araña: el triángulo es el cuerpo y el hueco circular es el ojo. Código en `assets/js/mascota.js`.

- Primera visita: el isotipo 3D gira sobre la tarjeta de redes y se vuelve la araña, que saluda según la hora.
- Al bajar, lanza su hilo y cuelga a la derecha. Mientras haces scroll se desliza por la telaraña (agarrada al hilo)
  y cuando paras se queda a esa altura. Solo se baja del hilo en la portada o en el pie de página.
- Catálogo: celebra al agregar, se pone triste al quitar, ojos de corazón con favoritos, cambia de tono con brillo,
  mira con curiosidad el producto bajo el cursor, lee mientras buscas y se confunde sin resultados.
- Producto: lupa en la vista Detalle, se adormece en la vista De noche, cuenta monedas al subir la cantidad.
- Cuenta: "escribe" mientras llenas el formulario, te saluda por tu nombre, niega con la cabeza si falta un dato y
  celebra al guardar.
- Carrito y pago: baila al pagar; con el carrito vacío baja grande al centro.
- Tema claro: lentes de sol; oscuro: se adormece. Moneda: se marea con monedas. Tocarla: saluda; muchos toques: se marea.
- 14 s sin actividad: teje una telaraña. 30 s: se duerme con Z. Cualquier acción la despierta de un susto.
- Prueba en la consola del navegador: `astrolyMascot.idle(31)` (dormir) o `astrolyMascot.react('add')`.

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
  `art.js`, `mascota.js`, `hero3d.js`.
- `assets/vendor/`: three.js (licencia MIT). `assets/fonts/`: Urbanist y Geist Mono. `assets/img/`: isotipos.
