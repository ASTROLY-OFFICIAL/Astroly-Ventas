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
- `index.html`: portada compacta con producto protagonista, precio y mascota, fila de novedades
  y catálogo con búsqueda, filtros por categoría, precio y tono, y orden.
- `producto.html?id=…`: vistas Frente / Detalle / De noche, tonos, cantidad, favoritos y relacionados.
- `cuenta.html`: muestra los favoritos locales de la vista previa.
- `carrito.html`: líneas con cantidad, resumen, moneda y pago.

Del kit de diseño de Astroly se usan los colores, las tipografías y los efectos (vidrio, tarjetas blancas, movimiento);
la composición es de tienda, con textos cortos para que la atención quede en los productos.

## La mascota

Es el isotipo convertido en araña: el triángulo es el cuerpo y el hueco circular es el ojo. Código en `assets/js/mascota.js`.

- Primera visita: el isotipo 3D gira junto al producto protagonista y se vuelve la araña, que saluda según la hora.
- Al bajar, lanza su hilo y cuelga a la derecha. Mientras haces scroll se desliza por la telaraña (agarrada al hilo)
  y cuando paras se queda a esa altura. Solo se baja del hilo en la portada o en el pie de página.
- Catálogo: celebra al agregar, se pone triste al quitar, ojos de corazón con favoritos, cambia de tono con brillo,
  mira con curiosidad el producto bajo el cursor, lee mientras buscas y se confunde sin resultados.
- Producto: lupa en la vista Detalle, se adormece en la vista De noche, cuenta monedas al subir la cantidad.
- Carrito y pago: baila al pagar; con el carrito vacío baja grande al centro.
- Tema claro: lentes de sol; oscuro: se adormece. Moneda: se marea con monedas. Tocarla: saluda; muchos toques: se marea.
- 14 s sin actividad: teje una telaraña. 30 s: se duerme con Z. Cualquier acción la despierta de un susto.
- Prueba en la consola del navegador: `astrolyMascot.idle(31)` (dormir) o `astrolyMascot.react('add')`.

## Lo que reemplaza tu socio

- `assets/js/data.js`: productos, colecciones, redes (`CONFIG.socials`: los usuarios y enlaces son provisionales)
  y la tasa `usdRate` de la vista previa.
- Las ilustraciones isométricas de `assets/js/art.js` ocupan el lugar de las fotos: con fotos reales, la tarjeta
  usa un `<img>` en el mismo contenedor.
- En el tema, las fotos y la descripción salen del producto publicado. Las medidas se toman del metacampo opcional `custom.medidas` y las condiciones de envío y cambios de las políticas de Shopify.

## Instalar en Shopify

Descarga [el tema de Astroly](dist/astroly-ventas-shopify.zip) y súbelo a la biblioteca de temas en **Tienda online → Temas → Importar tema → Subir archivo zip**. También puedes usar la dirección `myshopify.com` asignada por Shopify. Abre **Vista previa** y elige el producto protagonista en la sección Portada Astroly.

El tema Liquid muestra los productos, variantes, precios, fotos, políticas y disponibilidad de esa tienda. En el catálogo se puede elegir una variante y abrir su ficha con el color seleccionado. La forma de compra añade su ID real al carrito, el panel lateral recibe el resumen de Shopify y la página de carrito permite cambiar cantidades y pasar al checkout. Las cuentas de cliente se enlazan cuando están habilitadas. El HTML estático de Vercel sigue siendo una demostración independiente.

Para verificar el recorrido, publica un producto en el canal Tienda online con dos colores y sus fotos. En la vista previa, selecciona el segundo color, abre la ficha, añade dos unidades, cambia la cantidad y comprueba el total en el checkout. Para verificar también la creación del pedido y la notificación, usa la [guía de pedidos de prueba](https://help.shopify.com/en/manual/checkout-settings/test-orders).

Las fuentes están en `shopify/`. El empaquetador reutiliza el CSS, las tipografías, el isotipo y la mascota de la interfaz estática. Desde la raíz:

```sh
python3 scripts/empaquetar-tema.py --directorio /tmp/astroly-theme
shopify theme check --path /tmp/astroly-theme
```

## Archivos

- `assets/css/tienda.css`: todo el estilo (tokens del kit, temas, móvil compacto, movimiento reducido).
- `assets/js/`: `ui.js` (piezas compartidas), `home.js`, `producto.js`, `carrito.js`, `cuenta.js`, `store.js`, `data.js`,
  `art.js`, `mascota.js`, `hero3d.js`.
- `assets/vendor/`: three.js (licencia MIT). `assets/fonts/`: Urbanist y Geist Mono. `assets/img/`: isotipos.
