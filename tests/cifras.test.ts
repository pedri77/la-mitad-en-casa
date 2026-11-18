import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const leer = (f: string) => JSON.parse(readFileSync(new URL(`../src/datos/${f}`, import.meta.url), 'utf8'));
const cp = leer('con_padres.json');
const ed = leer('edad.json');
const en = (serie: {anio: number; v: number}[], anio: number) => serie.find((d) => d.anio === anio)?.v;

// Contrastadas con la prensa que cubrió la publicación de Eurostat de 2026 (ver README).
test('edad media 2025: España 30,2 y UE 26,3 (Eunews, 15-09-2026)', () => {
  assert.equal(en(ed.espana, 2025), 30.2);
  assert.equal(en(ed.ue, 2025), 26.3);
});
test('25-34 con sus padres 2025: UE 30,1 % y Grecia 56,3 % (Greek City Times, 04-08-2026)', () => {
  assert.equal(en(cp.ue, 2025), 30.1);
  assert.equal(cp.paises.find((p: {geo: string}) => p.geo === 'EL').v2025, 56.3);
});
test('España 25-34 con sus padres: 2004 = 33,2 % y 2025 = 50,2 % (API JSON de Eurostat, consulta aparte)', () => {
  assert.equal(cp.espana[0].anio, 2004);
  assert.equal(en(cp.espana, 2004), 33.2);
  assert.equal(en(cp.espana, 2025), 50.2);
});
test('banderas conservadas: UE 2010-2018 estimada, corte de la edad en 2021', () => {
  assert.equal(cp.ue.filter((p: {f?: string}) => p.f === 'e').length, 9);
  assert.equal(ed.espana.find((p: {anio: number}) => p.anio === 2021).f, 'b');
});
test('27 países, ningún valor nulo en lo que se dibuja', () => {
  assert.equal(cp.paises.length, 27);
  for (const p of cp.paises) assert.ok(p.v2010 != null && p.v2025 != null, p.geo);
});

// Cifras derivadas que cifras.mjs (ESTRICTO=1) marca como «revisar»: se calculan en src/datos.ts y se fijan aquí.
const r1 = (v: number) => Math.round(v * 10) / 10;
test('derivadas: hueco 6,1 → 20,1 puntos (3,3 veces); edad +1,6 años; distancia 1,9 → 3,4 → 3,9', () => {
  const h2010 = r1(en(cp.espana, 2010)! - en(cp.ue, 2010)!);
  const h2025 = r1(en(cp.espana, 2025)! - en(cp.ue, 2025)!);
  assert.deepEqual([h2010, h2025, r1(h2025 / h2010)], [6.1, 20.1, 3.3]);
  assert.equal(r1(en(ed.espana, 2025)! - en(ed.espana, 2005)!), 1.6);
  assert.deepEqual([2005, 2020, 2025].map((a) => r1(en(ed.espana, a)! - en(ed.ue, a)!)), [1.9, 3.4, 3.9]);
});
test('puestos de España: 13 de 27 en 2010, 6 en 2025', () => {
  const puesto = (k: 'v2010' | 'v2025') => [...cp.paises].sort((a, b) => b[k] - a[k]).findIndex((p) => p.geo === 'ES') + 1;
  assert.deepEqual([puesto('v2010'), puesto('v2025')], [13, 6]);
});
