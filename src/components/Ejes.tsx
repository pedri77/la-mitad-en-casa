import type {ScaleBand, ScaleLinear} from 'd3-scale';

type Lineal = ScaleLinear<number, number>;

/** Eje Y con líneas de rejilla finas: los números al margen izquierdo, la rejilla a todo el ancho. */
export function EjeY({y, ancho, ticks = 4, formato = (v: number) => v.toLocaleString('es-ES')}: {y: Lineal; ancho: number; ticks?: number; formato?: (v: number) => string}) {
  return (
    <g className="eje">
      {y.ticks(ticks).map((t) => (
        <g key={t} transform={`translate(0,${y(t)})`}>
          <line x1={0} x2={ancho} className="rejilla" />
          <text x={0} dy={-5} className="eje-texto">
            {formato(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Eje X para años o categorías numéricas. `cada` muestra una de cada n etiquetas. */
export function EjeX({x, valores, alto, cada = 1, formato = String}: {x: Lineal; valores: number[]; alto: number; cada?: number; formato?: (v: number) => string}) {
  return (
    <g className="eje" transform={`translate(0,${alto})`}>
      {valores.map((v, i) => {
        const ultimo = i === valores.length - 1;
        // La última etiqueta siempre; las demás cada `cada`, salvo si chocarían con la última.
        const visible = ultimo || (i % cada === 0 && Math.abs(x(valores[valores.length - 1]) - x(v)) > 44);
        return visible ? (
          <text key={v} x={x(v)} y={18} textAnchor="middle" className="eje-texto">
            {formato(v)}
          </text>
        ) : null;
      })}
    </g>
  );
}

/** Etiquetas de categoría para barras horizontales. */
export function EjeBandas({y, etiquetas}: {y: ScaleBand<string>; etiquetas: string[]}) {
  return (
    <g className="eje">
      {etiquetas.map((e) => (
        <text key={e} x={0} y={(y(e) ?? 0) + y.bandwidth() / 2} dy="0.35em" className="eje-texto">
          {e}
        </text>
      ))}
    </g>
  );
}
