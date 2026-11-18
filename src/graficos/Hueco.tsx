/**
 * Dos series y su hueco: % de 25 a 34 años que vive con sus padres, España frente a UE-27.
 * Paso 0: España. Paso 1: aparece la UE (discontinua donde Eurostat la estima). Paso 2: hueco relleno y medido.
 */
import {area, line} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import {EjeX, EjeY} from '../components/Ejes';
import {datos, en, type Punto} from '../datos';
import {useTamano} from '../hooks/useTamano';
import {useTransicion} from '../hooks/useTransicion';
import {dec1, pc, puntos} from '../lib/formato';

const es = datos.conPadres.espana;
const ue = datos.conPadres.ue;
const M = {arriba: 20, derecha: 64, abajo: 30, izquierda: 30};

export function Hueco({paso}: {paso: number}) {
  const [ref, W] = useTamano();
  const estrecho = W < 480;
  const H = Math.round(Math.min(420, Math.max(280, W * 0.62)));
  const x = scaleLinear([es[0].anio, es.at(-1)!.anio], [M.izquierda, W - M.derecha]);
  const y = scaleLinear([0, 60], [H - M.abajo, M.arriba]);
  const v = useTransicion({ue: paso >= 1 ? 1 : 0, hueco: paso >= 2 ? 1 : 0});

  const trazo = line<Punto>()
    .x((p) => x(p.anio))
    .y((p) => y(p.v));
  // Tramo estimado (bandera e) y su enlace con el primer dato no estimado: discontinuo.
  const ultimoEstimado = ue.findLastIndex((p) => p.f === 'e');
  const ueEst = ue.slice(0, ultimoEstimado + 2);
  const ueReal = ue.slice(ultimoEstimado + 1);
  const comunes = es.filter((p) => p.anio >= ue[0].anio).map((p) => ({anio: p.anio, a: p.v, b: en(ue, p.anio)}));
  const relleno = area<{anio: number; a: number; b: number}>()
    .x((p) => x(p.anio))
    .y0((p) => y(p.b))
    .y1((p) => y(p.a))(comunes);
  const finEs = es.at(-1)!;
  const finUe = ue.at(-1)!;
  const medidas = [comunes[0], comunes.at(-1)!];

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full">
        <EjeY y={y} ancho={W - M.derecha + 8} ticks={3} formato={(t) => `${t} %`} />
        <EjeX x={x} valores={es.map((p) => p.anio)} alto={H - M.abajo} cada={estrecho ? 7 : 3} />

        <path d={relleno ?? ''} className="hueco" style={{opacity: v.hueco * 0.9}} />
        {medidas.map((m) => (
          <g key={m.anio} style={{opacity: v.hueco}}>
            <line x1={x(m.anio)} x2={x(m.anio)} y1={y(m.a) + 4} y2={y(m.b) - 4} className="medida" />
            <text x={x(m.anio) + (m.anio === finEs.anio ? -6 : 6)} y={(y(m.a) + y(m.b)) / 2} dy="0.35em" textAnchor={m.anio === finEs.anio ? 'end' : 'start'} className="anotacion">
              {estrecho ? dec1(m.a - m.b) : puntos(Math.round((m.a - m.b) * 10) / 10)}
            </text>
          </g>
        ))}

        <g style={{opacity: v.ue}}>
          <path d={trazo(ueEst) ?? ''} className="serie serie-ue serie-estimada" />
          <path d={trazo(ueReal) ?? ''} className="serie serie-ue" />
          {!estrecho && (
            <text x={x(ue[2].anio)} y={y(ue[2].v) + 18} className="eje-texto">
              estimación de Eurostat
            </text>
          )}
          <text x={x(finUe.anio) + 8} y={y(finUe.v)} dy="0.35em" className="serie-etiqueta etiqueta-ue">
            <tspan x={x(finUe.anio) + 8}>UE</tspan>
            <tspan x={x(finUe.anio) + 8} dy="1.15em" className="etiqueta-cifra">
              {pc(finUe.v)}
            </tspan>
          </text>
        </g>

        <path d={trazo(es) ?? ''} className="serie serie-es" />
        <circle cx={x(es[0].anio)} cy={y(es[0].v)} r={4} className="punto-es" />
        <circle cx={x(finEs.anio)} cy={y(finEs.v)} r={4.5} className="punto-es" />
        <text x={x(es[0].anio) + 4} y={y(es[0].v) + 20} className="anotacion">
          {pc(es[0].v)}
        </text>
        <text x={x(finEs.anio) + 8} y={y(finEs.v)} dy="0.35em" className="serie-etiqueta etiqueta-es">
          <tspan x={x(finEs.anio) + 8}>España</tspan>
          <tspan x={x(finEs.anio) + 8} dy="1.15em" className="etiqueta-cifra">
            {pc(finEs.v)}
          </tspan>
        </text>
      </svg>
    </div>
  );
}
