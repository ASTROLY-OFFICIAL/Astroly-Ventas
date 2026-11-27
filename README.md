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

- `index.html`: portada con la mascota y las redes → enunciado → novedades (riel horizontal que avanza con el
  scroll) → colecciones (banda invertida con vista previa) → catálogo con búsqueda, filtros y orden → redes → pie.
- `producto.html?id=…`: vistas Frente / Detalle / De noche, giro con el cursor, tonos, cantidad, favoritos y relacionados.
- `carrito.html`: líneas con cantidad, resumen, moneda y pago. Vacío, la mascota baja grande al centro.
- En todas: dock del carrito abajo a la derecha (también se le pueden arrastrar productos), panel lateral del carrito,
  moneda COP/USD y tema claro/oscuro, recordados entre visitas.

## La mascota

Es el isotipo convertido en araña: el triángulo es el cuerpo y el hueco circular es el ojo. Código en `assets/js/mascota.js`.

- Primera visita: el isotipo 3D gira, se disuelve y la araña se arma píxel a píxel, saluda según la hora.
- Viaja de la portada al dock al bajar, y cuelga de su hilo cuando se hace scroll.
- Añadir al carrito: salta y celebra con confeti. Subir cantidad: moneda. Quitar: se pone triste y llora.
- Favorito: ojos de corazón. Moneda: se marea con monedas. Tema claro: lentes de sol; oscuro: se adormece.
- Pasar el cursor por un producto: lo mira con curiosidad y a veces pregunta. Buscar: lee. Sin resultados: se confunde.
- Pagar: baila con notas. Tocarla: saluda; muchos toques seguidos: se marea.
- 14 s sin actividad: teje una telaraña. 30 s: se duerme con Z. Cualquier acción la despierta de un susto.
- Volver a la pestaña después de un rato: "¡Volviste!".
- Prueba en la consola del navegador: `astrolyMascot.idle(31)` (dormir) o `astrolyMascot.react('add')`.

## Lo que reemplaza tu socio

- `assets/js/data.js`: productos, colecciones, redes (`CONFIG.socials`: los usuarios y enlaces son provisionales)
  y la tasa `usdRate` de la vista previa.
- Las ilustraciones isométricas de `assets/js/art.js` ocupan el lugar de las fotos: con fotos reales, la tarjeta
  usa un `<img>` en el mismo contenedor.
- Los textos de medidas, envío, cambios y cuidados de la ficha son espacios a completar.

## Paso a Shopify

La cuenta de Shopify ya existe; el siguiente paso es convertir esto en un tema (Online Store 2.0):

- Cabecera, pie, dock y panel del carrito → `sections/header.liquid`, `footer.liquid`, `snippets/cart-drawer.liquid`.
- Inicio → secciones editables desde el personalizador (portada, enunciado, novedades, colecciones, catálogo).
- Tarjeta de producto → `snippets/product-card.liquid`; ficha → `sections/main-product.liquid` (los tonos serán variantes).
- `assets/js/store.js` ya agrupa el carrito en `add / setQty / remove`: se cambian por la Ajax API (`/cart/add.js`, `/cart/change.js`).
- Moneda: Shopify Markets con COP y USD; el selector cambia el mercado en vez de calcular con `usdRate`.
- Pago: el botón lleva a `/checkout` (pasarela de Shopify). Por eso aquí solo muestra un aviso.
- La mascota, el 3D y las ilustraciones pasan tal cual como archivos de `assets/`.

## Archivos

- `assets/css/tienda.css`: todo el estilo (tokens del kit, temas, móvil compacto, movimiento reducido).
- `assets/js/`: `ui.js` (piezas compartidas), `home.js`, `producto.js`, `carrito.js`, `store.js`, `data.js`,
  `art.js`, `mascota.js`, `hero3d.js`.
- `assets/vendor/`: three.js (licencia MIT). `assets/fonts/`: Urbanist y Geist Mono. `assets/img/`: isotipos.
