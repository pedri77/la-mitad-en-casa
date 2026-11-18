# Uno de cada dos sigue en casa

Historia con datos (skill web-datos): jóvenes de 25 a 34 años que viven con sus padres, España frente a la UE, y edad media de emancipación. Datos de Eurostat (CC BY 4.0).

```bash
npm install
npm run datos     # descarga a datos-crudos/ (ignorado) y escribe src/datos/*.json + procedencia.json
npm run dev       # http://127.0.0.1:3029/
npm run lint && npm test && npm run build
```

## Fuentes
- `ilc_lvps08` (EU-SILC): % de 25 a 34 años que vive con sus padres. Definición de Eurostat: incluye a quien aporta ingresos al hogar de sus padres o se beneficia de ellos. UE-27 2010–2018 estimada (`e`); Lituania 2025 provisional (`p`); Luxemburgo 2025 corte (`b`).
- `yth_demo_030` (EU-LFS): edad media estimada de salida del hogar. Cortes en España 2005 y 2021 y en la UE 2021: la serie empieza en 2005 y 2021 se marca.
- Descarga: API SDMX 2.1 en SDMX-CSV. Las banderas se guardan en el JSON (`f`).

## Comprobación de cifras
Contra la fuente por otra vía (API JSON de Eurostat, `statistics/1.0/data`, 18-11-2026):
1. UE-27, 25–34 con sus padres, 2010: 29,0 con bandera `e` ✔
2. Croacia, 25–34 con sus padres, 2025: 62,3 ✔
3. España, edad media 2005: 28,6 con bandera `b` ✔ (y España 2025 en las dos tablas: 50,2 y 30,2 ✔)

Contra otra publicación (prensa sobre las notas de Eurostat de 2026):
- Edad media 2025: España 30,2, Italia 30,2, UE 26,3, Croacia 31,5 (Eunews, 15-09-2026) ✔. Eunews da Finlandia 21,4; la tabla descargada dice 21,3 (revisión posterior de Eurostat; no aparece en la página).
- 25–34 con sus padres 2025: UE 30,1 % y Grecia 56,3 % (Greek City Times, 04-08-2026) ✔.

`ESTRICTO=1 node scripts/cifras.mjs http://127.0.0.1:3029/`: 13 cifras sin respaldo directo, todas justificadas: derivadas calculadas en `src/datos.ts` y fijadas en `tests/cifras.test.ts` (6,1; 20,1; 3,3; 1,6; 1,9; 3,4), puestos de la tabla (13, 19, 20, 24), la unidad «de cada 100», el número de la Decisión 2011/833/UE y la fecha de descarga.
