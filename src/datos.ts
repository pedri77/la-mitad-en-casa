/**
 * Único punto de entrada a los datos. Los JSON los genera `npm run datos` (scripts/datos.py)
 * y se importan en el build: tipados, sin fetch, sin estados de carga.
 *
 * Regla: ninguna cifra de la página se escribe a mano. Sale de aquí, o se calcula a partir de aquí.
 */
import conPadresJson from './datos/con_padres.json';
import edadJson from './datos/edad.json';
import procedenciaJson from './datos/procedencia.json';

export type Fuente = {fuente: string; url: string; datos?: string; licencia: string; descargado: string; nota?: string};
export const procedencia = procedenciaJson as Record<keyof typeof procedenciaJson, Fuente>;
export type ClaveFuente = keyof typeof procedenciaJson;

/** Una observación de Eurostat. `f`: bandera (b = corte de serie, e = estimado, p = provisional). */
export type Punto = {anio: number; v: number; f?: string};
export type Pais = {geo: string; nombre: string; v2010: number; v2025: number; f2010?: string; f2025?: string};

export const datos = {
  conPadres: conPadresJson as {espana: Punto[]; ue: Punto[]; paises: Pais[]},
  edad: edadJson as {espana: Punto[]; ue: Punto[]},
};

export const en = (serie: Punto[], anio: number) => {
  const p = serie.find((d) => d.anio === anio);
  if (!p) throw new Error(`Sin dato para ${anio}`);
  return p.v;
};
const r1 = (v: number) => Math.round(v * 10) / 10;

/** Puesto (1 = más alto) de cada país en un año. */
export const puestos = (anio: 2010 | 2025) =>
  Object.fromEntries(
    [...datos.conPadres.paises].sort((a, b) => b[`v${anio}`] - a[`v${anio}`]).map((p, i) => [p.geo, i + 1]),
  ) as Record<string, number>;

const cp = datos.conPadres;
const ed = datos.edad;
const p2010 = puestos(2010);
const p2025 = puestos(2025);
const ultimoEs = cp.espana.at(-1)!;
const primeroEs = cp.espana[0];
const bajos = cp.paises.filter((p) => p.v2025 < 10).sort((a, b) => a.v2025 - b.v2025);

/** Cifras de la página (ver docs/GUION.md §3). */
export const cifras = {
  anioIni: primeroEs.anio,
  anioFin: ultimoEs.anio,
  es2004: primeroEs.v,
  es2025: ultimoEs.v,
  es2010: en(cp.espana, 2010),
  ue2010: en(cp.ue, 2010),
  ue2025: en(cp.ue, 2025),
  subida: r1(ultimoEs.v - primeroEs.v),
  h2010: r1(en(cp.espana, 2010) - en(cp.ue, 2010)),
  h2025: r1(ultimoEs.v - en(cp.ue, 2025)),
  puesto2010: p2010.ES,
  puesto2025: p2025.ES,
  nPaises: cp.paises.length,
  delante2025: cp.paises.filter((p) => p2025[p.geo] < p2025.ES).sort((a, b) => p2025[a.geo] - p2025[b.geo]),
  bajos,
  techoBajos: Math.ceil(Math.max(...bajos.map((p) => p.v2025))),
  e2005: en(ed.espana, 2005),
  e2025: en(ed.espana, 2025),
  eUe2025: en(ed.ue, 2025),
  dif2005: r1(en(ed.espana, 2005) - en(ed.ue, 2005)),
  dif2020: r1(en(ed.espana, 2020) - en(ed.ue, 2020)),
  dif2025: r1(en(ed.espana, 2025) - en(ed.ue, 2025)),
  subidaEdad: r1(en(ed.espana, 2025) - en(ed.espana, 2005)),
  corteEdad: ed.espana.find((p) => p.f === "b" && p.anio > 2005)!.anio,
};
