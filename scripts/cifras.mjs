#!/usr/bin/env node
// Lista las cifras que aparecen en la página y no salen de los datos.
//
// Uso: node scripts/cifras.mjs http://localhost:3029/
//
// Abre la página, recorre todo el scroll (para que se pinten todos los pasos), extrae el texto visible
// (y el de las tablas) y busca números. Cada número se compara con los valores de src/datos/*.json,
// también redondeados (a miles, a una cifra decimal de millones) y como cociente o porcentaje entre
// dos valores del mismo fichero. Lo que no cuadra sale como «revisar»: puede ser un año, una cifra
// de contexto con fuente propia o un número tecleado que se ha quedado viejo.
import {createRequire} from 'node:module';
import {readdirSync, readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const url = process.argv[2];
if (!url) throw new Error('Uso: node scripts/cifras.mjs <url>   (ESTRICTO=1: sin cocientes ni porcentajes derivados)');
// Con cocientes, en datos densos (porcentajes con un decimal) casi cualquier número «cuadra» por azar.
// ESTRICTO=1 solo admite valores de los datos y sus redondeos: lo derivado sale como «revisar» y se
// justifica a mano (o se calcula en el código y se comprueba en tests/).
const ESTRICTO = process.env.ESTRICTO === '1';
// Claves que son etiquetas, no medidas: no entran en los cocientes.
const NO_MEDIDA = /^(anio|año|ano|year|periodo|mes|id|codigo|cod)$/i;

let chromium;
try {
  ({chromium} = await import('playwright-core'));
} catch {
  const raices = [join(dirname(process.execPath), '..', 'lib', 'node_modules'), '/opt/homebrew/lib/node_modules', '/usr/local/lib/node_modules'];
  const require = createRequire(import.meta.url);
  for (const c of [process.env.PLAYWRIGHT_CORE, ...raices.flatMap((r) => [`${r}/playwright-core`, `${r}/@playwright/cli/node_modules/playwright-core`])].filter(Boolean)) {
    try {
      ({chromium} = require(c));
      break;
    } catch {}
  }
}
if (!chromium) throw new Error('No encuentro playwright-core');

// 1. Valores de los datos.
const valores = new Set();
const anadir = (v) => {
  if (!Number.isFinite(v)) return;
  for (const x of [v, Math.round(v), Math.round(v / 1000) * 1000, Math.round(v / 1e5) / 10, Math.round(v * 10) / 10, Math.round(v * 100) / 100]) valores.add(x);
};
// src/datos respecto al script (scripts/ en la raíz del proyecto), no al directorio actual.
const DATOS = fileURLToPath(new URL('../src/datos/', import.meta.url));
for (const f of readdirSync(DATOS).filter((n) => n.endsWith('.json') && n !== 'procedencia.json')) {
  const nums = [];
  const medidas = [];
  JSON.stringify(JSON.parse(readFileSync(join(DATOS, f), 'utf8')), (k, v) => {
    if (typeof v === 'number') {
      nums.push(v);
      if (!NO_MEDIDA.test(k)) medidas.push(v);
    }
    return v;
  });
  nums.forEach(anadir);
  if (ESTRICTO) continue;
  // Cocientes y porcentajes entre valores del mismo fichero (acotado para no explotar).
  const muestra = [...new Set(medidas)].filter((n) => n > 0).slice(0, 400);
  for (const a of muestra) for (const b of muestra) if (a !== b) {
    anadir(a / b);
    anadir((a / b) * 100);
    anadir(((a - b) / b) * 100);
  }
}
const respaldado = (n) => [...valores].some((v) => Math.abs(v - n) <= Math.max(0.051, Math.abs(n) * 0.0005));
// Cuántos números inventados (10,0–99,9) pasarían por azar: si son muchos, el informe no sirve.
let azar = 0;
for (let i = 100; i < 1000; i += 7) if (respaldado(i / 10 + 0.03)) azar++;
const pctAzar = Math.round((azar / Math.ceil(900 / 7)) * 100);

// 2. Texto de la página.
const nav = await chromium.launch({channel: 'chrome'});
// Movimiento reducido: los gráficos saltan al estado final y no se leen cifras a mitad de transición.
const p = await nav.newPage({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
await p.goto(url, {waitUntil: 'networkidle'});
const alto = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < alto; y += 450) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(120);
}
await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
// Las marcas de los ejes (.eje) son valores redondos de la escala, no cifras del texto.
await p.evaluate(() => document.querySelectorAll('.eje').forEach((e) => e.remove()));
const texto = await p.evaluate(() => document.body.innerText);
await nav.close();

// 3. Números del texto (formato es-ES: 1.234.567,8).
const encontrados = new Map();
for (const m of texto.matchAll(/(?<![\w,.])(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(?![\w])/g)) {
  const n = Number(m[1].replace(/\./g, '') + (m[2] ? `.${m[2]}` : ''));
  const ctx = texto.slice(Math.max(0, m.index - 40), m.index + m[0].length + 20).replace(/\s+/g, ' ');
  if (!encontrados.has(m[0])) encontrados.set(m[0], {n, ctx});
}
const esAnio = (n) => Number.isInteger(n) && n >= 1900 && n <= 2100;
const pequeno = (n) => Number.isInteger(n) && n <= 12; // «3 pasos», «2 de cada…»
const revisar = [...encontrados].filter(([, {n}]) => !esAnio(n) && !pequeno(n) && !respaldado(n));
if (pctAzar > 20)
  console.log(`AVISO: el ${pctAzar} % de cifras inventadas entre 10 y 100 pasaría como respaldada (datos densos). Repite con ESTRICTO=1.`);

console.log(`${encontrados.size} cifras distintas en la página; ${revisar.length} sin respaldo directo en src/datos:`);
for (const [s, {ctx}] of revisar) console.log(`  revisar  ${s.padEnd(12)} …${ctx}…`);
