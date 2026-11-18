/**
 * Barras que se reordenan: los 27 países, % de 25 a 34 años que vive con sus padres.
 * Paso 0: valores y orden de 2010. Paso 1: de 2025. Paso 2: resalta los que están por debajo del 10 %.
 * La posición de cada barra se interpola por país: se ve quién adelanta a quién.
 */
import {scaleLinear} from 'd3-scale';
import {datos, en, puestos} from '../datos';
import {useTamano} from '../hooks/useTamano';
import {useTransicion} from '../hooks/useTransicion';
import {dec1, pc} from '../lib/formato';

const paises = datos.conPadres.paises;
const ue = datos.conPadres.ue;
const banderas: Record<string, string> = {p: 'provisional', b: 'corte de serie'};

export function Ranking({paso}: {paso: number}) {
  const [ref, W] = useTamano();
  const estrecho = W < 480;
  const banda = estrecho ? 14 : 16;
  const anio = paso === 0 ? 2010 : 2025;
  const pos = puestos(anio);
  const arriba = 22;
  const marcados = paises.filter((p) => (anio === 2025 ? p.f2025 : p.f2010));
  const H = arriba + paises.length * banda + (marcados.length ? 22 : 4);
  const izq = estrecho ? 92 : 112;
  const v = useTransicion({
    pos: Object.fromEntries(paises.map((p) => [p.geo, pos[p.geo]])),
    val: Object.fromEntries(paises.map((p) => [p.geo, anio === 2010 ? p.v2010 : p.v2025])),
    media: en(ue, anio),
    bajos: paso === 2 ? 1 : 0,
  });
  const x = scaleLinear([0, 70], [izq, W - 44]);

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full">
        <text x={izq} y={12} className="eje-texto ranking-anio">
          {anio}
        </text>
        {[0, 25, 50].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={arriba - 4} y2={arriba + paises.length * banda} className="rejilla" />
            <text x={x(t)} y={12} textAnchor="middle" className="eje-texto">
              {t === 0 ? '' : `${t} %`}
            </text>
          </g>
        ))}
        <g transform={`translate(${x(v.media)},0)`}>
          <line y1={arriba - 4} y2={arriba + paises.length * banda} className="media-ue" />
          <text y={arriba + paises.length * banda * 0.92} dx={4} className="anotacion">
            UE {pc(v.media)}
          </text>
        </g>
        {paises.map((p) => {
          const yy = arriba + (v.pos[p.geo] - 1) * banda;
          const valor = v.val[p.geo];
          const bandera = anio === 2025 ? p.f2025 : p.f2010;
          const esEs = p.geo === 'ES';
          const bajo = (anio === 2010 ? p.v2010 : p.v2025) < 10;
          const clase = esEs ? 'barra-es' : bajo && v.bajos > 0.5 ? 'barra-bajo' : 'barra-gris';
          return (
            <g key={p.geo} transform={`translate(0,${yy})`}>
              <text x={izq - 6} y={banda / 2} dy="0.35em" textAnchor="end" className={`eje-texto ${esEs ? 'texto-es' : ''}`}>
                {p.nombre}
                {bandera ? '*' : ''}
              </text>
              <rect x={x(0)} y={1.5} width={Math.max(0, x(valor) - x(0))} height={banda - 3} rx={2} className={clase} />
              <text x={x(valor) + 4} y={banda / 2} dy="0.35em" className={`eje-texto halo ${esEs ? 'texto-es' : ''}`}>
                {dec1(valor)}
              </text>
            </g>
          );
        })}
        {marcados.length > 0 && (
          <text x={0} y={H - 4} className="eje-texto">
            * {marcados.map((p) => `${p.nombre}: ${banderas[(anio === 2025 ? p.f2025 : p.f2010)!] ?? 'nota de Eurostat'}`).join('. ')}.
          </text>
        )}
      </svg>
    </div>
  );
}
