# Guion: «Uno de cada dos sigue en casa»

## 1. El hallazgo
- **Qué sabrá el lector**: en 2025 la mitad de los españoles de 25 a 34 años vive con sus padres (50,2 %), frente a un tercio en 2004 (33,2 %), mientras la media de la UE sigue en tres de cada diez (30,1 %).
- **Intuición que corrige**: «nos vamos de casa un poco más tarde que antes, como en todas partes». La edad media solo ha subido año y medio, pero el grupo que sigue en casa ha crecido 17 puntos y Europa no se ha movido.
- **Datos**:
  - Eurostat `ilc_lvps08` (EU-SILC): % de 25 a 34 años que vive con sus padres. España 2004–2025, UE-27 2010–2025 (2010–2018 estimada, bandera `e`). 27 países en 2010 y 2025 (Lituania 2025 provisional, Luxemburgo 2025 corte).
  - Eurostat `yth_demo_030` (EU-LFS): edad media estimada de salida del hogar. Cortes en España 2005 y 2021 y en la UE 2021: la serie empieza en 2005 y 2021 se marca con una línea vertical.
  - Licencia CC BY 4.0. Dos encuestas distintas: no se combinan en ninguna cuenta.

## 2. Escenas y pasos

| Escena | Gráfico | Paso | Estado (lo único que cambia) | Frase |
|---|---|---|---|---|
| cien | 100 círculos | 0 | {es2004} llenos | «En 2004, {es2004} de cada 100… uno de cada tres» |
| | | 1 | {es2025} llenos | «En 2025, {es2025}: uno de cada dos» |
| | | 2 | {ue2025} llenos (UE) | «En la UE, {ue2025}» |
| hueco | líneas % 2004–2025 | 0 | solo España | «de {es2004} a {es2025}: +{subida} puntos» |
| | | 1 | aparece UE (discontinua 2010–2018) | «UE: {ue2010} → {ue2025}» |
| | | 2 | se rellena el hueco y se etiqueta en 2010 y 2025 | «hueco de {h2010} a {h2025} puntos» |
| ranking | 27 barras | 0 | valores y orden de 2010, España resaltada | «puesto {p2010} de 27» |
| | | 1 | valores y orden de 2025 | «puesto {p2025}; por delante {lista}» |
| | | 2 | se resaltan los países por debajo del 10 % | «{nórdicos}: menos de {n} de cada 100» |
| edad | líneas edad 2005–2025, eje desde 0 | 0 | solo España | «{e2005} → {e2025} años» |
| | | 1 | aparece UE | «UE {ue2025}: {dif2025} años de diferencia» |
| | | 2 | eje Y ampliado (24–32), aviso «no empieza en cero» | «antes del corte de 2021: {dif2005} → {dif2020}; hoy {dif2025}» |

## 3. Cifras
Todas en `src/datos.ts` (bloque `cifras`) a partir de `con_padres.json` y `edad.json`.
- `es2004 = espana[anio=2004].v` (33,2), `es2025` (50,2), `ue2010` (29,0), `ue2025` (30,1)
- `subida = es2025 − es2004` (17,0); `h2010 = es[2010] − ue[2010]` (6,1); `h2025` (20,1)
- `p2010`, `p2025`: posición de ES ordenando los 27 por valor descendente (13, 6)
- edad: `e2005` 28,6, `e2025` 30,2, `ue2025` 26,3; `dif2005` 1,9, `dif2020` 3,4, `dif2025` 3,9

## 4. Estados del QA
`escena=cien&paso=0..2`, `escena=hueco&paso=0..2`, `escena=ranking&paso=0..2`, `escena=edad&paso=0..2` a 1440×900 y 390×844, y con REDUCIDO=1.

## 5. Cierre
Lo que no dicen: dos encuestas distintas; no explican por qué (no separan a quien no puede irse de quien no quiere ni a quien volvió); estimados y provisionales. Sin CTA.
