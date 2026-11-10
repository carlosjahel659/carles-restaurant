# Carles Restaurant · Estructura de datos

El sistema es una aplicación web estática (`restaurante.html`, `restaurante.css`, `restaurante.js`), sin servidor ni base de datos. Toda la información se guarda en `localStorage` del navegador. Por eso los datos son locales a cada dispositivo y navegador; entre pestañas del mismo navegador se sincronizan solos.

## Claves de almacenamiento

| Clave | Contenido | Estado |
|---|---|---|
| `carles_mesas` | Arreglo de mesas | Existente, **ampliada** |
| `carles_registros` | Cuentas cerradas | Existente, **ampliada** |
| `carles_pedidos` | Pedidos con su estado de cocina | Nueva |
| `carles_pagos` | Pagos registrados | Nueva |
| `carles_config` | Meseros, usuario activo, turno, tiempos de alerta, propina sugerida, productos agotados | Nueva |
| `carles_herramientas` | Notas, tareas, recordatorios, avisos, solicitudes de apoyo, incidencias | Nueva |
| `carles_actividad` | Bitácora de actividad (últimos 1 500 eventos) | Nueva |

## Migración automática

Al abrir la nueva versión, cada mesa en el formato anterior (`{ estado, sillas[4], pedido: { id: cantidad }, pedidoEn, servidoEn }`) se convierte así:

- `pedido` pasa a ser un registro en `carles_pedidos`. Su estado se deduce del de la mesa: *esperando* → enviado a cocina; *comiendo* o *cuenta* → entregado; *ocupada* → pendiente de envío.
- Se eliminan `pedido`, `pedidoEn` y `servidoEn` de la mesa.
- Los registros anteriores de `carles_registros` se conservan sin cambios y aparecen en el Historial.

## Mesa (`carles_mesas[]`)

```js
{ num, cap, estado, sillas: [bool], llegada, mesero, notas,
  sesion,        // id del servicio actual; agrupa pedidos y pagos
  cuentaEn, limpiezaEn, atencion,
  propina,       // % aplicado a esta cuenta (null = sugerida)
  personas }     // número de partes para dividir la cuenta
```
Estados: `libre`, `ocupada`, `esperando`, `comiendo`, `cuenta`, `limpieza`.

## Pedido (`carles_pedidos[]`)

```js
{ id, num, mesa, mesaNum, sesion, mesero, obs, estado,
  items: [{ lid, pid, n, base, p, q, extras: [{n,p}], comp: [{n,p}], sin: [texto], obs }],
  creado, enviado, preparacion, listo, entregado, cancelado }   // marcas de tiempo
```
Estados: `pendiente` → `enviado` → `preparacion` → `listo` → `entregado`, o `cancelado`. El precio unitario `p` ya incluye extras y complementos.

## Pago (`carles_pagos[]`)

```js
{ id, sesion, mesa, monto, metodo, recibido, cambio, ref, ts, mesero }
```
Métodos: `efectivo`, `tarjeta`, `transferencia`, `otro`. Un pago se rechaza si excede el saldo, si el efectivo recibido no alcanza o si repite el monto y el método del pago anterior en menos de 5 segundos.

## Registro de cuenta cerrada (`carles_registros[]`)

Conserva los campos anteriores (`mesa`, `comensales`, `llegada`, `salida`, `pedido`, `total`) y agrega `id`, `sesion`, `mesero`, `lineas`, `pedidos`, `subtotal`, `propina`, `pagado` y `estado` (`cobrada` o `sin_cobro`, cuando la mesa se liberó con saldo pendiente).

## Catálogo

El menú está definido en `MENU`, al inicio de `restaurante.js`. Por producto se pueden configurar:

- `sin`: ingredientes que se pueden retirar.
- `extras` y `comp`: opciones con precio adicional.
- `dest`: marca de producto destacado.
- `foto`: ruta opcional a una imagen. Sin foto se muestran las iniciales del producto.

La disponibilidad (agotado / disponible) se cambia desde la interfaz y se guarda en `carles_config.agotados`.

## Limitaciones

- No hay conexión con cocina. El estado de cada pedido lo actualiza el personal desde la sección Pedidos.
- Los avisos y las solicitudes de apoyo solo los ven quienes usan el mismo dispositivo. Para comunicarse entre dispositivos se necesitaría un servidor.
- Para respaldar la información, use *Configuración → Exportar respaldo* (archivo JSON).
