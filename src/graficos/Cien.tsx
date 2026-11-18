/**
 * Unidad humana: 100 círculos = 100 jóvenes de 25 a 34 años. Llenos: viven con sus padres.
 * Estado objetivo: cuántos llenos (redondeado). Forma y color distintos (lleno/hueco), no solo color.
 */
import {useTamano} from '../hooks/useTamano';
import {useTransicion} from '../hooks/useTransicion';

export type EstadoCien = {n: number; quien: string};

export function Cien({n, quien}: EstadoCien) {
  const [ref, W] = useTamano();
  const estrecho = W < 480;
  const cabecera = 40;
  const lado = Math.min(W, estrecho ? 300 : 380);
  const celda = lado / 10;
  const H = cabecera + lado + 8;
  const v = useTransicion({n: Math.round(n)});
  const llenos = Math.round(v.n);
  const x0 = (W - lado) / 2;

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full">
        <text x={x0} y={16} className="cien-cifra">
          {llenos}
          <tspan className="cien-de"> de cada 100 · {quien}</tspan>
        </text>
        <g transform={`translate(${x0},${cabecera - 6})`} className="eje-texto">
          <circle cx={celda * 0.3} cy={0} r={5} className="punto-lleno" />
          <text x={celda * 0.3 + 10} dy="0.35em">en casa de sus padres</text>
          <circle cx={celda * 0.3 + (estrecho ? 150 : 170)} cy={0} r={5} className="punto-vacio" />
          <text x={celda * 0.3 + (estrecho ? 160 : 180)} dy="0.35em">fuera</text>
        </g>
        <g transform={`translate(${x0},${cabecera + 8})`}>
          {Array.from({length: 100}, (_, i) => (
            <circle
              key={i}
              cx={(i % 10) * celda + celda / 2}
              cy={Math.floor(i / 10) * celda + celda / 2}
              r={celda * 0.36}
              className={i < llenos ? 'punto-lleno' : 'punto-vacio'}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
