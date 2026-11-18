import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';

const dir = new URL('../src/datos/', import.meta.url);
const ficheros = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'procedencia.json');
const procedencia = JSON.parse(readFileSync(new URL('procedencia.json', dir), 'utf8'));

test('cada JSON de datos tiene procedencia completa', () => {
  for (const f of ficheros) {
    const p = procedencia[f.replace('.json', '')];
    assert.ok(p, `${f} sin procedencia`);
    for (const k of ['fuente', 'url', 'licencia', 'descargado']) assert.ok(p[k], `${f}: falta ${k}`);
  }
});

test('ningún dato es NaN ni infinito', () => {
  for (const f of ficheros) {
    JSON.parse(readFileSync(new URL(f, dir), 'utf8'), (k, v) => {
      if (typeof v === 'number') assert.ok(Number.isFinite(v), `${f}: ${k} no es finito`);
      return v;
    });
  }
});

// En el despliegue (GitHub Actions pone CI=true) no pasan datos de plantilla: hay que sustituir
// src/datos/ejemplo.json y su import en src/datos.ts por los datos reales de scripts/datos.py.
test('sin datos de plantilla al publicar', {skip: !process.env.CI && 'solo en CI'}, () => {
  const texto = JSON.stringify(procedencia);
  assert.ok(!/example\.(com|org)|no publicar/i.test(texto), 'procedencia.json todavía tiene la plantilla');
  assert.ok(!ficheros.includes('ejemplo.json'), 'src/datos/ejemplo.json sigue ahí');
});

// Cifra clave contrastada con otra publicación (descomenta y adapta):
// test('2024 coincide con el informe anual (464.801)', () => {
//   const serie = JSON.parse(readFileSync(new URL('serie.json', dir), 'utf8'));
//   assert.equal(serie.find((d) => d.anio === 2024).valor, 464801);
// });
