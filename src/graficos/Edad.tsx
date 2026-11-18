/**
 * Edad media estimada de salida del hogar (EU-LFS), España frente a UE-27, 2005–2025.
 * Paso 0: España con el eje en cero. Paso 1: aparece la UE. Paso 2: el eje se amplía (ya no empieza en cero, y se dice).
 * El corte de serie de 2021 se marca siempre.
 */
import {line} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {EjeX, EjeY} from '../components/Ejes';
import {cifras, datos, type Punto} from '../datos';
import {useTamano} from '../hooks/useTamano';
import {useTransicion} from '../hooks/useTransicion';
import {dec1} from '../lib/formato';

const es = datos.edad.espana;
const ue = datos.edad.ue;
const M = {arriba: 20, derecha: 64, abajo: 30, izquierda: 30};

export function Edad({paso}: {paso: number}) {
  const [ref, W] = useTamano();
  const estrecho = W < 480;
  const H = Math.round(Math.min(420, Math.max(280, W * 0.62)));
  const v = useTransicion({y0: paso >= 2 ? 24 : 0, ue: paso >= 1 ? 1 : 0});
  const x = scaleLinear([es[0].anio, es.at(-1)!.anio], [M.izquierda, W - M.derecha]);
  const y = scaleLinear([v.y0, 32], [H - M.abajo, M.arriba]);
  const trazo = line<Punto>()
    .x((p) => x(p.anio))
    .y((p) => y(p.v));
  const finEs = es.at(-1)!;
  const finUe = ue.at(-1)!;
  const corte = cifras.corteEdad;

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full">
        <EjeY y={y} ancho={W - M.derecha + 8} ticks={paso >= 2 ? 4 : 3} formato={(t) => String(t)} />
        <EjeX x={x} valores={es.map((p) => p.anio)} alto={H - M.abajo} cada={estrecho ? 5 : 2} />
        <g style={{opacity: v.y0 / 24}}>
          <text x={M.izquierda} y={H - M.abajo - 8} className="anotacion">
            El eje empieza en 24 años, no en cero
          </text>
        </g>

        <line x1={x(corte)} x2={x(corte)} y1={M.arriba} y2={H - M.abajo} className="corte" />
        <text x={x(corte) - 4} y={M.arriba + 4} textAnchor="end" className="eje-texto">
          {estrecho ? 'cambio de método' : `${corte}: cambio de método`}
        </text>

        <g style={{opacity: v.ue}}>
          <path d={trazo(ue) ?? ''} className="serie serie-ue" />
          <text x={x(finUe.anio) + 8} y={y(finUe.v)} dy="0.35em" className="serie-etiqueta etiqueta-ue">
            <tspan x={x(finUe.anio) + 8}>UE</tspan>
            <tspan x={x(finUe.anio) + 8} dy="1.15em" className="etiqueta-cifra">
              {dec1(finUe.v)}
            </tspan>
          </text>
        </g>
        <path d={trazo(es) ?? ''} className="serie serie-es" />
        <circle cx={x(finEs.anio)} cy={y(finEs.v)} r={4.5} className="punto-es" />
        <text x={x(finEs.anio) + 8} y={y(finEs.v)} dy="-0.2em" className="serie-etiqueta etiqueta-es">
          <tspan x={x(finEs.anio) + 8}>España</tspan>
          <tspan x={x(finEs.anio) + 8} dy="1.15em" className="etiqueta-cifra">
            {dec1(finEs.v)}
          </tspan>
        </text>
      </svg>
    </div>
  );
}
