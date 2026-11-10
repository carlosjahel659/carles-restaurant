"use strict";
/* =========================================================
   Carles Restaurant · Sistema de mesas para meseros
   Persistencia: localStorage (estructura en DATOS.md)
   ========================================================= */

// ---------- Catálogo ----------
// sin: ingredientes que se pueden retirar · extras/comp: opciones con costo adicional
// foto: ruta opcional a la imagen del producto (p. ej. "img/nachos.jpg")
const MENU = [
  { cat: "Entradas", items: [
    { id: "e1", n: "Nachos Carles", d: "Queso fundido, jalapeño y pico de gallo", p: 95, dest: true,
      sin: ["Jalapeño", "Pico de gallo"], extras: [{ n: "Extra queso", p: 20 }, { n: "Carne molida", p: 35 }] },
    { id: "e2", n: "Alitas BBQ", d: "8 piezas con aderezo ranch", p: 140,
      extras: [{ n: "4 piezas adicionales", p: 65 }], comp: [{ n: "Bastones de apio", p: 15 }, { n: "Aderezo extra", p: 10 }] },
    { id: "e3", n: "Guacamole", d: "Con totopos de la casa", p: 85, sin: ["Cebolla", "Cilantro", "Chile serrano"] },
    { id: "e4", n: "Sopa del día", d: "Pregunta por la de hoy", p: 70 }
  ]},
  { cat: "Platos fuertes", items: [
    { id: "f1", n: "Hamburguesa Carles", d: "Res, tocino, queso cheddar y papas", p: 165, dest: true,
      sin: ["Tocino", "Cebolla", "Jitomate", "Pepinillos"], extras: [{ n: "Doble carne", p: 45 }, { n: "Extra tocino", p: 20 }],
      comp: [{ n: "Aros de cebolla en lugar de papas", p: 15 }] },
    { id: "f2", n: "Tacos al pastor", d: "Orden de 5 con piña y salsa", p: 120,
      sin: ["Piña", "Cebolla", "Cilantro"], extras: [{ n: "Queso gratinado", p: 20 }] },
    { id: "f3", n: "Pasta Alfredo", d: "Fettuccine con pollo a la parrilla", p: 150,
      sin: ["Pollo"], extras: [{ n: "Camarones", p: 55 }], comp: [{ n: "Pan de ajo", p: 25 }] },
    { id: "f4", n: "Arrachera", d: "300 g con guarnición", p: 260, dest: true,
      extras: [{ n: "Chimichurri", p: 15 }], comp: [{ n: "Papa al horno", p: 0 }, { n: "Ensalada", p: 0 }, { n: "Arroz", p: 0 }] },
    { id: "f5", n: "Pizza 4 quesos", d: "Mediana, masa artesanal", p: 180, extras: [{ n: "Pepperoni", p: 25 }, { n: "Champiñones", p: 20 }] },
    { id: "f6", n: "Ensalada César", d: "Lechuga, crutones y parmesano", p: 110,
      sin: ["Crutones", "Parmesano"], extras: [{ n: "Pollo a la parrilla", p: 40 }] }
  ]},
  { cat: "Bebidas", items: [
    { id: "b1", n: "Limonada", d: "Natural o mineral", p: 45, sin: ["Hielo", "Azúcar"] },
    { id: "b2", n: "Refresco", d: "Lata 355 ml", p: 35, sin: ["Hielo"] },
    { id: "b3", n: "Agua de horchata", d: "Vaso de 500 ml", p: 40, sin: ["Hielo"] },
    { id: "b4", n: "Café americano", d: "Con refill", p: 35, comp: [{ n: "Leche deslactosada", p: 0 }, { n: "Shot de espresso", p: 15 }] },
    { id: "b5", n: "Jugo natural", d: "Naranja o verde", p: 50, sin: ["Hielo"] },
    { id: "b6", n: "Cerveza", d: "Nacional, 355 ml", p: 55, comp: [{ n: "Preparada", p: 20 }] }
  ]},
  { cat: "Postres", items: [
    { id: "d1", n: "Pastel de chocolate", d: "Rebanada con helado", p: 75, dest: true, sin: ["Helado"] },
    { id: "d2", n: "Flan napolitano", d: "Receta de la casa", p: 60 },
    { id: "d3", n: "Helado", d: "Dos bolas a elegir", p: 55, extras: [{ n: "Bola adicional", p: 20 }] },
    { id: "d4", n: "Churros", d: "Con cajeta o chocolate", p: 65 }
  ]}
];
const PLATILLOS = {};
MENU.forEach(c => c.items.forEach(it => PLATILLOS[it.id] = { ...it, cat: c.cat }));

const ESTADOS = {
  libre:     { t: "Libre" },
  ocupada:   { t: "Ocupada" },
  esperando: { t: "Esperando comida" },
  comiendo:  { t: "Comiendo" },
  cuenta:    { t: "Solicitó cuenta" },
  limpieza:  { t: "Pendiente de limpieza" }
};
const EST_PEDIDO = {
  pendiente:   { t: "Pendiente de envío", sig: "enviado",     acc: "Enviar a cocina", ic: "send" },
  enviado:     { t: "Enviado a cocina",   sig: "preparacion", acc: "En preparación",  ic: "flame" },
  preparacion: { t: "En preparación",     sig: "listo",       acc: "Marcar listo",    ic: "bell" },
  listo:       { t: "Listo para entregar", sig: "entregado",  acc: "Entregar",        ic: "check" },
  entregado:   { t: "Entregado" },
  cancelado:   { t: "Cancelado" }
};
const ACTIVOS_COCINA = ["enviado", "preparacion", "listo"];
const METODOS = {
  efectivo:      { t: "Efectivo",      ic: "banknote" },
  tarjeta:       { t: "Tarjeta",       ic: "credit-card" },
  transferencia: { t: "Transferencia", ic: "arrow-left-right" },
  otro:          { t: "Otro",          ic: "smartphone" }
};
const TURNOS = ["Matutino", "Vespertino", "Nocturno"];
const LIMITES = { sinAtencion: 10, cocina: 20, entrega: 5, cuenta: 10, limpieza: 10 };
const NAV = [
  ["inicio", "Inicio", "home"],
  ["mesas", "Mesas", "layout-grid"],
  ["menu", "Menú", "book-open"],
  ["pedidos", "Pedidos", "clipboard-list"],
  ["cuentas", "Cuentas", "receipt"],
  ["historial", "Historial", "history"],
  ["herramientas", "Herramientas", "wrench"]
];
const K = {
  mesas: "carles_mesas",
  registros: "carles_registros",
  pedidos: "carles_pedidos",
  pagos: "carles_pagos",
  config: "carles_config",
  herramientas: "carles_herramientas",
  actividad: "carles_actividad"
};

// ---------- Utilidades ----------
const $ = id => document.getElementById(id);
const ic = (n, c = "") => `<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
const num = v => { const x = parseFloat(String(v ?? "").replace(",", ".")); return isFinite(x) ? x : 0; };
const fmt = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dinero = n => "$" + fmt.format(r2(n || 0));
const pad = n => String(n).padStart(3, "0");
const hora = ts => ts ? new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—";
const fechaHora = ts => new Date(ts).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const mins = ts => ts ? Math.max(0, Math.floor((Date.now() - ts) / 60000)) : 0;
const plural = (n, s, p = s + "s") => `${n} ${n === 1 ? s : p}`;
const iniciales = t => (t || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join("");
const normalizar = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const inicioDia = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
function duracion(desde, hasta) {
  if (!desde) return "—";
  const m = Math.max(0, Math.floor(((hasta || Date.now()) - desde) / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
}
function vibrar() { try { navigator.vibrate && navigator.vibrate(10); } catch (e) {} }

// ---------- Persistencia ----------
const db = {};
function leer(clave, def) {
  try { const v = JSON.parse(localStorage.getItem(clave)); return v ?? def; } catch (e) { return def; }
}
let fallaGuardado = false;
function guardar() {
  try {
    localStorage.setItem(K.mesas, JSON.stringify(db.mesas));
    localStorage.setItem(K.registros, JSON.stringify(db.registros));
    localStorage.setItem(K.pedidos, JSON.stringify(db.pedidos));
    localStorage.setItem(K.pagos, JSON.stringify(db.pagos));
    localStorage.setItem(K.config, JSON.stringify(db.config));
    localStorage.setItem(K.herramientas, JSON.stringify(db.herr));
    localStorage.setItem(K.actividad, JSON.stringify(db.actividad));
    fallaGuardado = false;
  } catch (e) {
    if (!fallaGuardado) aviso("No fue posible guardar los datos en este dispositivo.", "error");
    fallaGuardado = true;
  }
}
const lista = v => Array.isArray(v) ? v : [];

function mesaVacia(num, cap) {
  return { num, cap, estado: "libre", sillas: Array(cap).fill(false), llegada: null, mesero: null,
           notas: "", sesion: null, cuentaEn: null, limpiezaEn: null, atencion: null, propina: null, personas: null };
}

function cargar() {
  db.config = Object.assign({ meseros: [], usuario: null, turno: null, propina: 10, agotados: [], sigPedido: 0 }, leer(K.config, {}));
  db.config.limites = Object.assign({ ...LIMITES }, db.config.limites);
  db.config.meseros = lista(db.config.meseros);
  db.config.agotados = lista(db.config.agotados);
  db.pedidos = lista(leer(K.pedidos, []));
  db.pagos = lista(leer(K.pagos, []));
  db.registros = lista(leer(K.registros, []));
  db.actividad = lista(leer(K.actividad, []));
  db.herr = Object.assign({ notas: "", tareas: [], recordatorios: [], avisos: [], apoyo: [], incidencias: [] }, leer(K.herramientas, {}));
  ["tareas", "recordatorios", "avisos", "apoyo", "incidencias"].forEach(k => db.herr[k] = lista(db.herr[k]));
  db.config.sigPedido = Math.max(db.config.sigPedido || 0, ...db.pedidos.map(p => p.num || 0));

  let ms = leer(K.mesas, null);
  if (!Array.isArray(ms) || !ms.length) ms = Array.from({ length: 6 }, () => ({}));
  db.mesas = ms.map((m, i) => normalizarMesa(m || {}, i));
}

// Acepta el formato anterior ({ estado, sillas[4], pedido: {id: cantidad}, ... }) y lo convierte
function normalizarMesa(m, i) {
  const cap = m.cap || (Array.isArray(m.sillas) && m.sillas.length) || 4;
  const r = Object.assign(mesaVacia(i + 1, cap), m);
  r.num = i + 1;
  r.cap = cap;
  r.sillas = Array.from({ length: cap }, (_, k) => !!(m.sillas && m.sillas[k]));
  if (!ESTADOS[r.estado]) r.estado = "libre";
  if (!["libre", "limpieza"].includes(r.estado) && !r.sesion) r.sesion = uid();
  if (m.pedido && typeof m.pedido === "object" && Object.keys(m.pedido).length && r.sesion) {
    const estado = { esperando: "enviado", comiendo: "entregado", cuenta: "entregado" }[r.estado] || "pendiente";
    const ts = m.pedidoEn || m.llegada || Date.now();
    db.pedidos.push({
      id: uid(), num: sigNum(), mesa: i, mesaNum: r.num, sesion: r.sesion, mesero: r.mesero, obs: "",
      items: Object.entries(m.pedido).filter(([id]) => PLATILLOS[id]).map(([id, q]) => crearLinea(PLATILLOS[id], q)),
      estado, creado: ts, enviado: estado !== "pendiente" ? ts : null,
      entregado: estado === "entregado" ? (m.servidoEn || ts) : null
    });
    if (r.estado === "cuenta" && !r.cuentaEn) r.cuentaEn = Date.now();
  }
  delete r.pedido; delete r.pedidoEn; delete r.servidoEn;
  return r;
}

function sigNum() { db.config.sigPedido = (db.config.sigPedido || 0) + 1; return db.config.sigPedido; }
function log(texto, tipo = "info") {
  db.actividad.push({ id: uid(), ts: Date.now(), texto, tipo, mesero: db.config.usuario });
  if (db.actividad.length > 1500) db.actividad.splice(0, db.actividad.length - 1500);
}
const turnoInicio = () => db.config.turno?.inicio || inicioDia();

// ---------- Datos derivados ----------
const comensales = m => m.sillas.filter(Boolean).length;
const pedidosDe = i => { const s = db.mesas[i]?.sesion; return s ? db.pedidos.filter(p => p.sesion === s) : []; };
const borrador = i => pedidosDe(i).find(p => p.estado === "pendiente");
const subtotalPedido = p => p.items.reduce((s, l) => s + l.p * l.q, 0);
const articulos = p => p ? p.items.reduce((s, l) => s + l.q, 0) : 0;
const facturables = i => pedidosDe(i).filter(p => !["pendiente", "cancelado"].includes(p.estado));
const consumo = i => r2(facturables(i).reduce((s, p) => s + subtotalPedido(p), 0));
const agotado = id => db.config.agotados.includes(id);
const numMesa = p => p.mesaNum ?? (p.mesa + 1);

function cuenta(i) {
  const m = db.mesas[i];
  const sub = consumo(i);
  const pct = m.propina ?? db.config.propina;
  const prop = r2(sub * pct / 100);
  const total = r2(sub + prop);
  const pagado = m.sesion ? r2(db.pagos.filter(x => x.sesion === m.sesion).reduce((s, x) => s + x.monto, 0)) : 0;
  return { sub, pct, prop, total, pagado, restante: r2(Math.max(0, total - pagado)) };
}

function crearLinea(p, q, ex = [], co = [], sin = [], obs = "") {
  const extras = (p.extras || []).filter(e => ex.includes(e.n)).map(e => ({ n: e.n, p: e.p }));
  const comp = (p.comp || []).filter(e => co.includes(e.n)).map(e => ({ n: e.n, p: e.p }));
  const adic = [...extras, ...comp].reduce((s, e) => s + e.p, 0);
  return { lid: uid(), pid: p.id, n: p.n, base: p.p, p: p.p + adic, q, extras, comp, sin: [...sin], obs: obs.trim() };
}
const claveLinea = l => JSON.stringify([l.pid, (l.extras || []).map(e => e.n).sort(), (l.comp || []).map(e => e.n).sort(), [...(l.sin || [])].sort(), l.obs || ""]);
const descMods = l => [
  ...(l.extras || []).map(e => "+ " + e.n),
  ...(l.comp || []).map(e => "+ " + e.n),
  ...(l.sin || []).map(s => "Sin " + s.toLowerCase())
].join(" · ");

function lineasConsolidadas(pedidos) {
  const mapa = new Map();
  pedidos.forEach(p => p.items.forEach(l => {
    const k = claveLinea(l);
    if (mapa.has(k)) mapa.get(k).q += l.q; else mapa.set(k, { ...l });
  }));
  return [...mapa.values()];
}

// ---------- Alertas ----------
let alertasCache = [];
function calcularAlertas() {
  const L = db.config.limites, a = [];
  db.pedidos.forEach(p => {
    // Solo se asocia a la mesa si el pedido pertenece a su servicio actual
    const mesa = db.mesas[p.mesa]?.sesion === p.sesion ? p.mesa : undefined;
    if (p.estado === "listo") {
      a.push({ id: "l" + p.id, nivel: "alta", ic: "bell", txt: `Pedido #${pad(p.num)} listo para entregar`,
               det: `Mesa ${numMesa(p)} · listo hace ${duracion(p.listo)}`, mesa, ir: { vista: "pedidos", tab: "listos" } });
    } else if (["enviado", "preparacion"].includes(p.estado) && mins(p.enviado) >= L.cocina) {
      a.push({ id: "c" + p.id, nivel: "media", ic: "flame", txt: `Pedido #${pad(p.num)} con demora en cocina`,
               det: `Mesa ${numMesa(p)} · ${duracion(p.enviado)} desde su envío`, mesa, ir: { vista: "pedidos", tab: "activos" } });
    }
  });
  db.mesas.forEach((m, i) => {
    if (m.estado === "ocupada" && !facturables(i).length && mins(m.llegada) >= L.sinAtencion)
      a.push({ id: "s" + i, nivel: "media", ic: "clock", txt: `Mesa ${m.num} sin pedido`, det: `Clientes sentados hace ${duracion(m.llegada)}`, mesa: i });
    if (m.estado === "cuenta" && mins(m.cuentaEn) >= L.cuenta)
      a.push({ id: "q" + i, nivel: "alta", ic: "receipt", txt: `Mesa ${m.num} espera su cuenta`, det: `Solicitada hace ${duracion(m.cuentaEn)}`, mesa: i, ir: { vista: "cuentas", mesa: i } });
    if (m.estado === "limpieza" && mins(m.limpiezaEn) >= L.limpieza)
      a.push({ id: "z" + i, nivel: "media", ic: "sparkles", txt: `Mesa ${m.num} pendiente de limpieza`, det: `Desde hace ${duracion(m.limpiezaEn)}`, mesa: i });
  });
  const ahora = Date.now();
  db.herr.recordatorios.filter(r => !r.hecho && r.cuando <= ahora).forEach(r =>
    a.push({ id: "r" + r.id, nivel: "media", ic: "alarm-clock", txt: r.texto,
             det: `Recordatorio${r.mesa != null ? ` · Mesa ${db.mesas[r.mesa]?.num ?? r.mesa + 1}` : ""} · ${hora(r.cuando)}`, ir: { vista: "herramientas" } }));
  db.herr.apoyo.filter(s => !s.resuelto).forEach(s =>
    a.push({ id: "a" + s.id, nivel: "alta", ic: "life-buoy", txt: `Apoyo solicitado: ${s.motivo}`,
             det: `${s.mesa != null ? `Mesa ${db.mesas[s.mesa]?.num ?? s.mesa + 1} · ` : ""}${s.autor || ""} · hace ${duracion(s.ts)}`, ir: { vista: "herramientas" } }));
  db.herr.avisos.filter(v => !v.leido).forEach(v =>
    a.push({ id: "v" + v.id, nivel: "baja", ic: "megaphone", txt: `Aviso de ${v.origen.toLowerCase()}`, det: v.texto, ir: { vista: "herramientas" } }));
  const orden = { alta: 0, media: 1, baja: 2 };
  return a.sort((x, y) => orden[x.nivel] - orden[y.nivel]);
}
const alertasMesa = i => alertasCache.filter(a => a.mesa === i);

// ---------- Estado de la interfaz ----------
const ui = {
  vista: "inicio", filtroMesas: "todas", mesaPanel: null, menuMesa: null, menuCat: "todos", busqueda: "",
  pedTab: "activos", cuentaSel: null, pago: null, histTab: "cuentas", histRango: "turno", notif: false
};
try { Object.assign(ui, JSON.parse(sessionStorage.getItem("carles_ui")) || {}, { notif: false, mesaPanel: null, pago: null }); } catch (e) {}
function guardarUi() {
  try { sessionStorage.setItem("carles_ui", JSON.stringify({ vista: ui.vista, filtroMesas: ui.filtroMesas, menuMesa: ui.menuMesa, menuCat: ui.menuCat, pedTab: ui.pedTab, histTab: ui.histTab, histRango: ui.histRango })); } catch (e) {}
}

// ---------- Avisos y confirmaciones ----------
let avisoTimer;
function aviso(txt, tipo = "ok") {
  const t = $("toast");
  t.className = "toast ver t-" + tipo;
  t.innerHTML = ic(tipo === "error" ? "alert-triangle" : tipo === "info" ? "info" : "circle-check") + `<span>${esc(txt)}</span>`;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => t.classList.remove("ver"), tipo === "error" ? 3600 : 2400);
}

let resolverConfirm = null;
function confirmar({ titulo, texto, ok = "Confirmar", cancelar = "Cancelar", peligro = false }) {
  $("confirmar").innerHTML = `
    <div class="modal modal-confirm" role="alertdialog" aria-modal="true" aria-labelledby="cfTit">
      <div class="modal-cab"><h3 id="cfTit">${esc(titulo)}</h3></div>
      <div class="modal-cuerpo"><p class="texto-confirm">${esc(texto)}</p></div>
      <div class="modal-pie">
        <button class="btn btn-s" data-cf="0">${esc(cancelar)}</button>
        <button class="btn ${peligro ? "btn-peligro-p" : "btn-p"}" data-cf="1">${esc(ok)}</button>
      </div>
    </div>`;
  $("confirmar").classList.add("abierto");
  setTimeout(() => $("confirmar").querySelector("[data-cf='1']")?.focus(), 30);
  return new Promise(res => { resolverConfirm = res; });
}
function cerrarConfirm(v) {
  $("confirmar").classList.remove("abierto");
  const r = resolverConfirm; resolverConfirm = null;
  r && r(v);
}
$("confirmar").addEventListener("click", e => {
  const b = e.target.closest("[data-cf]");
  if (b) cerrarConfirm(b.dataset.cf === "1");
  else if (e.target.id === "confirmar") cerrarConfirm(false);
});

// ---------- Modal genérico ----------
let modalActual = null;
function abrirModal(opc) {
  modalActual = opc;
  pintarModal();
  $("modal").classList.add("abierto");
  actualizarBloqueo();
}
function pintarModal() {
  if (!modalActual) return;
  const cuerpo = $("modal").querySelector(".modal-cuerpo");
  const y = cuerpo ? cuerpo.scrollTop : 0;
  $("modal").innerHTML = `<div class="modal ${modalActual.clase || ""}" role="dialog" aria-modal="true">${modalActual.render()}</div>`;
  const nuevo = $("modal").querySelector(".modal-cuerpo");
  if (nuevo) nuevo.scrollTop = y;
}
function cerrarModal(forzar) {
  if (!modalActual || (modalActual.fijo && !forzar)) return;
  modalActual = null;
  $("modal").classList.remove("abierto");
  $("modal").innerHTML = "";
  actualizarBloqueo();
}
function actualizarBloqueo() { document.body.classList.toggle("bloq", ui.mesaPanel !== null || !!modalActual); }

// =========================================================
//   Operaciones de mesa
// =========================================================
function abrirSesion(i, n) {
  const m = db.mesas[i];
  const sillas = n == null ? m.sillas : m.sillas.map((_, k) => k < n);
  Object.assign(m, mesaVacia(m.num, m.cap), {
    estado: "ocupada", llegada: Date.now(), atencion: Date.now(), sesion: uid(), mesero: db.config.usuario, sillas
  });
}

function sincronizarMesa(i) {
  const m = db.mesas[i];
  if (!m || !["ocupada", "esperando", "comiendo"].includes(m.estado)) return;
  const ps = pedidosDe(i);
  if (ps.some(p => ACTIVOS_COCINA.includes(p.estado))) m.estado = "esperando";
  else if (ps.some(p => p.estado === "entregado")) m.estado = "comiendo";
  else m.estado = "ocupada";
}

function solicitarCuenta(i) {
  const m = db.mesas[i];
  if (!consumo(i)) { aviso("La mesa no tiene consumo enviado a cocina.", "error"); return false; }
  m.estado = "cuenta"; m.cuentaEn = Date.now(); m.atencion = Date.now();
  log(`Mesa ${m.num}: cuenta solicitada`);
  aviso(`Cuenta solicitada · Mesa ${m.num}`, "info");
  return true;
}

function cerrarSesion(i, motivo) {
  const m = db.mesas[i], c = cuenta(i);
  const ps = pedidosDe(i);
  ps.filter(p => p.estado === "pendiente").forEach(p => { p.estado = "cancelado"; p.cancelado = Date.now(); });
  const validos = ps.filter(p => p.estado !== "cancelado");
  const pedido = {};
  validos.forEach(p => p.items.forEach(l => pedido[l.pid] = (pedido[l.pid] || 0) + l.q));
  db.registros.push({
    id: uid(), sesion: m.sesion, mesa: m.num, comensales: comensales(m), mesero: m.mesero,
    llegada: m.llegada, salida: Date.now(), pedido, lineas: lineasConsolidadas(validos), pedidos: validos.map(p => p.num),
    subtotal: c.sub, propina: c.prop, total: c.total, pagado: c.pagado, estado: motivo
  });
  Object.assign(m, mesaVacia(m.num, m.cap));
  if (motivo === "cobrada") { m.estado = "limpieza"; m.limpiezaEn = Date.now(); }
}

// Libera la mesa o la pasa a limpieza; pide confirmación si hay saldo o pedidos activos
async function desocupar(i, destino) {
  const m = db.mesas[i];
  if (m.estado === destino) return false;
  if (m.sesion) {
    const c = cuenta(i);
    const activos = pedidosDe(i).filter(p => ACTIVOS_COCINA.includes(p.estado));
    if (c.restante > 0 || activos.length) {
      const partes = [];
      if (c.restante > 0) partes.push(`un saldo pendiente de ${dinero(c.restante)}`);
      if (activos.length) partes.push(plural(activos.length, "pedido activo", "pedidos activos"));
      const ok = await confirmar({
        titulo: destino === "libre" ? `Liberar mesa ${m.num}` : `Enviar mesa ${m.num} a limpieza`,
        texto: `La mesa tiene ${partes.join(" y ")}. Si continúa, el saldo no se registrará como cobrado y los pedidos activos se cancelarán.`,
        ok: destino === "libre" ? "Liberar mesa" : "Continuar", cancelar: "Volver", peligro: true
      });
      if (!ok) return false;
      activos.forEach(p => { p.estado = "cancelado"; p.cancelado = Date.now(); });
      if (c.restante > 0) log(`Mesa ${m.num} desocupada con ${dinero(c.restante)} sin cobrar`, "alerta");
    }
    const tras = cuenta(i);
    if (tras.total > 0 || tras.pagado > 0) cerrarSesion(i, tras.restante > 0 ? "sin_cobro" : "cobrada");
    else pedidosDe(i).filter(p => p.estado === "pendiente").forEach(p => { p.estado = "cancelado"; p.cancelado = Date.now(); });
  }
  Object.assign(m, mesaVacia(m.num, m.cap));
  if (destino === "limpieza") { m.estado = "limpieza"; m.limpiezaEn = Date.now(); }
  log(destino === "libre" ? `Mesa ${m.num} liberada` : `Mesa ${m.num} marcada para limpieza`);
  aviso(destino === "libre" ? `Mesa ${m.num} disponible` : `Mesa ${m.num} pendiente de limpieza`, "info");
  return true;
}

async function cambiarEstadoMesa(i, v) {
  const m = db.mesas[i];
  if (v === m.estado) return false;
  if (v === "libre" || v === "limpieza") return desocupar(i, v);
  if (v === "cuenta") return solicitarCuenta(i);
  if (["libre", "limpieza"].includes(m.estado)) abrirSesion(i, null);
  if (m.estado === "cuenta") m.cuentaEn = null;
  m.estado = v; m.atencion = Date.now();
  log(`Mesa ${m.num}: ${ESTADOS[v].t}`);
  return true;
}

function marcarLimpia(i) {
  const m = db.mesas[i];
  if (m.estado !== "limpieza") return;
  Object.assign(m, mesaVacia(m.num, m.cap));
  log(`Mesa ${m.num} limpia y disponible`);
  aviso(`Mesa ${m.num} disponible`);
}

// ---------- Pedidos ----------
function agregarLinea(i, l) {
  const m = db.mesas[i];
  if (m.estado === "limpieza") { aviso(`La mesa ${m.num} está pendiente de limpieza.`, "error"); return false; }
  if (m.estado === "libre") abrirSesion(i, 0);
  let b = borrador(i);
  if (!b) {
    b = { id: uid(), num: sigNum(), mesa: i, mesaNum: m.num, sesion: m.sesion, mesero: db.config.usuario,
          items: [], estado: "pendiente", obs: "", creado: Date.now() };
    db.pedidos.push(b);
  }
  const igual = b.items.find(x => claveLinea(x) === claveLinea(l));
  if (igual) igual.q += l.q; else b.items.push(l);
  m.atencion = Date.now();
  return true;
}

function enviarPedido(id) {
  const p = db.pedidos.find(x => x.id === id);
  if (!p || p.estado !== "pendiente") return false;
  if (!p.items.length) { aviso("El pedido no tiene productos.", "error"); return false; }
  p.estado = "enviado"; p.enviado = Date.now();
  const m = db.mesas[p.mesa];
  if (m && m.sesion === p.sesion) {
    if (m.estado === "cuenta") { m.estado = "ocupada"; m.cuentaEn = null; }
    m.atencion = Date.now();
    sincronizarMesa(p.mesa);
  }
  log(`Pedido #${pad(p.num)} enviado a cocina · Mesa ${numMesa(p)}`);
  aviso(`Pedido #${pad(p.num)} enviado a cocina`);
  return true;
}

function avanzarPedido(id) {
  const p = db.pedidos.find(x => x.id === id);
  if (!p) return false;
  if (p.estado === "pendiente") return enviarPedido(id);
  const sig = EST_PEDIDO[p.estado]?.sig;
  if (!sig) return false;
  p.estado = sig; p[sig] = Date.now();
  const m = db.mesas[p.mesa];
  if (m && m.sesion === p.sesion) { m.atencion = Date.now(); sincronizarMesa(p.mesa); }
  log(`Pedido #${pad(p.num)}: ${EST_PEDIDO[sig].t.toLowerCase()} · Mesa ${numMesa(p)}`);
  if (sig === "listo") aviso(`Pedido #${pad(p.num)} listo para entregar`);
  if (sig === "entregado") aviso(`Pedido #${pad(p.num)} entregado · Mesa ${numMesa(p)}`);
  return true;
}

async function cancelarPedido(id) {
  const p = db.pedidos.find(x => x.id === id);
  if (!p || ["entregado", "cancelado"].includes(p.estado)) return false;
  const ok = await confirmar(p.estado === "pendiente"
    ? { titulo: `Descartar pedido #${pad(p.num)}`, texto: "Se eliminarán los productos que aún no se han enviado a cocina.", ok: "Descartar", cancelar: "Volver", peligro: true }
    : { titulo: `Cancelar pedido #${pad(p.num)}`, texto: `El pedido está ${EST_PEDIDO[p.estado].t.toLowerCase()}. Informe a cocina antes de cancelarlo; el importe dejará de cobrarse.`, ok: "Cancelar pedido", cancelar: "Volver", peligro: true });
  if (!ok) return false;
  const eraBorrador = p.estado === "pendiente";
  p.estado = "cancelado"; p.cancelado = Date.now();
  sincronizarMesa(p.mesa);
  if (!eraBorrador) log(`Pedido #${pad(p.num)} cancelado · Mesa ${numMesa(p)}`, "alerta");
  aviso(eraBorrador ? "Pedido descartado" : `Pedido #${pad(p.num)} cancelado`, "info");
  return true;
}

// ---------- Pagos ----------
let procesandoPago = false;
function formPago(i) {
  const m = db.mesas[i];
  if (!ui.pago || ui.pago.sesion !== m.sesion) {
    ui.pago = { sesion: m.sesion, metodo: "efectivo", monto: cuenta(i).restante.toFixed(2), recibido: "", ref: "" };
  }
  return ui.pago;
}

function registrarPago(i) {
  if (procesandoPago) return false;
  const m = db.mesas[i], c = cuenta(i), f = formPago(i);
  const monto = r2(num(f.monto));
  if (c.total <= 0) { aviso("La cuenta no tiene consumo por cobrar.", "error"); return false; }
  if (!(monto > 0)) { aviso("Ingrese un monto válido.", "error"); return false; }
  if (monto - c.restante > 0.009) { aviso(`El monto excede el saldo pendiente de ${dinero(c.restante)}.`, "error"); return false; }
  let recibido = null, cambio = 0;
  if (f.metodo === "efectivo") {
    recibido = f.recibido === "" ? monto : r2(num(f.recibido));
    if (recibido < monto) { aviso("El efectivo recibido es menor al monto a cobrar.", "error"); return false; }
    cambio = r2(recibido - monto);
  }
  const ultimo = db.pagos.filter(p => p.sesion === m.sesion).slice(-1)[0];
  if (ultimo && ultimo.monto === monto && ultimo.metodo === f.metodo && Date.now() - ultimo.ts < 5000) {
    aviso("Este pago ya fue registrado.", "error"); return false;
  }
  procesandoPago = true;
  try {
    db.pagos.push({ id: uid(), sesion: m.sesion, mesa: m.num, monto, metodo: f.metodo, recibido, cambio,
                    ref: f.ref.trim(), ts: Date.now(), mesero: db.config.usuario });
    log(`Pago de ${dinero(monto)} (${METODOS[f.metodo].t.toLowerCase()}) · Mesa ${m.num}`);
    ui.pago = null;
    const resto = cuenta(i).restante;
    const txtCambio = cambio ? ` · Cambio ${dinero(cambio)}` : "";
    if (resto <= 0) {
      cerrarSesion(i, "cobrada");
      ui.cuentaSel = null;
      log(`Cuenta de la mesa ${m.num} cerrada`);
      aviso(`Cuenta de la mesa ${m.num} cerrada${txtCambio}`);
    } else {
      aviso(`Pago registrado · Saldo ${dinero(resto)}${txtCambio}`);
    }
    return true;
  } finally {
    procesandoPago = false;
  }
}

// =========================================================
//   Componentes
// =========================================================
function htmlLinea(l, conPrecio = true) {
  const mods = descMods(l);
  return `<div class="linea">
    <span class="q">${l.q}×</span>
    <span>${esc(l.n)}${mods ? `<small>${esc(mods)}</small>` : ""}${l.obs ? `<small class="obs">${esc(l.obs)}</small>` : ""}</span>
    <span class="imp">${conPrecio ? dinero(l.p * l.q) : ""}</span>
  </div>`;
}

function htmlMesa(m, i) {
  const n = comensales(m), al = alertasMesa(i);
  const sub = m.sesion ? consumo(i) : 0;
  const arriba = Math.ceil(m.cap / 2);
  const sillas = m.sillas.map(on => `<span class="s ${on ? "on" : ""}"></span>`);
  const tiempo = m.estado === "libre" ? "Disponible" : m.estado === "limpieza" ? duracion(m.limpiezaEn) : duracion(m.llegada);
  return `<button class="mesa st-${m.estado}" data-a="abrirMesa" data-i="${i}" aria-label="Mesa ${m.num}, ${ESTADOS[m.estado].t}">
    <span class="mesa-cab">
      <span class="mesa-num">Mesa ${m.num}</span>
      ${al.length ? `<span class="mesa-alerta nv-${al[0].nivel}" title="${esc(al.map(a => a.txt).join(" · "))}">${ic("alert-triangle", "i-xs")}${al.length > 1 ? al.length : ""}</span>` : ""}
    </span>
    <span class="mesa-estado"><span class="punto"></span>${ESTADOS[m.estado].t}</span>
    <span class="plano">
      <span class="fila-sillas">${sillas.slice(0, arriba).join("")}</span>
      <span class="tabla" style="width:${arriba * 20 + 8}px"></span>
      <span class="fila-sillas">${sillas.slice(arriba).join("")}</span>
    </span>
    <span class="mesa-datos"><span>${ic("users", "i-s")}${n}/${m.cap}</span><span>${ic("clock", "i-s")}${tiempo}</span></span>
    <span class="mesa-pie"><span class="mesa-mesero">${esc(m.mesero || (m.sesion ? "Sin asignar" : "—"))}</span>${sub ? `<b class="num">${dinero(sub)}</b>` : ""}</span>
  </button>`;
}

const htmlLeyenda = () => `<div class="leyenda">${Object.entries(ESTADOS).map(([k, e]) => `<span class="st-${k}"><span class="punto"></span>${e.t}</span>`).join("")}</div>`;

function htmlAlerta(a) {
  return `<button class="fila nv-${a.nivel}" data-a="alerta" data-k="${esc(a.id)}">
    <span class="fila-ic">${ic(a.ic, "i-s")}</span>
    <span class="fila-tx"><b>${esc(a.txt)}</b><small>${esc(a.det)}</small></span>
    ${ic("chevron-right", "i-s tenue")}
  </button>`;
}

const opcionesMesas = (sel, vacio = "Sin mesa") =>
  `<option value="">${vacio}</option>` + db.mesas.map((m, i) => `<option value="${i}" ${sel === i ? "selected" : ""}>Mesa ${m.num}</option>`).join("");

// =========================================================
//   Vistas
// =========================================================
function estadisticas() {
  const desde = turnoInicio();
  const regs = db.registros.filter(r => (r.salida || 0) >= desde && r.estado !== "sin_cobro");
  return {
    libres: db.mesas.filter(m => m.estado === "libre").length,
    ocupadas: db.mesas.filter(m => !["libre", "limpieza"].includes(m.estado)).length,
    limpieza: db.mesas.filter(m => m.estado === "limpieza").length,
    cocina: db.pedidos.filter(p => ["enviado", "preparacion"].includes(p.estado)).length,
    porEnviar: db.pedidos.filter(p => p.estado === "pendiente" && p.items.length).length,
    listos: db.pedidos.filter(p => p.estado === "listo").length,
    atendidos: regs.reduce((s, r) => s + (r.comensales || 0), 0),
    enMesa: db.mesas.reduce((s, m) => s + comensales(m), 0),
    vendido: r2(db.pagos.filter(p => p.ts >= desde).reduce((s, p) => s + p.monto, 0)),
    cerradas: regs.length
  };
}

function vInicio() {
  const s = estadisticas();
  const listos = db.pedidos.filter(p => p.estado === "listo").sort((a, b) => a.listo - b.listo);
  const ctas = db.mesas.map((m, i) => ({ m, i })).filter(x => x.m.estado === "cuenta");
  const t = db.config.turno;
  const metricas = [
    { t: "Mesas libres", v: s.libres, d: `de ${db.mesas.length} mesas`, nav: "mesas", f: "libres" },
    { t: "Mesas ocupadas", v: s.ocupadas, d: s.limpieza ? `${s.limpieza} en limpieza` : "en servicio", nav: "mesas", f: "ocupadas" },
    { t: "Pedidos pendientes", v: s.cocina + s.porEnviar, d: s.porEnviar ? `${s.porEnviar} sin enviar` : "en cocina", nav: "pedidos", f: "activos" },
    { t: "Listos para entregar", v: s.listos, d: s.listos ? "recoger en cocina" : "sin pendientes", nav: "pedidos", f: "listos", cls: s.listos ? "m-ok" : "" },
    { t: "Comensales atendidos", v: s.atendidos, d: `${s.enMesa} en mesa ahora`, nav: "historial", f: "cuentas" },
    { t: "Vendido en el turno", v: dinero(s.vendido), d: plural(s.cerradas, "cuenta cerrada", "cuentas cerradas"), nav: "historial", f: "pagos" }
  ];
  return `
  <div class="cab">
    <div><h1>Inicio</h1><p>${t ? `Turno ${t.nombre.toLowerCase()} · iniciado a las ${hora(t.inicio)}` : "Sin turno activo"}</p></div>
    <div class="cab-acc">
      <button class="btn btn-s" data-a="nav" data-v="menu">${ic("book-open", "i-s")}Nuevo pedido</button>
      <button class="btn btn-p" data-a="sentar">${ic("user-plus", "i-s")}Sentar clientes</button>
    </div>
  </div>
  <div class="metricas">${metricas.map(x => `
    <button class="metrica ${x.cls || ""}" data-a="nav" data-v="${x.nav}" data-f="${x.f}">
      <span>${x.t}</span><b>${x.v}</b><small>${x.d}</small>
    </button>`).join("")}
  </div>
  <div class="inicio">
    <section class="bloque">
      <div class="bloque-cab"><h2>Salón</h2><button class="btn btn-g btn-sm" data-a="nav" data-v="mesas">Gestionar mesas${ic("chevron-right", "i-s")}</button></div>
      <div class="salon">${db.mesas.map(htmlMesa).join("")}</div>
      ${htmlLeyenda()}
    </section>
    <aside class="superficie lado">
      <section class="lado-sec">
        <div class="lado-cab"><h2>Requiere atención</h2><span class="cont">${alertasCache.length}</span></div>
        <div class="filas">${alertasCache.length ? alertasCache.slice(0, 6).map(htmlAlerta).join("") : `<div class="vacio">Sin alertas activas.</div>`}</div>
        ${alertasCache.length > 6 ? `<div class="lado-pie"><button class="btn btn-g btn-sm" data-a="notif">Ver las ${alertasCache.length} alertas</button></div>` : ""}
      </section>
      <section class="lado-sec">
        <div class="lado-cab"><h2>Listos para entregar</h2><span class="cont">${listos.length}</span></div>
        <div class="filas">${listos.length ? listos.map(p => `
          <div class="fila">
            <span class="fila-tx"><b>#${pad(p.num)} · Mesa ${numMesa(p)}</b><small>${plural(articulos(p), "producto")} · listo hace ${duracion(p.listo)}</small></span>
            <button class="btn btn-s btn-sm" data-a="avanzar" data-id="${p.id}">Entregar</button>
          </div>`).join("") : `<div class="vacio">No hay pedidos por recoger.</div>`}
        </div>
      </section>
      <section class="lado-sec">
        <div class="lado-cab"><h2>Cuentas solicitadas</h2><span class="cont">${ctas.length}</span></div>
        <div class="filas">${ctas.length ? ctas.map(({ m, i }) => `
          <div class="fila">
            <span class="fila-tx"><b>Mesa ${m.num} · ${dinero(cuenta(i).restante)}</b><small>Solicitada hace ${duracion(m.cuentaEn)}</small></span>
            <button class="btn btn-s btn-sm" data-a="irCuenta" data-i="${i}">Cobrar</button>
          </div>`).join("") : `<div class="vacio">No hay cuentas por cobrar.</div>`}
        </div>
      </section>
    </aside>
  </div>`;
}

const FILTROS_MESAS = {
  todas: ["Todas", () => true],
  libres: ["Libres", m => m.estado === "libre"],
  ocupadas: ["En servicio", m => !["libre", "limpieza"].includes(m.estado)],
  cuenta: ["Por cobrar", m => m.estado === "cuenta"],
  limpieza: ["Limpieza", m => m.estado === "limpieza"],
  mias: ["Mis mesas", m => m.mesero && m.mesero === db.config.usuario],
  atencion: ["Con alertas", (m, i) => alertasMesa(i).length > 0]
};
function vMesas() {
  const f = FILTROS_MESAS[ui.filtroMesas] ? ui.filtroMesas : "todas";
  const visibles = db.mesas.map((m, i) => ({ m, i })).filter(({ m, i }) => FILTROS_MESAS[f][1](m, i));
  const s = estadisticas();
  return `
  <div class="cab">
    <div><h1>Mesas</h1><p>${s.libres} libres · ${s.ocupadas} en servicio · ${plural(s.enMesa, "comensal", "comensales")} en el salón</p></div>
    <div class="cab-acc"><button class="btn btn-p" data-a="sentar">${ic("user-plus", "i-s")}Sentar clientes</button></div>
  </div>
  <div class="barra-filtros">
    <div class="seg" role="tablist">${Object.entries(FILTROS_MESAS).map(([k, [t, fn]]) => {
      const n = db.mesas.filter((m, i) => fn(m, i)).length;
      return `<button class="${k === f ? "activo" : ""}" data-a="filtroMesas" data-v="${k}">${t}<span class="n">${n}</span></button>`;
    }).join("")}</div>
  </div>
  ${visibles.length ? `<div class="salon">${visibles.map(({ m, i }) => htmlMesa(m, i)).join("")}</div>` : `<div class="superficie vacio">No hay mesas con este filtro.</div>`}
  ${htmlLeyenda()}`;
}

// ---------- Menú ----------
function cantidadEnBorrador(pid) {
  if (ui.menuMesa === null) return 0;
  const b = borrador(ui.menuMesa);
  return b ? b.items.filter(l => l.pid === pid).reduce((s, l) => s + l.q, 0) : 0;
}
function htmlPlatillo(p) {
  const ag = agotado(p.id), q = cantidadEnBorrador(p.id);
  return `<button class="plat ${ag ? "agotado" : ""} ${q ? "en-pedido" : ""}" data-a="producto" data-id="${p.id}">
    ${p.foto ? `<span class="plat-foto"><img src="${esc(p.foto)}" alt="" loading="lazy"></span>` : ""}
    <span class="plat-tx">
      <b>${esc(p.n)}</b><small>${esc(p.d)}</small>
      <span class="plat-pie"><span class="precio">${dinero(p.p)}</span>
        ${ag ? `<span class="marca-prod agot">${ic("ban", "i-xs")}Agotado</span>` : p.dest ? `<span class="marca-prod dest">${ic("star", "i-xs")}Destacado</span>` : ""}
      </span>
    </span>
    ${q ? `<span class="plat-q">${q}</span>` : ""}
  </button>`;
}
function htmlPlatillos() {
  const q = normalizar(ui.busqueda.trim());
  if (q || ui.menuCat !== "todos") {
    const res = Object.values(PLATILLOS).filter(p => q
      ? normalizar(`${p.n} ${p.d} ${p.cat}`).includes(q)
      : ui.menuCat === "dest" ? p.dest : p.cat === MENU[+ui.menuCat]?.cat);
    if (!res.length) return `<div class="superficie vacio">No se encontraron productos${q ? ` para “${esc(ui.busqueda.trim())}”` : ""}.</div>`;
    return `${q ? `<p class="resultado">${plural(res.length, "resultado")}</p>` : ""}<div class="platillos">${res.map(htmlPlatillo).join("")}</div>`;
  }
  return MENU.map(c => `<section class="cat"><h2 class="cat-tit">${esc(c.cat)}<span>${c.items.length}</span></h2>
    <div class="platillos">${c.items.map(it => htmlPlatillo(PLATILLOS[it.id])).join("")}</div></section>`).join("");
}

function htmlCarrito(enModal) {
  const i = ui.menuMesa;
  const cerrar = enModal ? `<button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button>` : "";
  if (i === null) {
    return `<div class="carrito-cab"><div><h2>Pedido</h2><small>Sin mesa seleccionada</small></div>${cerrar}</div>
      <div class="vacio"><p>Seleccione una mesa para iniciar un pedido.</p></div>`;
  }
  const m = db.mesas[i], b = borrador(i), items = b ? b.items : [];
  const sub = b ? subtotalPedido(b) : 0, enviado = consumo(i);
  return `
    <div class="carrito-cab">
      <div><h2>Pedido · Mesa ${m.num}</h2><small>${b ? `#${pad(b.num)} · pendiente de envío` : ESTADOS[m.estado].t}</small></div>
      <div class="sec-acc">${b ? `<button class="btn-ic" data-a="cancelar" data-id="${b.id}" aria-label="Descartar pedido" title="Descartar pedido">${ic("trash-2")}</button>` : ""}${cerrar}</div>
    </div>
    <div class="carrito-cuerpo">
      ${items.length ? items.map(l => `
        <div class="cl">
          <button class="cl-nom" data-a="editarLinea" data-id="${b.id}" data-lid="${l.lid}">
            <b>${esc(l.n)}</b>${descMods(l) ? `<small>${esc(descMods(l))}</small>` : ""}${l.obs ? `<small><i>${esc(l.obs)}</i></small>` : ""}
          </button>
          <span class="cl-imp">${dinero(l.p * l.q)}</span>
          <div class="cl-acc">
            <div class="stepper">
              <button data-a="lineaQ" data-id="${b.id}" data-lid="${l.lid}" data-d="-1" aria-label="Disminuir">${ic("minus", "i-s")}</button>
              <b>${l.q}</b>
              <button data-a="lineaQ" data-id="${b.id}" data-lid="${l.lid}" data-d="1" aria-label="Aumentar">${ic("plus", "i-s")}</button>
            </div>
            <button class="btn btn-g btn-sm" data-a="quitarLinea" data-id="${b.id}" data-lid="${l.lid}">Eliminar</button>
          </div>
        </div>`).join("") : `<div class="vacio">Agregue productos desde el menú.</div>`}
      ${b ? `<div class="campo"><label for="obsPedido">Observaciones para cocina</label>
        <textarea class="inp" id="obsPedido" data-in="obsPedido" data-id="${b.id}" rows="2" maxlength="200" placeholder="Ej. servir las entradas primero">${esc(b.obs)}</textarea></div>` : ""}
    </div>
    <div class="carrito-pie">
      <div class="totales">
        <div class="t"><span>Subtotal del pedido</span><span>${dinero(sub)}</span></div>
        ${enviado ? `<div class="t"><span>Consumo ya enviado</span><span>${dinero(enviado)}</span></div>` : ""}
        <div class="t gran"><span>Total de la mesa</span><span>${dinero(sub + enviado)}</span></div>
      </div>
      <button class="btn btn-p btn-lg btn-blq" data-a="enviar" data-id="${b ? b.id : ""}" ${items.length ? "" : "disabled"}>${ic("send", "i-s")}Enviar a cocina</button>
    </div>`;
}

function vMenu() {
  const i = ui.menuMesa, m = i !== null ? db.mesas[i] : null;
  const b = i !== null ? borrador(i) : null;
  const cats = [["todos", "Todos"], ["dest", "Destacados"], ...MENU.map((c, ci) => [String(ci), c.cat])];
  return `<div class="vista-menu">
  <div class="cab">
    <div><h1>Menú</h1><p>${m ? `Tomando pedido para la mesa ${m.num}` : "Consulta del menú · seleccione una mesa para tomar pedido"}</p></div>
  </div>
  <div class="menu-lay">
    <div>
      <div class="menu-filtros">
        <select class="inp" data-ch="menuMesa" aria-label="Mesa">
          <option value="">Sin mesa (consulta)</option>
          ${db.mesas.map((x, k) => `<option value="${k}" ${k === i ? "selected" : ""} ${x.estado === "limpieza" ? "disabled" : ""}>Mesa ${x.num} · ${ESTADOS[x.estado].t}</option>`).join("")}
        </select>
        <div class="buscar">${ic("search")}<input class="inp" type="search" id="buscar" data-in="buscar" placeholder="Buscar platillo o bebida" value="${esc(ui.busqueda)}" autocomplete="off"></div>
      </div>
      <div class="tabs" role="tablist">${cats.map(([k, t]) => `<button class="${ui.menuCat === k ? "activo" : ""}" data-a="menuCat" data-v="${k}">${t}</button>`).join("")}</div>
      <div id="gridPlatillos">${htmlPlatillos()}</div>
    </div>
    <aside class="carrito carrito-lat superficie">${htmlCarrito(false)}</aside>
  </div>
  ${b && b.items.length ? `<button class="btn btn-p btn-lg barra-carrito" data-a="verCarrito"><span class="cont">${articulos(b)}</span>Ver pedido · Mesa ${m.num}<span class="flex1"></span><span class="num">${dinero(subtotalPedido(b))}</span></button>` : ""}
  </div>`;
}

// ---------- Pedidos ----------
const TABS_PEDIDOS = {
  activos: ["Activos", p => ACTIVOS_COCINA.includes(p.estado)],
  pendientes: ["Por enviar", p => p.estado === "pendiente" && p.items.length],
  listos: ["Listos", p => p.estado === "listo"],
  entregados: ["Entregados", p => p.estado === "entregado" && (p.entregado || 0) >= turnoInicio()],
  cancelados: ["Cancelados", p => p.estado === "cancelado" && p.items.length && (p.cancelado || 0) >= turnoInicio()]
};
function htmlTicket(p) {
  const L = db.config.limites;
  let cls = "", txt = "";
  switch (p.estado) {
    case "pendiente": txt = `Creado ${hora(p.creado)} · sin enviar`; break;
    case "enviado":
    case "preparacion": {
      const mm = mins(p.enviado);
      txt = `Enviado ${hora(p.enviado)} · ${duracion(p.enviado)} en cocina`;
      cls = mm >= L.cocina ? "tarde" : mm >= L.cocina * 0.75 ? "cerca" : "";
      break;
    }
    case "listo": txt = `Listo ${hora(p.listo)} · esperando ${duracion(p.listo)}`; cls = mins(p.listo) >= L.entrega ? "tarde" : ""; break;
    case "entregado": txt = `Entregado ${hora(p.entregado)} · servicio de ${duracion(p.enviado || p.creado, p.entregado)}`; break;
    case "cancelado": txt = `Cancelado ${hora(p.cancelado)}`; break;
  }
  const e = EST_PEDIDO[p.estado];
  const abierto = ["pendiente", ...ACTIVOS_COCINA].includes(p.estado);
  return `<article class="ticket ep-${p.estado}">
    <div class="ticket-cab">
      <div><b>#${pad(p.num)}</b><small>Mesa ${numMesa(p)} · ${esc(p.mesero || "Sin asignar")}</small></div>
      <span class="chip"><span class="punto"></span>${e.t}</span>
    </div>
    <div class="ticket-tiempo ${cls}">${ic(cls === "tarde" ? "alert-triangle" : "clock", "i-s")}${txt}</div>
    <div class="lineas">${p.items.map(l => htmlLinea(l, false)).join("")}</div>
    ${p.obs ? `<div class="ticket-obs"><b>Nota:</b> ${esc(p.obs)}</div>` : ""}
    ${abierto ? `<div class="ticket-pie">
      <button class="btn btn-s" data-a="cancelar" data-id="${p.id}">${p.estado === "pendiente" ? "Descartar" : "Cancelar"}</button>
      ${p.estado === "pendiente" ? `<button class="btn btn-s" data-a="irMenu" data-i="${p.mesa}">Editar</button>` : ""}
      <button class="btn btn-p" data-a="avanzar" data-id="${p.id}">${ic(e.ic, "i-s")}${e.acc}</button>
    </div>` : ""}
  </article>`;
}
function vPedidos() {
  const tab = TABS_PEDIDOS[ui.pedTab] ? ui.pedTab : "activos";
  let ps = db.pedidos.filter(TABS_PEDIDOS[tab][1]);
  const ref = p => p.enviado || p.creado;
  if (tab === "entregados" || tab === "cancelados") ps.sort((a, b) => (b[b.estado] || 0) - (a[a.estado] || 0));
  else ps.sort((a, b) => (a.estado === "listo" ? 0 : 1) - (b.estado === "listo" ? 0 : 1) || ref(a) - ref(b));
  const tarde = db.pedidos.filter(p => ["enviado", "preparacion"].includes(p.estado) && mins(p.enviado) >= db.config.limites.cocina).length;
  const listos = db.pedidos.filter(p => p.estado === "listo").length;
  return `
  <div class="cab">
    <div><h1>Pedidos</h1><p>Seguimiento interno de cocina · ${plural(listos, "pedido listo", "pedidos listos")} para entregar${tarde ? ` · ${plural(tarde, "pedido demorado", "pedidos demorados")}` : ""}</p></div>
    <div class="cab-acc"><button class="btn btn-p" data-a="nav" data-v="menu">${ic("plus", "i-s")}Nuevo pedido</button></div>
  </div>
  <div class="tabs" role="tablist">${Object.entries(TABS_PEDIDOS).map(([k, [t, fn]]) =>
    `<button class="${k === tab ? "activo" : ""}" data-a="pedTab" data-v="${k}">${t}<span class="cont">${db.pedidos.filter(fn).length}</span></button>`).join("")}
  </div>
  ${ps.length ? `<div class="tickets">${ps.map(htmlTicket).join("")}</div>`
    : `<div class="superficie vacio vacio-alto"><p>${{ activos: "No hay pedidos en cocina.", pendientes: "No hay pedidos pendientes de envío.", listos: "No hay pedidos listos para entregar.", entregados: "Aún no hay pedidos entregados en este turno.", cancelados: "No hay pedidos cancelados en este turno." }[tab]}</p></div>`}`;
}

// ---------- Cuentas ----------
function billetes(monto) {
  const v = new Set();
  [20, 50, 100, 200, 500, 1000].forEach(d => { const x = Math.ceil(monto / d) * d; if (x > monto) v.add(x); });
  return [...v].sort((a, b) => a - b).slice(0, 4);
}
function htmlCambio(f) {
  if (f.metodo !== "efectivo") return "";
  const monto = num(f.monto), rec = num(f.recibido);
  if (f.recibido === "") return `<div class="cambio"><span>Cambio</span><b>—</b></div>`;
  if (rec < monto) return `<div class="cambio falta"><span>Faltan</span><b>${dinero(monto - rec)}</b></div>`;
  return `<div class="cambio ok"><span>Cambio a entregar</span><b>${dinero(rec - monto)}</b></div>`;
}
function htmlCuenta(i) {
  const m = db.mesas[i], c = cuenta(i);
  const lineas = lineasConsolidadas(facturables(i));
  const sinEnviar = articulos(borrador(i));
  const enCocina = pedidosDe(i).filter(p => ACTIVOS_COCINA.includes(p.estado)).length;
  const pagos = db.pagos.filter(p => p.sesion === m.sesion);
  const personas = m.personas || Math.max(1, comensales(m));
  const parte = r2(c.total / personas);
  const f = formPago(i);
  const propOtra = ![0, 10, 15, 20].includes(c.pct);
  return `<div class="superficie cuenta-caja">
    <div class="cuenta-cab">
      <button class="btn-ic solo-m" data-a="cuentaSel" data-i="" aria-label="Volver">${ic("chevron-left")}</button>
      <div><h2>Mesa ${m.num}</h2><small>${plural(comensales(m), "comensal", "comensales")} · ${esc(m.mesero || "Sin asignar")} · llegada ${hora(m.llegada)}</small></div>
      <span class="chip st-${m.estado}"><span class="punto"></span>${ESTADOS[m.estado].t}</span>
    </div>
    <div class="cobro-grid">
      <div>
        <span class="etq">Consumo</span>
        ${lineas.length ? `<div class="lineas lineas-cuenta">${lineas.map(l => htmlLinea(l)).join("")}</div>` : `<div class="vacio vacio-chico">Sin consumo registrado.</div>`}
        ${sinEnviar ? `<div class="nota" style="margin-top:10px">${ic("info", "i-s")}<span>${plural(sinEnviar, "producto")} sin enviar a cocina no se incluye${sinEnviar === 1 ? "" : "n"} en la cuenta.</span></div>` : ""}
        ${enCocina ? `<div class="nota nv-media" style="margin-top:6px">${ic("flame", "i-s")}<span>${plural(enCocina, "pedido sigue", "pedidos siguen")} en cocina.</span></div>` : ""}
        <div class="totales">
          <div class="t"><span>Subtotal</span><span>${dinero(c.sub)}</span></div>
          <div class="t"><span>Propina</span>
            <span class="propinas">${[0, 10, 15, 20].map(p => `<button class="${c.pct === p ? "activo" : ""}" data-a="propina" data-i="${i}" data-v="${p}">${p}%</button>`).join("")}
              <input class="inp" type="number" min="0" max="100" step="1" placeholder="Otro" aria-label="Propina personalizada (%)" data-ch="propinaOtra" data-i="${i}" value="${propOtra ? c.pct : ""}">
            </span>
          </div>
          <div class="t"><span>Importe de propina (${c.pct}%)</span><span>${dinero(c.prop)}</span></div>
          <div class="t gran"><span>Total</span><span>${dinero(c.total)}</span></div>
          <div class="t"><span>Pagado</span><span>${dinero(c.pagado)}</span></div>
          <div class="t rest"><span>Por cobrar</span><span class="restante">${dinero(c.restante)}</span></div>
        </div>
        ${pagos.length ? `<div class="pagos-lista"><span class="etq">Pagos registrados</span>${pagos.map(p => `
          <div class="pago">${ic(METODOS[p.metodo]?.ic || "receipt", "i-s")}
            <span class="pago-tx">${METODOS[p.metodo]?.t || p.metodo}<small>${hora(p.ts)} · ${esc(p.mesero || "")}${p.cambio ? ` · cambio ${dinero(p.cambio)}` : ""}${p.ref ? ` · ref. ${esc(p.ref)}` : ""}</small></span>
            <b>${dinero(p.monto)}</b></div>`).join("")}</div>` : ""}
      </div>
      <div>
        ${c.total <= 0 ? `<div class="vacio vacio-chico">No hay importe por cobrar. Envíe pedidos a cocina para generar consumo.</div>` : `
        <span class="etq">Dividir cuenta</span>
        <div class="dividir">
          <div class="stepper">
            <button data-a="personas" data-i="${i}" data-d="-1" ${personas <= 1 ? "disabled" : ""} aria-label="Menos personas">${ic("minus", "i-s")}</button>
            <b>${personas}</b>
            <button data-a="personas" data-i="${i}" data-d="1" ${personas >= 20 ? "disabled" : ""} aria-label="Más personas">${ic("plus", "i-s")}</button>
          </div>
          <span>${personas === 1 ? "persona" : "personas"} · <b class="num">${dinero(parte)}</b> c/u</span>
        </div>
        <span class="etq">Registrar pago</span>
        <div class="metodos">${Object.entries(METODOS).map(([k, v]) =>
          `<button class="metodo ${f.metodo === k ? "activo" : ""}" data-a="metodo" data-v="${k}">${ic(v.ic)}${v.t}</button>`).join("")}
        </div>
        <div class="campo">
          <label for="pagoMonto">Monto a cobrar</label>
          <input class="inp inp-num" id="pagoMonto" data-in="pagoMonto" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(f.monto)}">
          <div class="rapidos">
            <button class="btn btn-s btn-sm" data-a="montoRest" data-i="${i}">Saldo completo</button>
            ${personas > 1 ? `<button class="btn btn-s btn-sm" data-a="montoParte" data-i="${i}">Una parte · ${dinero(Math.min(parte, c.restante))}</button>` : ""}
          </div>
        </div>
        ${f.metodo === "efectivo" ? `
        <div class="campo">
          <label for="pagoRecibido">Efectivo recibido <span class="opc">(vacío = exacto)</span></label>
          <input class="inp inp-num" id="pagoRecibido" data-in="pagoRecibido" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(f.recibido)}">
          <div class="rapidos">${billetes(num(f.monto)).map(v => `<button class="btn btn-s btn-sm" data-a="recibido" data-v="${v}">${dinero(v)}</button>`).join("")}</div>
        </div>
        <div id="cambio">${htmlCambio(f)}</div>` : `
        <div class="campo">
          <label for="pagoRef">Referencia o autorización <span class="opc">(opcional)</span></label>
          <input class="inp" id="pagoRef" data-in="pagoRef" maxlength="40" value="${esc(f.ref)}" autocomplete="off">
        </div>`}
        <button class="btn btn-p btn-lg btn-blq" data-a="registrarPago" data-i="${i}">${ic("check", "i-s")}Registrar pago</button>`}
        ${m.estado !== "cuenta" && c.total > 0 ? `<button class="btn btn-g btn-blq" style="margin-top:8px" data-a="solicitarCuenta" data-i="${i}">Marcar cuenta como solicitada</button>` : ""}
      </div>
    </div>
  </div>`;
}
function vCuentas() {
  const abiertas = db.mesas.map((m, i) => ({ m, i })).filter(x => x.m.sesion && !["libre", "limpieza"].includes(x.m.estado));
  abiertas.sort((a, b) => (b.m.estado === "cuenta") - (a.m.estado === "cuenta") || a.m.num - b.m.num);
  if (ui.cuentaSel !== null && !abiertas.some(x => x.i === ui.cuentaSel)) ui.cuentaSel = null;
  const sel = ui.cuentaSel;
  const pend = abiertas.filter(x => x.m.estado === "cuenta").length;
  const porCobrar = abiertas.reduce((s, x) => s + cuenta(x.i).restante, 0);
  return `
  <div class="cab">
    <div><h1>Cuentas</h1><p>${plural(abiertas.length, "cuenta abierta", "cuentas abiertas")} · ${plural(pend, "solicitud", "solicitudes")} de cobro · ${dinero(porCobrar)} por cobrar</p></div>
  </div>
  <div class="cuentas-lay ${sel !== null ? "con-detalle" : ""}">
    <section class="cuentas-lista superficie filas">${abiertas.length ? abiertas.map(({ m, i }) => {
      const c = cuenta(i);
      return `<button class="fila st-${m.estado} ${i === sel ? "sel" : ""}" data-a="cuentaSel" data-i="${i}">
        <span class="fila-tx"><b>Mesa ${m.num}</b><small class="con-punto"><span class="punto"></span>${ESTADOS[m.estado].t} · ${esc(m.mesero || "Sin asignar")}</small></span>
        <span class="fila-der"><b>${dinero(c.restante)}</b><small>${c.pagado ? `Pagado ${dinero(c.pagado)}` : plural(comensales(m), "comensal", "comensales")}</small></span>
      </button>`;
    }).join("") : `<div class="vacio">No hay cuentas abiertas.</div>`}</section>
    <section class="cuenta-det">${sel !== null ? htmlCuenta(sel)
      : `<div class="superficie vacio vacio-alto"><p>Seleccione una cuenta para consultar el consumo y registrar pagos.</p></div>`}</section>
  </div>`;
}

// ---------- Historial ----------
function vHistorial() {
  const desde = ui.histRango === "turno" ? turnoInicio() : ui.histRango === "hoy" ? inicioDia() : 0;
  const regs = db.registros.filter(r => (r.salida || 0) >= desde).slice().reverse();
  const pagos = db.pagos.filter(p => p.ts >= desde).slice().reverse();
  const act = db.actividad.filter(a => a.ts >= desde).slice().reverse();
  const cobradas = regs.filter(r => r.estado !== "sin_cobro");
  const anteriores = regs.filter(r => !r.sesion).reduce((s, r) => s + (r.total || 0), 0);
  const ventas = r2(pagos.reduce((s, p) => s + p.monto, 0) + anteriores);
  const propinas = r2(cobradas.reduce((s, r) => s + (r.propina || 0), 0));
  const tab = ["cuentas", "pagos", "actividad"].includes(ui.histTab) ? ui.histTab : "cuentas";
  let tabla = "";
  if (tab === "cuentas") {
    tabla = regs.length ? `<table class="tabla"><thead><tr><th>Cierre</th><th>Mesa</th><th class="ocultar-t">Comensales</th><th class="ocultar-t">Mesero</th><th>Consumo</th><th class="der">Total</th><th>Estado</th></tr></thead><tbody>${regs.map(r => {
      const items = r.lineas || Object.entries(r.pedido || {}).map(([id, q]) => ({ n: PLATILLOS[id]?.n || id, q }));
      const n = items.reduce((s, l) => s + l.q, 0);
      return `<tr>
        <td class="sec">${fechaHora(r.salida)}</td><td>Mesa ${r.mesa}</td>
        <td class="ocultar-t">${r.comensales ?? "—"}</td><td class="ocultar-t">${esc(r.mesero || "—")}</td>
        <td>${n ? `<details><summary>${plural(n, "producto")}</summary><ul>${items.map(l => `<li>${l.q}× ${esc(l.n)}</li>`).join("")}</ul></details>` : "—"}</td>
        <td class="der">${dinero(r.total)}</td>
        <td>${r.estado === "sin_cobro" ? `<span class="chip nv-alta">Sin cobro</span>` : `<span class="chip st-libre">Cobrada</span>`}</td>
      </tr>`;
    }).join("")}</tbody></table>` : `<div class="vacio">No hay cuentas cerradas en este periodo.</div>`;
  } else if (tab === "pagos") {
    tabla = pagos.length ? `<table class="tabla"><thead><tr><th>Hora</th><th>Mesa</th><th>Método</th><th class="ocultar-t">Referencia</th><th class="ocultar-t">Mesero</th><th class="der">Cambio</th><th class="der">Monto</th></tr></thead><tbody>${pagos.map(p => `<tr>
        <td class="sec">${fechaHora(p.ts)}</td><td>Mesa ${p.mesa}</td><td>${METODOS[p.metodo]?.t || esc(p.metodo)}</td>
        <td class="ocultar-t sec">${esc(p.ref || "—")}</td><td class="ocultar-t">${esc(p.mesero || "—")}</td>
        <td class="der sec">${p.cambio ? dinero(p.cambio) : "—"}</td><td class="der"><b>${dinero(p.monto)}</b></td></tr>`).join("")}</tbody></table>`
      : `<div class="vacio">No hay pagos registrados en este periodo.</div>`;
  } else {
    tabla = act.length ? `<table class="tabla"><thead><tr><th>Hora</th><th>Actividad</th><th class="ocultar-t">Usuario</th></tr></thead><tbody>${act.slice(0, 300).map(a => `<tr>
        <td class="sec">${fechaHora(a.ts)}</td><td>${a.tipo === "alerta" ? `${ic("alert-triangle", "i-xs")} ` : ""}${esc(a.texto)}</td><td class="ocultar-t sec">${esc(a.mesero || "—")}</td></tr>`).join("")}</tbody></table>`
      : `<div class="vacio">Sin actividad registrada en este periodo.</div>`;
  }
  return `
  <div class="cab">
    <div><h1>Historial</h1><p>Cuentas cerradas, pagos y actividad del sistema</p></div>
    <div class="seg">${[["turno", "Turno actual"], ["hoy", "Hoy"], ["todo", "Todo"]].map(([k, t]) =>
      `<button class="${ui.histRango === k ? "activo" : ""}" data-a="histRango" data-v="${k}">${t}</button>`).join("")}</div>
  </div>
  <div class="metricas metricas-4">
    <div class="metrica"><span>Ventas</span><b>${dinero(ventas)}</b><small>${plural(pagos.length, "pago")}</small></div>
    <div class="metrica"><span>Cuentas cobradas</span><b>${cobradas.length}</b><small>${regs.length - cobradas.length} sin cobro</small></div>
    <div class="metrica"><span>Ticket promedio</span><b>${dinero(cobradas.length ? cobradas.reduce((s, r) => s + (r.total || 0), 0) / cobradas.length : 0)}</b><small>por cuenta</small></div>
    <div class="metrica"><span>Propinas</span><b>${dinero(propinas)}</b><small>incluidas en ventas</small></div>
  </div>
  <div class="tabs">${[["cuentas", "Cuentas cerradas", regs.length], ["pagos", "Pagos", pagos.length], ["actividad", "Actividad", act.length]].map(([k, t, n]) =>
    `<button class="${tab === k ? "activo" : ""}" data-a="histTab" data-v="${k}">${t}<span class="cont">${n}</span></button>`).join("")}</div>
  <div class="superficie tabla-cont">${tabla}</div>`;
}

// ---------- Herramientas ----------
function vHerramientas() {
  const h = db.herr, ahora = Date.now();
  const mesaTxt = i => i != null ? `Mesa ${db.mesas[i]?.num ?? i + 1}` : "";
  const tareas = h.tareas.slice().sort((a, b) => a.hecha - b.hecha || b.ts - a.ts);
  const recs = h.recordatorios.filter(r => !r.hecho).sort((a, b) => a.cuando - b.cuando);
  const avisos = h.avisos.slice().reverse().slice(0, 12);
  const apoyo = h.apoyo.filter(s => !s.resuelto || (s.resueltoTs || 0) >= turnoInicio()).slice().reverse();
  const incid = h.incidencias.slice().reverse();
  const act = db.actividad.slice(-8).reverse();
  return `
  <div class="cab">
    <div><h1>Herramientas</h1><p>Notas, tareas y comunicación interna. La información se guarda en este dispositivo.</p></div>
  </div>
  <div class="herr">
    <section class="herr-sec">
      <div class="herr-cab"><h2>Notas personales</h2><small id="notasEstado">Guardado automático</small></div>
      <textarea class="inp" id="hNotas" data-in="notas" rows="6" placeholder="Notas del turno">${esc(h.notas)}</textarea>
    </section>

    <section class="herr-sec">
      <div class="herr-cab"><h2>Tareas pendientes</h2><small>${h.tareas.filter(t => !t.hecha).length} pendientes</small></div>
      <div class="form-linea">
        <input class="inp" id="hTarea" maxlength="120" placeholder="Nueva tarea" data-enter="addTarea" autocomplete="off">
        <button class="btn btn-s" data-a="addTarea">${ic("plus", "i-s")}Agregar</button>
      </div>
      <div class="items">${tareas.length ? tareas.map(t => `
        <div class="item ${t.hecha ? "hecha" : ""}">
          <button class="caja ${t.hecha ? "on" : ""}" data-a="tarea" data-id="${t.id}" aria-label="${t.hecha ? "Marcar pendiente" : "Marcar completada"}">${t.hecha ? ic("check", "i-xs") : ""}</button>
          <div class="item-tx"><span>${esc(t.texto)}</span></div>
          <button class="btn-ic btn-ic-s" data-a="delTarea" data-id="${t.id}" aria-label="Eliminar tarea">${ic("x", "i-s")}</button>
        </div>`).join("") : `<div class="vacio vacio-chico">Sin tareas registradas.</div>`}</div>
    </section>

    <section class="herr-sec">
      <div class="herr-cab"><h2>Recordatorios de mesas</h2><small>${recs.length} activos</small></div>
      <div class="form-linea">
        <input class="inp" id="hRecTexto" maxlength="120" placeholder="Ej. llevar pastel de cumpleaños" data-enter="addRec" autocomplete="off">
      </div>
      <div class="form-linea">
        <select class="inp" id="hRecMesa" aria-label="Mesa">${opcionesMesas(null)}</select>
        <select class="inp" id="hRecMin" aria-label="Avisar en">${[5, 10, 15, 20, 30, 45, 60].map(n => `<option value="${n}" ${n === 10 ? "selected" : ""}>En ${n} min</option>`).join("")}</select>
        <button class="btn btn-s" data-a="addRec">${ic("plus", "i-s")}Programar</button>
      </div>
      <div class="items">${recs.length ? recs.map(r => `
        <div class="item ${r.cuando <= ahora ? "vencido" : ""}">
          <div class="item-tx"><span>${esc(r.texto)}</span><small>${[mesaTxt(r.mesa), r.cuando <= ahora ? `Vencido · ${hora(r.cuando)}` : `A las ${hora(r.cuando)}`].filter(Boolean).join(" · ")}</small></div>
          <div class="item-acc">
            <button class="btn btn-s btn-sm" data-a="recHecho" data-id="${r.id}">Hecho</button>
            <button class="btn-ic btn-ic-s" data-a="delRec" data-id="${r.id}" aria-label="Eliminar recordatorio">${ic("x", "i-s")}</button>
          </div>
        </div>`).join("") : `<div class="vacio vacio-chico">Sin recordatorios activos.</div>`}</div>
    </section>

    <section class="herr-sec">
      <div class="herr-cab"><h2>Solicitudes de apoyo</h2><small>${h.apoyo.filter(s => !s.resuelto).length} abiertas</small></div>
      <div class="form-linea">
        <select class="inp" id="hApMesa" aria-label="Mesa">${opcionesMesas(null)}</select>
        <select class="inp" id="hApMotivo" aria-label="Motivo">${["Atención en mesa", "Apoyo para cobrar", "Limpieza", "Apoyo en cocina", "Gerente", "Otro"].map(t => `<option>${t}</option>`).join("")}</select>
        <button class="btn btn-s" data-a="addApoyo">${ic("plus", "i-s")}Solicitar</button>
      </div>
      <div class="items">${apoyo.length ? apoyo.map(s => `
        <div class="item ${s.resuelto ? "hecha" : ""}">
          <div class="item-tx"><span>${esc(s.motivo)}${s.mesa != null ? ` · ${mesaTxt(s.mesa)}` : ""}</span><small>${esc(s.autor || "")} · ${hora(s.ts)}${s.resuelto ? ` · atendida por ${esc(s.resueltoPor || "—")}` : ""}</small></div>
          ${s.resuelto ? "" : `<button class="btn btn-s btn-sm" data-a="apoyoOk" data-id="${s.id}">Atendida</button>`}
        </div>`).join("") : `<div class="vacio vacio-chico">Sin solicitudes en este turno.</div>`}</div>
    </section>

    <section class="herr-sec">
      <div class="herr-cab"><h2>Avisos de cocina y meseros</h2><small>${h.avisos.filter(v => !v.leido).length} sin leer</small></div>
      <div class="form-linea">
        <select class="inp" id="hAvOrigen" aria-label="Origen">${["Cocina", "Meseros", "Gerencia"].map(t => `<option>${t}</option>`).join("")}</select>
        <input class="inp" id="hAvTexto" maxlength="160" placeholder="Ej. se terminó la arrachera" data-enter="addAviso" autocomplete="off">
        <button class="btn btn-s" data-a="addAviso">${ic("plus", "i-s")}Publicar</button>
      </div>
      <div class="items">${avisos.length ? avisos.map(v => `
        <div class="item ${v.leido ? "" : ""}">
          <span class="chip ${v.origen === "Cocina" ? "nv-media" : "nv-baja"}">${esc(v.origen)}</span>
          <div class="item-tx"><span>${esc(v.texto)}</span><small>${esc(v.autor || "")} · ${fechaHora(v.ts)}${v.leido ? " · leído" : ""}</small></div>
          ${v.leido ? "" : `<button class="btn btn-s btn-sm" data-a="avisoLeido" data-id="${v.id}">Leído</button>`}
        </div>`).join("") : `<div class="vacio vacio-chico">Sin avisos publicados.</div>`}</div>
    </section>

    <section class="herr-sec">
      <div class="herr-cab"><h2>Registro de incidencias</h2><small>${h.incidencias.length} registradas</small></div>
      <div class="form-linea">
        <select class="inp" id="hInTipo" aria-label="Tipo">${["Queja de cliente", "Error en pedido", "Producto en mal estado", "Accidente", "Equipo o instalaciones", "Otro"].map(t => `<option>${t}</option>`).join("")}</select>
        <select class="inp" id="hInMesa" aria-label="Mesa">${opcionesMesas(null)}</select>
      </div>
      <div class="campo"><textarea class="inp" id="hInDesc" rows="2" maxlength="400" placeholder="Describa lo ocurrido"></textarea></div>
      <button class="btn btn-s" data-a="addInc">${ic("plus", "i-s")}Registrar incidencia</button>
      <div class="items" style="margin-top:10px">${incid.length ? incid.slice(0, 6).map(x => `
        <div class="item"><div class="item-tx"><span><b>${esc(x.tipo)}</b>${x.mesa != null ? ` · ${mesaTxt(x.mesa)}` : ""}</span><small>${esc(x.desc)}</small><small>${esc(x.autor || "")} · ${fechaHora(x.ts)}</small></div></div>`).join("")
        : `<div class="vacio vacio-chico">Sin incidencias registradas.</div>`}
        ${incid.length > 6 ? `<p class="mas-items">${incid.length - 6} incidencias anteriores en el respaldo de datos.</p>` : ""}
      </div>
    </section>

    <section class="herr-sec">
      <div class="herr-cab"><h2>Actividad reciente</h2><button class="btn btn-g btn-sm" data-a="nav" data-v="historial" data-f="actividad">Ver historial</button></div>
      <div class="items">${act.length ? act.map(a => `<div class="item"><div class="item-tx"><span>${esc(a.texto)}</span><small>${hora(a.ts)} · ${esc(a.mesero || "—")}</small></div></div>`).join("")
        : `<div class="vacio vacio-chico">Sin actividad registrada.</div>`}</div>
    </section>
  </div>`;
}

const VISTAS = { inicio: vInicio, mesas: vMesas, menu: vMenu, pedidos: vPedidos, cuentas: vCuentas, historial: vHistorial, herramientas: vHerramientas };

// =========================================================
//   Panel de mesa
// =========================================================
function accionPrincipal(i) {
  const m = db.mesas[i], b = borrador(i);
  if (m.estado === "libre") return { a: "sentar", ic: "user-plus", t: "Sentar clientes" };
  if (m.estado === "limpieza") return { a: "limpia", ic: "check", t: "Marcar como limpia" };
  if (b && b.items.length) return { a: "enviar", id: b.id, ic: "send", t: `Enviar a cocina · ${plural(articulos(b), "producto")}` };
  const listo = pedidosDe(i).find(p => p.estado === "listo");
  if (listo) return { a: "avanzar", id: listo.id, ic: "check", t: `Entregar pedido #${pad(listo.num)}` };
  if (m.estado === "cuenta") return { a: "irCuenta", ic: "banknote", t: `Cobrar ${dinero(cuenta(i).restante)}` };
  if (!consumo(i)) return { a: "irMenu", ic: "book-open", t: "Tomar pedido" };
  if (m.estado === "comiendo") return { a: "solicitarCuenta", ic: "receipt", t: "Solicitar cuenta" };
  return { a: "nav", v: "pedidos", ic: "clipboard-list", t: "Ver pedidos en cocina" };
}

function renderPanel() {
  const i = ui.mesaPanel;
  if (i === null) return;
  const m = db.mesas[i], c = cuenta(i), n = comensales(m), al = alertasMesa(i);
  const ps = pedidosDe(i).filter(p => p.items.length);
  const arriba = Math.ceil(m.cap / 2);
  const sillas = m.sillas.map((on, k) =>
    `<button class="silla ${on ? "on" : ""}" data-a="silla" data-i="${i}" data-v="${k}" aria-label="Silla ${k + 1}${on ? ", ocupada" : ""}" ${m.estado === "limpieza" ? "disabled" : ""}>${on ? ic("user") : ""}</button>`);
  const pr = accionPrincipal(i);
  const acciones = [
    { a: "solicitarCuenta", ic: "receipt", t: "Solicitar cuenta", off: !c.sub || m.estado === "cuenta" },
    { a: "irCuenta", ic: "divide", t: "Dividir cuenta", off: !c.sub },
    { a: "irCuenta", ic: "banknote", t: "Cobrar", off: !c.sub },
    { a: "transferir", ic: "arrow-left-right", t: "Transferir mesa", off: !m.sesion },
    { a: "limpieza", ic: "sparkles", t: "Marcar limpieza", off: m.estado === "limpieza" },
    { a: "liberar", ic: "rotate-ccw", t: "Liberar mesa", off: m.estado === "libre", cls: "peligro" }
  ];
  const cuerpo = $("cajon").querySelector(".cajon-cuerpo");
  const y = cuerpo ? cuerpo.scrollTop : 0;
  $("cajon").className = `cajon abierto st-${m.estado}`;
  $("cajon").innerHTML = `
    <div class="cajon-cab">
      <div>
        <h2>Mesa ${m.num}</h2>
        <div class="cajon-sub"><span class="chip"><span class="punto"></span>${ESTADOS[m.estado].t}</span><span>Capacidad ${m.cap}</span></div>
      </div>
      <button class="btn-ic" data-a="cerrarPanel" aria-label="Cerrar">${ic("x")}</button>
    </div>
    <div class="cajon-cuerpo">
      ${al.length ? `<div class="cajon-sec">${al.map(a => `<div class="nota nv-${a.nivel}">${ic(a.ic, "i-s")}<span><b>${esc(a.txt)}</b> · ${esc(a.det)}</span></div>`).join("")}</div>` : ""}
      <div class="cajon-sec">
        <div class="datos">
          <div class="dato"><span>Llegada</span><b>${hora(m.llegada)}</b></div>
          <div class="dato"><span>Tiempo en mesa</span><b>${m.llegada ? duracion(m.llegada) : "—"}</b></div>
          <div class="dato"><span>Mesero asignado</span><b>${esc(m.mesero || "Sin asignar")}</b></div>
          <div class="dato"><span>Total consumido</span><b>${dinero(c.sub)}</b></div>
        </div>
      </div>
      <div class="cajon-sec">
        <span class="etq">Estado de la mesa</span>
        <div class="estados">${Object.entries(ESTADOS).map(([k, e]) =>
          `<button class="st-${k} ${k === m.estado ? "activo" : ""}" data-a="estadoMesa" data-i="${i}" data-v="${k}"><span class="punto"></span>${e.t}</button>`).join("")}</div>
      </div>
      <div class="cajon-sec">
        <div class="sec-cab">
          <span class="etq">Comensales · ${n} de ${m.cap}</span>
          <div class="sec-acc">
            <button class="btn btn-s btn-sm" data-a="comensalMas" data-i="${i}" ${n >= m.cap || m.estado === "limpieza" ? "disabled" : ""}>${ic("plus", "i-s")}Comensal</button>
            <button class="btn btn-g btn-sm" data-a="sillasVaciar" data-i="${i}" ${n ? "" : "disabled"}>Vaciar</button>
          </div>
        </div>
        <div class="plano-g">
          <div class="fila-sillas">${sillas.slice(0, arriba).join("")}</div>
          <div class="tabla-g" style="width:${arriba * 54 + 6}px">${n}/${m.cap}</div>
          <div class="fila-sillas">${sillas.slice(arriba).join("")}</div>
        </div>
      </div>
      <div class="cajon-sec">
        <div class="sec-cab">
          <span class="etq">Pedidos${ps.length ? ` · ${ps.length}` : ""}</span>
          ${m.estado !== "limpieza" ? `<button class="btn btn-g btn-sm" data-a="irMenu" data-i="${i}">${ic("plus", "i-s")}Agregar productos</button>` : ""}
        </div>
        ${ps.length ? ps.map(p => `
          <div class="ped ep-${p.estado}">
            <div class="ped-cab"><span><b>#${pad(p.num)}</b> · ${hora(p.enviado || p.creado)}${ACTIVOS_COCINA.includes(p.estado) ? ` · ${duracion(p.enviado)}` : ""}</span><span class="chip"><span class="punto"></span>${EST_PEDIDO[p.estado].t}</span></div>
            <div class="lineas">${p.items.map(l => htmlLinea(l)).join("")}</div>
            ${p.obs ? `<div class="ticket-obs" style="margin:0 12px 10px"><b>Nota:</b> ${esc(p.obs)}</div>` : ""}
            ${p.estado === "pendiente" ? `<div class="ped-acc"><button class="btn btn-s btn-sm" data-a="irMenu" data-i="${i}">Editar</button><button class="btn btn-p btn-sm" data-a="enviar" data-id="${p.id}">${ic("send", "i-s")}Enviar a cocina</button></div>`
              : p.estado === "listo" ? `<div class="ped-acc"><button class="btn btn-p btn-sm" data-a="avanzar" data-id="${p.id}">${ic("check", "i-s")}Marcar entregado</button></div>` : ""}
          </div>`).join("") : `<div class="vacio vacio-chico">Sin pedidos registrados.</div>`}
        ${c.sub ? `<div class="totales">
          <div class="t"><span>Subtotal</span><span>${dinero(c.sub)}</span></div>
          ${c.pagado ? `<div class="t"><span>Pagado</span><span>${dinero(c.pagado)}</span></div>` : ""}
          <div class="t gran"><span>Total con propina (${c.pct}%)</span><span>${dinero(c.total)}</span></div>
        </div>` : ""}
      </div>
      ${m.sesion ? `<div class="cajon-sec">
        <label class="etq" for="notasMesa" style="display:block;margin-bottom:10px">Observaciones</label>
        <textarea class="inp" id="notasMesa" data-in="notasMesa" data-i="${i}" rows="2" maxlength="300" placeholder="Alergias, preferencias, ocasión especial">${esc(m.notas)}</textarea>
      </div>` : ""}
      <div class="cajon-sec">
        <span class="etq">Acciones</span>
        <div class="acciones">${acciones.map(x =>
          `<button class="accion ${x.cls || ""}" data-a="${x.a}" data-i="${i}" ${x.off ? "disabled" : ""}>${ic(x.ic)}${x.t}</button>`).join("")}</div>
      </div>
    </div>
    <div class="cajon-pie">
      <button class="btn btn-s btn-lg" data-a="irMenu" data-i="${i}" ${m.estado === "limpieza" ? "disabled" : ""}>${ic("book-open", "i-s")}Menú</button>
      <button class="btn btn-p btn-lg" data-a="${pr.a}" data-i="${i}" ${pr.id ? `data-id="${pr.id}"` : ""} ${pr.v ? `data-v="${pr.v}"` : ""}>${ic(pr.ic, "i-s")}${pr.t}</button>
    </div>`;
  const nuevo = $("cajon").querySelector(".cajon-cuerpo");
  if (nuevo) nuevo.scrollTop = y;
}
function abrirPanel(i) {
  ui.mesaPanel = i;
  renderPanel();
  $("velo").classList.add("abierto");
  actualizarBloqueo();
}
function cerrarPanel() {
  ui.mesaPanel = null;
  $("cajon").classList.remove("abierto");
  $("velo").classList.remove("abierto");
  actualizarBloqueo();
}

// =========================================================
//   Modales específicos
// =========================================================
// ---------- Sentar clientes ----------
let sentarSel = { mesa: null, n: 2, fija: false };
function abrirSentar(i) {
  const libres = db.mesas.map((m, k) => k).filter(k => db.mesas[k].estado === "libre");
  if (i == null && !libres.length) { aviso("No hay mesas libres en este momento.", "error"); return; }
  const mesa = i ?? (libres.length === 1 ? libres[0] : null);
  sentarSel = { mesa, n: Math.min(2, mesa != null ? db.mesas[mesa].cap : 2), fija: i != null };
  abrirModal({ tipo: "sentar", render: htmlSentar });
}
function htmlSentar() {
  const libres = db.mesas.map((m, k) => ({ m, k })).filter(x => x.m.estado === "libre");
  const cap = sentarSel.mesa != null ? db.mesas[sentarSel.mesa].cap : Math.max(...db.mesas.map(m => m.cap));
  return `
    <div class="modal-cab"><div><h3>Sentar clientes</h3><p class="sub">${sentarSel.fija ? `Mesa ${db.mesas[sentarSel.mesa].num}` : "Seleccione la mesa y el número de comensales"}</p></div>
      <button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button></div>
    <div class="modal-cuerpo">
      ${sentarSel.fija ? "" : `<div class="grupo"><span class="etq">Mesa</span><div class="opciones" style="margin-top:8px">${libres.map(({ m, k }) =>
        `<button class="opcion ${sentarSel.mesa === k ? "activo" : ""}" data-a="sentarMesa" data-v="${k}">Mesa ${m.num}<small>${m.cap} lugares</small></button>`).join("")}</div></div>`}
      <div class="grupo"><span class="etq">Comensales</span><div class="opciones opciones-n" style="margin-top:8px">${Array.from({ length: cap }, (_, k) => k + 1).map(n =>
        `<button class="opcion ${sentarSel.n === n ? "activo" : ""}" data-a="sentarN" data-v="${n}">${n}</button>`).join("")}</div></div>
    </div>
    <div class="modal-pie">
      <button class="btn btn-s" data-a="cerrarModal">Cancelar</button>
      <button class="btn btn-p" data-a="sentarOk" ${sentarSel.mesa == null ? "disabled" : ""}>${ic("user-plus", "i-s")}Sentar ${plural(sentarSel.n, "comensal", "comensales")}</button>
    </div>`;
}

// ---------- Producto ----------
let prod = null;
function abrirProducto(pid, edicion) {
  const p = PLATILLOS[pid];
  if (!p) return;
  if (edicion) {
    const l = edicion.linea;
    prod = { pid, q: l.q, extras: new Set((l.extras || []).map(e => e.n)), comp: new Set((l.comp || []).map(e => e.n)),
             sin: new Set(l.sin || []), obs: l.obs || "", edit: { pedido: edicion.pedido, lid: l.lid }, mesa: ui.menuMesa };
  } else {
    prod = { pid, q: 1, extras: new Set(), comp: new Set(), sin: new Set(), obs: "", edit: null, mesa: ui.menuMesa };
  }
  abrirModal({ tipo: "producto", render: htmlProducto });
}
function precioUnit() {
  const p = PLATILLOS[prod.pid];
  return p.p + [...(p.extras || []).filter(e => prod.extras.has(e.n)), ...(p.comp || []).filter(e => prod.comp.has(e.n))].reduce((s, e) => s + e.p, 0);
}
const textoBotonProd = () => `${prod.edit ? "Actualizar" : "Agregar al pedido"} · ${dinero(precioUnit() * prod.q)}`;
function htmlProducto() {
  const p = PLATILLOS[prod.pid], ag = agotado(p.id);
  const grupo = (titulo, clave, ops) => ops && ops.length ? `<div class="grupo"><span class="etq">${titulo}</span>${ops.map(o =>
    `<label class="check"><input type="checkbox" data-mod="${clave}" value="${esc(o.n)}" ${prod[clave].has(o.n) ? "checked" : ""}><span>${esc(o.n)}</span><span class="precio">${o.p ? "+ " + dinero(o.p) : "Incluido"}</span></label>`).join("")}</div>` : "";
  const mesasOk = db.mesas.map((m, k) => ({ m, k })).filter(x => x.m.estado !== "limpieza");
  return `
    <div class="modal-cab">
      <div class="prod-cab">
        ${p.foto ? `<span class="plat-foto"><img src="${esc(p.foto)}" alt=""></span>` : ""}
        <div><h3>${esc(p.n)}</h3><p class="sub">${esc(p.d)}</p><b>${dinero(p.p)}</b></div>
      </div>
      <button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button>
    </div>
    <div class="modal-cuerpo">
      ${ag ? `<div class="nota nv-alta">${ic("ban", "i-s")}<span>Este producto está marcado como agotado y no puede agregarse a pedidos.</span></div>` : `
      ${prod.mesa === null && !prod.edit ? `<div class="campo"><label for="prodMesa">Mesa</label>
        <select class="inp" id="prodMesa"><option value="">Seleccione una mesa</option>${mesasOk.map(({ m, k }) => `<option value="${k}">Mesa ${m.num} · ${ESTADOS[m.estado].t}</option>`).join("")}</select></div>` : ""}
      <div class="campo"><span class="lbl">Cantidad</span>
        <div><div class="stepper stepper-lg">
          <button data-a="prodQ" data-d="-1" aria-label="Disminuir">${ic("minus")}</button><b id="prodQ">${prod.q}</b><button data-a="prodQ" data-d="1" aria-label="Aumentar">${ic("plus")}</button>
        </div></div>
      </div>
      ${grupo("Extras", "extras", p.extras)}
      ${grupo("Complementos", "comp", p.comp)}
      ${p.sin && p.sin.length ? `<div class="grupo"><span class="etq">Quitar ingredientes</span>${p.sin.map(s =>
        `<label class="check"><input type="checkbox" data-mod="sin" value="${esc(s)}" ${prod.sin.has(s) ? "checked" : ""}><span>Sin ${esc(s.toLowerCase())}</span></label>`).join("")}</div>` : ""}
      <div class="campo"><label for="prodObs">Observaciones</label>
        <textarea class="inp" id="prodObs" rows="2" maxlength="140" placeholder="Ej. término medio, salsa aparte">${esc(prod.obs)}</textarea></div>`}
    </div>
    <div class="modal-pie">
      <button class="btn btn-g" data-a="toggleAgotado" data-id="${p.id}">${ic(ag ? "check" : "ban", "i-s")}${ag ? "Marcar disponible" : "Marcar agotado"}</button>
      <span class="flex1"></span>
      ${ag ? `<button class="btn btn-s" data-a="cerrarModal">Cerrar</button>` : `<button class="btn btn-p" data-a="prodConfirmar" id="prodBtn">${textoBotonProd()}</button>`}
    </div>`;
}
function confirmarProducto() {
  const p = PLATILLOS[prod.pid];
  if (agotado(p.id)) { aviso("El producto está agotado.", "error"); return false; }
  let mesa = prod.mesa;
  if (mesa === null && !prod.edit) {
    const v = $("prodMesa")?.value;
    if (v === "" || v == null) { aviso("Seleccione la mesa para el pedido.", "error"); $("prodMesa")?.focus(); return false; }
    mesa = +v;
  }
  const linea = crearLinea(p, prod.q, [...prod.extras], [...prod.comp], [...prod.sin], prod.obs);
  if (prod.edit) {
    const ped = db.pedidos.find(x => x.id === prod.edit.pedido);
    if (!ped || ped.estado !== "pendiente") { aviso("El pedido ya fue enviado a cocina y no puede editarse.", "error"); return false; }
    const k = ped.items.findIndex(l => l.lid === prod.edit.lid);
    if (k < 0) return false;
    linea.lid = prod.edit.lid;
    ped.items[k] = linea;
    aviso(`${p.n} actualizado`);
  } else {
    if (!agregarLinea(mesa, linea)) return false;
    ui.menuMesa = mesa;
    aviso(`${prod.q} × ${p.n} agregado · Mesa ${db.mesas[mesa].num}`);
  }
  return true;
}

// ---------- Transferir mesa ----------
let transferSel = null;
function abrirTransferir(i) {
  const m = db.mesas[i];
  transferSel = null;
  abrirModal({ tipo: "transferir", render: () => {
    const otros = db.config.meseros.filter(x => x !== m.mesero);
    return `
      <div class="modal-cab"><div><h3>Transferir mesa ${m.num}</h3><p class="sub">Responsable actual: ${esc(m.mesero || "Sin asignar")}</p></div>
        <button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button></div>
      <div class="modal-cuerpo">${otros.length ? `<div class="opciones" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${otros.map(x =>
        `<button class="opcion ${transferSel === x ? "activo" : ""}" data-a="transferSel" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div>`
        : `<div class="vacio vacio-chico">No hay otros meseros registrados. Agréguelos en Configuración.</div>`}</div>
      <div class="modal-pie">
        <button class="btn btn-s" data-a="cerrarModal">Cancelar</button>
        ${otros.length ? `<button class="btn btn-p" data-a="transferOk" data-i="${i}" ${transferSel ? "" : "disabled"}>${ic("arrow-left-right", "i-s")}Transferir</button>`
          : `<button class="btn btn-p" data-a="config">Ir a configuración</button>`}
      </div>`;
  }});
}

// ---------- Inicio de turno / usuario ----------
let ingresoTurno = null;
function abrirIngreso() {
  const h = new Date().getHours();
  ingresoTurno = h < 12 ? "Matutino" : h < 18 ? "Vespertino" : "Nocturno";
  const fijo = !db.config.usuario || !db.config.turno;
  abrirModal({ tipo: "ingreso", fijo, render: () => {
    const conTurno = !!db.config.turno;
    return `
      <div class="modal-cab"><div><h3>${conTurno ? "Cambiar de usuario" : "Iniciar turno"}</h3><p class="sub">Carles Restaurant · Sistema de mesas</p></div>
        ${fijo ? "" : `<button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button>`}</div>
      <div class="modal-cuerpo">
        <div class="campo"><label for="ingNombre">Nombre del mesero</label>
          <input class="inp" id="ingNombre" list="lstMeseros" maxlength="40" autocomplete="off" placeholder="Nombre y apellido" data-enter="ingresar" value="${esc(conTurno ? "" : db.config.usuario || "")}">
          <datalist id="lstMeseros">${db.config.meseros.map(x => `<option value="${esc(x)}">`).join("")}</datalist>
        </div>
        ${conTurno ? `<p class="texto-confirm">El turno ${esc(db.config.turno.nombre.toLowerCase())} iniciado a las ${hora(db.config.turno.inicio)} continúa activo.</p>` : `
        <div class="campo"><span class="lbl">Turno</span>
          <div class="seg">${TURNOS.map(t => `<button class="${ingresoTurno === t ? "activo" : ""}" data-a="ingresoTurno" data-v="${t}">${t}</button>`).join("")}</div>
        </div>`}
      </div>
      <div class="modal-pie">
        ${fijo ? "" : `<button class="btn btn-s" data-a="cerrarModal">Cancelar</button>`}
        <button class="btn btn-p" data-a="ingresar">${conTurno ? "Continuar" : "Iniciar turno"}</button>
      </div>`;
  }});
  setTimeout(() => $("ingNombre")?.focus(), 50);
}

// ---------- Configuración ----------
function abrirConfig(seccion) {
  abrirModal({ tipo: "config", vivo: true, clase: "modal-ancho", render: htmlConfig });
  if (seccion) setTimeout(() => $("cfg-" + seccion)?.scrollIntoView({ block: "start" }), 30);
}
function htmlConfig() {
  const c = db.config, t = c.turno, L = c.limites;
  return `
    <div class="modal-cab"><div><h3>Perfil y configuración</h3><p class="sub">Los cambios se aplican de inmediato en este dispositivo</p></div>
      <button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button></div>
    <div class="modal-cuerpo">
      <section class="cfg-sec">
        <div class="cfg-fila" style="flex-wrap:wrap">
          <div class="perfil"><span class="avatar">${esc(iniciales(c.usuario))}</span>
            <div><b>${esc(c.usuario || "Sin usuario")}</b><small>${t ? `Turno ${t.nombre.toLowerCase()} · desde ${hora(t.inicio)}` : "Sin turno activo"}</small></div></div>
          <div class="sec-acc">
            <button class="btn btn-s btn-sm" data-a="cambiarUsuario">${ic("user", "i-s")}Cambiar usuario</button>
            <button class="btn btn-peligro btn-sm" data-a="cerrarTurno">${ic("log-out", "i-s")}Cerrar turno</button>
          </div>
        </div>
      </section>
      <section class="cfg-sec">
        <h4>Meseros</h4>
        <div class="form-linea">
          <input class="inp" id="cfgMesero" maxlength="40" placeholder="Nombre del mesero" data-enter="addMesero" autocomplete="off">
          <button class="btn btn-s" data-a="addMesero">${ic("plus", "i-s")}Agregar</button>
        </div>
        ${c.meseros.map(x => `<div class="cfg-fila"><span>${esc(x)}${x === c.usuario ? ` <span class="chip st-ocupada">Activo</span>` : ""}</span>
          ${x === c.usuario ? "" : `<button class="btn-ic btn-ic-s" data-a="delMesero" data-v="${esc(x)}" aria-label="Quitar ${esc(x)}">${ic("x", "i-s")}</button>`}</div>`).join("")}
      </section>
      <section class="cfg-sec">
        <h4>Mesas del salón</h4>
        <div class="cfg-grid">${db.mesas.map((m, i) => `<div class="cfg-fila"><span>Mesa ${m.num}</span>
          <select class="inp" data-ch="capMesa" data-i="${i}" ${m.estado !== "libre" ? "disabled title='Solo se puede modificar con la mesa libre'" : ""}>${[2, 4, 6, 8, 10, 12].map(n => `<option value="${n}" ${n === m.cap ? "selected" : ""}>${n} lugares</option>`).join("")}</select></div>`).join("")}</div>
        <div class="form-linea" style="margin-top:10px">
          <button class="btn btn-s btn-sm" data-a="addMesa">${ic("plus", "i-s")}Agregar mesa</button>
          <button class="btn btn-s btn-sm" data-a="quitarMesa" ${db.mesas.length <= 1 ? "disabled" : ""}>${ic("minus", "i-s")}Quitar mesa ${db.mesas.length}</button>
        </div>
      </section>
      <section class="cfg-sec" id="cfg-alertas">
        <h4>Tiempos de alerta (minutos)</h4>
        <div class="cfg-grid">${[["sinAtencion", "Mesa sin pedido"], ["cocina", "Pedido en cocina"], ["entrega", "Pedido listo sin entregar"], ["cuenta", "Cuenta sin cobrar"], ["limpieza", "Mesa sin limpiar"]].map(([k, t]) =>
          `<div class="cfg-fila"><label for="lim-${k}">${t}</label><input class="inp inp-num" style="width:90px;height:34px" id="lim-${k}" type="number" min="1" max="240" data-ch="limite" data-k="${k}" value="${L[k]}"></div>`).join("")}</div>
      </section>
      <section class="cfg-sec">
        <h4>Cobro</h4>
        <div class="cfg-fila"><label for="cfgPropina">Propina sugerida</label>
          <select class="inp" id="cfgPropina" data-ch="propinaDef">${[0, 10, 15, 20].map(p => `<option value="${p}" ${c.propina === p ? "selected" : ""}>${p}%</option>`).join("")}</select></div>
      </section>
      <section class="cfg-sec">
        <h4>Datos</h4>
        <div class="cfg-fila"><span class="texto-confirm">Descargue una copia de mesas, pedidos, pagos e historial en formato JSON.</span>
          <button class="btn btn-s btn-sm" data-a="exportar">${ic("download", "i-s")}Exportar respaldo</button></div>
      </section>
    </div>`;
}

function exportar() {
  const datos = { exportado: new Date().toISOString(), config: db.config, mesas: db.mesas, pedidos: db.pedidos, pagos: db.pagos,
                  registros: db.registros, herramientas: db.herr, actividad: db.actividad };
  const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = `carles-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  log("Respaldo de datos exportado");
  aviso("Respaldo descargado");
}

function abrirMas() {
  abrirModal({ tipo: "mas", render: () => `
    <div class="modal-cab"><h3>Más opciones</h3><button class="btn-ic" data-a="cerrarModal" aria-label="Cerrar">${ic("x")}</button></div>
    <div class="modal-cuerpo"><div class="superficie filas">
      ${[["historial", "Historial", "history", "Cuentas cerradas, pagos y actividad"], ["herramientas", "Herramientas", "wrench", "Notas, tareas, avisos e incidencias"]].map(([v, t, i, d]) => `
        <button class="fila" data-a="nav" data-v="${v}"><span class="fila-ic">${ic(i, "i-s")}</span><span class="fila-tx"><b>${t}</b><small>${d}</small></span>${ic("chevron-right", "i-s tenue")}</button>`).join("")}
      <button class="fila" data-a="config"><span class="fila-ic">${ic("settings", "i-s")}</span><span class="fila-tx"><b>Configuración</b><small>Perfil, turno, meseros, mesas y alertas</small></span>${ic("chevron-right", "i-s tenue")}</button>
    </div></div>` });
}

// =========================================================
//   Render general
// =========================================================
function renderNav() {
  const s = estadisticas();
  const badges = { pedidos: s.listos, cuentas: db.mesas.filter(m => m.estado === "cuenta").length, herramientas: db.herr.apoyo.filter(x => !x.resuelto).length };
  const item = ([v, t, i]) => `<button class="nav-it ${ui.vista === v ? "activo" : ""}" data-a="nav" data-v="${v}" ${ui.vista === v ? 'aria-current="page"' : ""}>${ic(i)}<span>${t}</span>${badges[v] ? `<span class="nav-badge">${badges[v]}</span>` : ""}</button>`;
  $("navLateral").innerHTML = NAV.map(item).join("");
  $("navLateralPie").innerHTML = `<button class="nav-it" data-a="config">${ic("settings")}<span>Configuración</span></button>`;
  const masActivo = ["historial", "herramientas"].includes(ui.vista);
  $("navInferior").innerHTML = NAV.slice(0, 5).map(item).join("") +
    `<button class="nav-it ${masActivo ? "activo" : ""}" data-a="mas">${ic("more-horizontal")}<span>Más</span>${badges.herramientas ? `<span class="nav-badge">${badges.herramientas}</span>` : ""}</button>`;
}
function renderTop() {
  const ahora = new Date(), t = db.config.turno;
  const fecha = ahora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  $("topInfo").innerHTML = `<b>${ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</b>
    <span class="ocultar-m">${fecha.charAt(0).toUpperCase() + fecha.slice(1)}</span>
    ${t ? `<span class="separador ocultar-m"></span><span class="ocultar-m">Turno ${t.nombre.toLowerCase()} · desde ${hora(t.inicio)}</span>` : ""}`;
  const u = db.config.usuario;
  $("btnUsuario").innerHTML = `<span class="avatar">${esc(iniciales(u))}</span><span class="usuario-tx"><b>${esc(u || "Sin usuario")}</b><small>Mesero</small></span>`;
  const n = alertasCache.filter(a => a.nivel !== "baja").length;
  $("notifInd").textContent = n ? (n > 9 ? "9+" : n) : "";
}
function pintarNotif() {
  const el = $("notif");
  el.classList.toggle("abierto", ui.notif);
  if (!ui.notif) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="pop-cab"><b>Alertas</b><span class="cont">${alertasCache.length}</span></div>
    <div class="pop-cuerpo filas">${alertasCache.length ? alertasCache.map(htmlAlerta).join("") : `<div class="vacio">Sin alertas activas.</div>`}</div>
    <div class="pop-pie"><button class="btn btn-g btn-sm" data-a="config" data-v="alertas">Configurar tiempos de alerta</button></div>`;
}
function render() {
  alertasCache = calcularAlertas();
  const y = window.scrollY;
  $("vista").innerHTML = VISTAS[ui.vista] ? VISTAS[ui.vista]() : vInicio();
  window.scrollTo(0, y);
  renderNav();
  renderTop();
  pintarNotif();
  if (ui.mesaPanel !== null) renderPanel();
  if (modalActual?.vivo) pintarModal();
}
function hecho() { guardar(); render(); }

function irA(vista, filtro) {
  if (!VISTAS[vista]) return;
  if (filtro) {
    if (vista === "mesas") ui.filtroMesas = filtro;
    if (vista === "pedidos") ui.pedTab = filtro;
    if (vista === "historial") ui.histTab = filtro;
  }
  const cambio = ui.vista !== vista;
  ui.vista = vista;
  ui.notif = false;
  guardarUi();
  if (modalActual && !modalActual.fijo) cerrarModal();
  if (ui.mesaPanel !== null) cerrarPanel();
  render();
  if (cambio) window.scrollTo(0, 0);
}

// =========================================================
//   Eventos
// =========================================================
async function ejecutar(a, d) {
  const i = d.i === undefined || d.i === "" ? null : +d.i;
  switch (a) {
    // Navegación
    case "nav": irA(d.v, d.f); return;
    case "mas": abrirMas(); return;
    case "config":
      ui.notif = false; pintarNotif();
      if (modalActual && !modalActual.fijo) cerrarModal();
      abrirConfig(d.v); return;
    case "notif": ui.notif = !ui.notif; pintarNotif(); return;
    case "alerta": {
      const al = alertasCache.find(x => x.id === d.k);
      ui.notif = false; pintarNotif();
      if (!al) return;
      if (al.ir?.vista === "cuentas") { ui.cuentaSel = al.ir.mesa; irA("cuentas"); return; }
      if (al.ir?.vista) { irA(al.ir.vista, al.ir.tab); return; }
      if (al.mesa != null) abrirPanel(al.mesa);
      return;
    }
    case "cerrarModal": cerrarModal(); return;

    // Mesas
    case "filtroMesas": ui.filtroMesas = d.v; guardarUi(); render(); return;
    case "abrirMesa": abrirPanel(i); return;
    case "cerrarPanel": cerrarPanel(); return;
    case "sentar": abrirSentar(i); return;
    case "sentarMesa": sentarSel.mesa = +d.v; sentarSel.n = Math.min(sentarSel.n, db.mesas[+d.v].cap); pintarModal(); return;
    case "sentarN": sentarSel.n = +d.v; pintarModal(); return;
    case "sentarOk": {
      const k = sentarSel.mesa;
      if (k == null || db.mesas[k].estado !== "libre") { aviso("La mesa seleccionada ya no está libre.", "error"); pintarModal(); return; }
      abrirSesion(k, sentarSel.n);
      log(`Mesa ${db.mesas[k].num} ocupada · ${plural(sentarSel.n, "comensal", "comensales")}`);
      cerrarModal(); hecho(); abrirPanel(k);
      aviso(`Mesa ${db.mesas[k].num} ocupada · ${plural(sentarSel.n, "comensal", "comensales")}`);
      return;
    }
    case "estadoMesa": if (await cambiarEstadoMesa(i, d.v)) hecho(); return;
    case "silla": {
      const m = db.mesas[i], k = +d.v;
      if (m.estado === "libre") { abrirSesion(i, 0); m.sillas[k] = true; log(`Mesa ${m.num} ocupada`); }
      else {
        m.sillas[k] = !m.sillas[k];
        if (m.estado === "ocupada" && !comensales(m) && !pedidosDe(i).some(p => p.items.length && p.estado !== "cancelado")) {
          Object.assign(m, mesaVacia(m.num, m.cap));
          aviso(`Mesa ${m.num} disponible`, "info");
        }
      }
      hecho(); return;
    }
    case "comensalMas": {
      const m = db.mesas[i], k = m.sillas.indexOf(false);
      if (k < 0) { aviso("La mesa está a su capacidad máxima.", "error"); return; }
      if (m.estado === "libre") abrirSesion(i, 0);
      m.sillas[k] = true; m.atencion = Date.now();
      hecho(); return;
    }
    case "sillasVaciar": {
      const m = db.mesas[i];
      m.sillas = m.sillas.map(() => false);
      if (m.estado === "ocupada" && !pedidosDe(i).some(p => p.items.length && p.estado !== "cancelado")) Object.assign(m, mesaVacia(m.num, m.cap));
      hecho(); return;
    }
    case "irMenu":
      ui.menuMesa = i; ui.busqueda = ""; irA("menu"); return;
    case "irCuenta":
      ui.cuentaSel = i; irA("cuentas"); return;
    case "solicitarCuenta": if (solicitarCuenta(i)) hecho(); return;
    case "transferir": abrirTransferir(i); return;
    case "transferSel": transferSel = d.v; pintarModal(); return;
    case "transferOk": {
      const m = db.mesas[i], antes = m.mesero;
      if (!transferSel || !m.sesion) return;
      m.mesero = transferSel;
      db.pedidos.filter(p => p.sesion === m.sesion && ["pendiente", ...ACTIVOS_COCINA].includes(p.estado)).forEach(p => p.mesero = transferSel);
      log(`Mesa ${m.num} transferida de ${antes || "sin asignar"} a ${transferSel}`);
      aviso(`Mesa ${m.num} asignada a ${transferSel}`);
      cerrarModal(); hecho(); return;
    }
    case "limpieza": if (await desocupar(i, "limpieza")) hecho(); return;
    case "liberar": if (await desocupar(i, "libre")) hecho(); return;
    case "limpia": marcarLimpia(i); hecho(); return;

    // Menú y carrito
    case "menuCat": ui.menuCat = d.v; ui.busqueda = ""; guardarUi(); render(); return;
    case "producto": abrirProducto(d.id); return;
    case "prodQ": {
      prod.q = Math.max(1, Math.min(50, prod.q + +d.d));
      $("prodQ").textContent = prod.q;
      $("prodBtn") && ($("prodBtn").textContent = textoBotonProd());
      return;
    }
    case "prodConfirmar":
      prod.obs = $("prodObs")?.value || "";
      if (confirmarProducto()) { cerrarModal(); hecho(); }
      return;
    case "toggleAgotado": {
      const p = PLATILLOS[d.id], ag = agotado(d.id);
      db.config.agotados = ag ? db.config.agotados.filter(x => x !== d.id) : [...db.config.agotados, d.id];
      log(`${p.n} marcado como ${ag ? "disponible" : "agotado"}`);
      aviso(`${p.n} ${ag ? "disponible" : "marcado como agotado"}`, "info");
      guardar(); pintarModal(); render(); return;
    }
    case "editarLinea": {
      const ped = db.pedidos.find(x => x.id === d.id), l = ped?.items.find(x => x.lid === d.lid);
      if (l) abrirProducto(l.pid, { pedido: ped.id, linea: l });
      return;
    }
    case "lineaQ": case "quitarLinea": {
      const ped = db.pedidos.find(x => x.id === d.id);
      if (!ped || ped.estado !== "pendiente") return;
      const k = ped.items.findIndex(x => x.lid === d.lid);
      if (k < 0) return;
      const q = a === "quitarLinea" ? 0 : ped.items[k].q + +d.d;
      if (q <= 0) ped.items.splice(k, 1); else ped.items[k].q = Math.min(50, q);
      if (!ped.items.length) { ped.estado = "cancelado"; ped.cancelado = Date.now(); }
      hecho(); return;
    }
    case "verCarrito":
      abrirModal({ tipo: "carrito", vivo: true, render: () => `<div class="carrito carrito-modal">${htmlCarrito(true)}</div>` });
      return;
    case "enviar":
      if (enviarPedido(d.id)) { if (modalActual?.tipo === "carrito") cerrarModal(); hecho(); }
      return;
    case "avanzar": if (avanzarPedido(d.id)) hecho(); return;
    case "cancelar": if (await cancelarPedido(d.id)) { if (modalActual?.tipo === "carrito") cerrarModal(); hecho(); } return;
    case "pedTab": ui.pedTab = d.v; guardarUi(); render(); return;

    // Cuentas
    case "cuentaSel": ui.cuentaSel = i; ui.pago = null; render(); window.scrollTo(0, 0); return;
    case "propina": {
      const m = db.mesas[i];
      m.propina = +d.v; ui.pago = null;
      hecho(); return;
    }
    case "personas": {
      const m = db.mesas[i], actual = m.personas || Math.max(1, comensales(m));
      m.personas = Math.max(1, Math.min(20, actual + +d.d));
      hecho(); return;
    }
    case "montoRest": formPago(i).monto = cuenta(i).restante.toFixed(2); render(); return;
    case "montoParte": {
      const m = db.mesas[i], c = cuenta(i), n = m.personas || Math.max(1, comensales(m));
      let parte = r2(c.total / n);
      if (c.restante - parte < 0.05) parte = c.restante;
      formPago(i).monto = parte.toFixed(2); render(); return;
    }
    case "metodo": if (ui.pago) { ui.pago.metodo = d.v; ui.pago.recibido = ""; } render(); return;
    case "recibido": if (ui.pago) { ui.pago.recibido = String(d.v); } render(); return;
    case "registrarPago": if (registrarPago(i)) hecho(); return;

    // Historial
    case "histTab": ui.histTab = d.v; guardarUi(); render(); return;
    case "histRango": ui.histRango = d.v; guardarUi(); render(); return;

    // Herramientas
    case "addTarea": {
      const t = $("hTarea").value.trim();
      if (!t) { aviso("Escriba la descripción de la tarea.", "error"); $("hTarea").focus(); return; }
      db.herr.tareas.push({ id: uid(), texto: t, hecha: false, ts: Date.now(), autor: db.config.usuario });
      hecho(); $("hTarea")?.focus(); return;
    }
    case "tarea": { const t = db.herr.tareas.find(x => x.id === d.id); if (t) t.hecha = !t.hecha; hecho(); return; }
    case "delTarea": db.herr.tareas = db.herr.tareas.filter(x => x.id !== d.id); hecho(); return;
    case "addRec": {
      const t = $("hRecTexto").value.trim();
      if (!t) { aviso("Escriba el texto del recordatorio.", "error"); $("hRecTexto").focus(); return; }
      const mv = $("hRecMesa").value, minutos = +$("hRecMin").value;
      db.herr.recordatorios.push({ id: uid(), texto: t, mesa: mv === "" ? null : +mv, cuando: Date.now() + minutos * 60000, hecho: false, creado: Date.now(), autor: db.config.usuario });
      aviso(`Recordatorio programado en ${minutos} min`);
      hecho(); return;
    }
    case "recHecho": { const r = db.herr.recordatorios.find(x => x.id === d.id); if (r) r.hecho = true; hecho(); return; }
    case "delRec": db.herr.recordatorios = db.herr.recordatorios.filter(x => x.id !== d.id); hecho(); return;
    case "addAviso": {
      const t = $("hAvTexto").value.trim();
      if (!t) { aviso("Escriba el texto del aviso.", "error"); $("hAvTexto").focus(); return; }
      db.herr.avisos.push({ id: uid(), origen: $("hAvOrigen").value, texto: t, autor: db.config.usuario, ts: Date.now(), leido: false });
      log(`Aviso publicado (${$("hAvOrigen").value.toLowerCase()}): ${t}`);
      hecho(); return;
    }
    case "avisoLeido": { const v = db.herr.avisos.find(x => x.id === d.id); if (v) v.leido = true; hecho(); return; }
    case "addApoyo": {
      const mv = $("hApMesa").value, motivo = $("hApMotivo").value;
      const mesa = mv === "" ? null : +mv;
      if (db.herr.apoyo.some(s => !s.resuelto && s.motivo === motivo && s.mesa === mesa)) { aviso("Ya existe una solicitud abierta con ese motivo.", "error"); return; }
      db.herr.apoyo.push({ id: uid(), mesa, motivo, autor: db.config.usuario, ts: Date.now(), resuelto: false });
      log(`Solicitud de apoyo: ${motivo}${mesa != null ? ` · Mesa ${db.mesas[mesa].num}` : ""}`);
      aviso("Solicitud de apoyo registrada");
      hecho(); return;
    }
    case "apoyoOk": {
      const s = db.herr.apoyo.find(x => x.id === d.id);
      if (s && !s.resuelto) { s.resuelto = true; s.resueltoTs = Date.now(); s.resueltoPor = db.config.usuario; log(`Solicitud de apoyo atendida: ${s.motivo}`); }
      hecho(); return;
    }
    case "addInc": {
      const desc = $("hInDesc").value.trim();
      if (desc.length < 5) { aviso("Describa la incidencia (mínimo 5 caracteres).", "error"); $("hInDesc").focus(); return; }
      const mv = $("hInMesa").value, tipo = $("hInTipo").value;
      db.herr.incidencias.push({ id: uid(), tipo, mesa: mv === "" ? null : +mv, desc, autor: db.config.usuario, ts: Date.now() });
      log(`Incidencia registrada: ${tipo}`, "alerta");
      aviso("Incidencia registrada");
      hecho(); return;
    }

    // Usuario, turno y configuración
    case "ingresoTurno": ingresoTurno = d.v; pintarModal(); return;
    case "ingresar": {
      const nombre = ($("ingNombre")?.value || "").trim().replace(/\s+/g, " ");
      if (nombre.length < 2) { aviso("Escriba el nombre del mesero.", "error"); $("ingNombre")?.focus(); return; }
      const existente = db.config.meseros.find(x => normalizar(x) === normalizar(nombre));
      const final = existente || nombre;
      if (!existente) db.config.meseros.push(final);
      db.config.usuario = final;
      if (!db.config.turno) {
        db.config.turno = { nombre: ingresoTurno, inicio: Date.now() };
        log(`Turno ${ingresoTurno.toLowerCase()} iniciado por ${final}`);
      } else log(`Cambio de usuario: ${final}`);
      cerrarModal(true); hecho();
      aviso(`Sesión iniciada · ${final}`);
      return;
    }
    case "cambiarUsuario": cerrarModal(); abrirIngreso(); return;
    case "cerrarTurno": {
      const s = estadisticas();
      const ok = await confirmar({ titulo: "Cerrar turno",
        texto: `Ventas del turno: ${dinero(s.vendido)} en ${plural(s.cerradas, "cuenta cerrada", "cuentas cerradas")}. Las mesas y pedidos abiertos se conservarán para el siguiente turno.`,
        ok: "Cerrar turno", cancelar: "Volver" });
      if (!ok) return;
      log(`Turno ${db.config.turno?.nombre.toLowerCase() || ""} cerrado · ventas ${dinero(s.vendido)}`);
      db.config.turno = null; db.config.usuario = null;
      cerrarModal(true); hecho(); abrirIngreso();
      return;
    }
    case "addMesero": {
      const n = ($("cfgMesero")?.value || "").trim().replace(/\s+/g, " ");
      if (n.length < 2) { aviso("Escriba el nombre del mesero.", "error"); return; }
      if (db.config.meseros.some(x => normalizar(x) === normalizar(n))) { aviso("Ese mesero ya está registrado.", "error"); return; }
      db.config.meseros.push(n); log(`Mesero registrado: ${n}`);
      hecho(); setTimeout(() => $("cfgMesero")?.focus(), 0); return;
    }
    case "delMesero": {
      const asignadas = db.mesas.filter(m => m.mesero === d.v && m.sesion).length;
      if (asignadas) { aviso(`${d.v} tiene ${plural(asignadas, "mesa abierta", "mesas abiertas")}. Transfiéralas antes de quitarlo.`, "error"); return; }
      db.config.meseros = db.config.meseros.filter(x => x !== d.v);
      hecho(); return;
    }
    case "addMesa":
      if (db.mesas.length >= 40) { aviso("Se alcanzó el máximo de 40 mesas.", "error"); return; }
      db.mesas.push(mesaVacia(db.mesas.length + 1, 4)); log(`Mesa ${db.mesas.length} agregada al salón`);
      hecho(); return;
    case "quitarMesa": {
      const m = db.mesas[db.mesas.length - 1];
      if (m.estado !== "libre") { aviso(`La mesa ${m.num} debe estar libre para quitarla.`, "error"); return; }
      const ok = await confirmar({ titulo: `Quitar mesa ${m.num}`, texto: "La mesa dejará de mostrarse en el salón. El historial se conserva.", ok: "Quitar mesa", cancelar: "Volver" });
      if (!ok) return;
      db.mesas.pop(); log(`Mesa ${m.num} retirada del salón`);
      if (ui.menuMesa >= db.mesas.length) ui.menuMesa = null;
      hecho(); return;
    }
    case "exportar": exportar(); guardar(); return;
  }
}

document.addEventListener("click", e => {
  if (ui.notif && !e.target.closest("#notif") && !e.target.closest("[data-a='notif']")) { ui.notif = false; pintarNotif(); }
  if (e.target.id === "modal") { cerrarModal(); return; }
  const el = e.target.closest("[data-a]");
  if (!el || el.disabled) return;
  vibrar();
  ejecutar(el.dataset.a, el.dataset).catch(err => {
    console.error(err);
    aviso("Ocurrió un error inesperado. La información guardada no se modificó.", "error");
    cargar(); render();
  });
});

let temporizadorGuardado;
const guardarDiferido = () => { clearTimeout(temporizadorGuardado); temporizadorGuardado = setTimeout(guardar, 400); };
document.addEventListener("input", e => {
  const el = e.target, k = el.dataset.in;
  if (el.dataset.mod && prod) {
    return;
  }
  switch (k) {
    case "buscar":
      ui.busqueda = el.value;
      $("gridPlatillos").innerHTML = htmlPlatillos();
      return;
    case "obsPedido": { const p = db.pedidos.find(x => x.id === el.dataset.id); if (p) { p.obs = el.value; guardarDiferido(); } return; }
    case "notasMesa": { const m = db.mesas[+el.dataset.i]; if (m) { m.notas = el.value; guardarDiferido(); } return; }
    case "notas": db.herr.notas = el.value; guardarDiferido(); return;
    case "pagoMonto":
    case "pagoRecibido":
    case "pagoRef":
      if (!ui.pago) return;
      ui.pago[{ pagoMonto: "monto", pagoRecibido: "recibido", pagoRef: "ref" }[k]] = el.value;
      if ($("cambio")) $("cambio").innerHTML = htmlCambio(ui.pago);
      return;
  }
  if (el.id === "prodObs" && prod) prod.obs = el.value;
});

document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.mod && prod) {
    const set = prod[el.dataset.mod];
    el.checked ? set.add(el.value) : set.delete(el.value);
    if ($("prodBtn")) $("prodBtn").textContent = textoBotonProd();
    return;
  }
  const k = el.dataset.ch;
  if (!k) return;
  switch (k) {
    case "menuMesa": ui.menuMesa = el.value === "" ? null : +el.value; guardarUi(); render(); return;
    case "propinaOtra": {
      const m = db.mesas[+el.dataset.i], v = Math.round(num(el.value));
      if (el.value === "") return;
      if (v < 0 || v > 100) { aviso("La propina debe estar entre 0 y 100 %.", "error"); render(); return; }
      m.propina = v; ui.pago = null; hecho(); return;
    }
    case "capMesa": {
      const m = db.mesas[+el.dataset.i], cap = +el.value;
      if (m.estado !== "libre") { aviso("Solo se puede modificar la capacidad con la mesa libre.", "error"); pintarModal(); return; }
      m.cap = cap; m.sillas = Array(cap).fill(false);
      log(`Mesa ${m.num}: capacidad ${cap} lugares`);
      hecho(); return;
    }
    case "limite": {
      const v = Math.round(num(el.value));
      if (v < 1 || v > 240) { aviso("Indique un tiempo entre 1 y 240 minutos.", "error"); pintarModal(); return; }
      db.config.limites[el.dataset.k] = v; hecho(); aviso("Tiempo de alerta actualizado"); return;
    }
    case "propinaDef": db.config.propina = +el.value; hecho(); aviso("Propina sugerida actualizada"); return;
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.dataset?.enter) { e.preventDefault(); ejecutar(e.target.dataset.enter, e.target.dataset); return; }
  if (e.key !== "Escape") return;
  if (resolverConfirm) cerrarConfirm(false);
  else if (modalActual) cerrarModal();
  else if (ui.notif) { ui.notif = false; pintarNotif(); }
  else if (ui.mesaPanel !== null) cerrarPanel();
});

// Sincroniza si los datos cambian en otra pestaña del mismo dispositivo
window.addEventListener("storage", e => {
  if (!Object.values(K).includes(e.key)) return;
  cargar();
  if (ui.mesaPanel !== null && !db.mesas[ui.mesaPanel]) cerrarPanel();
  render();
});

// ---------- Inicio ----------
function tic() {
  alertasCache = calcularAlertas();
  renderTop();
  const foco = document.activeElement;
  const escribiendo = foco && /^(INPUT|TEXTAREA|SELECT)$/.test(foco.tagName);
  if (!escribiendo && !resolverConfirm) {
    render();
  } else {
    renderNav();
    pintarNotif();
  }
}

cargar();
if (ui.menuMesa !== null && !db.mesas[ui.menuMesa]) ui.menuMesa = null;
guardar();
render();
if (!db.config.usuario || !db.config.turno) abrirIngreso();
setInterval(tic, 15000);
