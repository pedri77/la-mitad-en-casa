import type {ReactNode} from 'react';
import {procedencia, type ClaveFuente} from '../datos';

type Tabla = {columnas: string[]; filas: (string | number)[][]};

/** «Ministerio del Interior, Portal…: hechos conocidos… (tabla 05001); INE, …: …» → «Ministerio del Interior, Portal…; INE, …». */
const corta = (fuente: string) => [...new Set(fuente.split('; ').map((f) => f.split(':')[0].trim()))].join('; ');

/**
 * Envoltorio de todo gráfico: título, el SVG, la fuente (sacada de procedencia.json, nunca escrita
 * a mano) y la tabla de datos equivalente en un <details>, que es lo que lee un lector de pantalla.
 * Bajo el gráfico va la fuente corta (en móvil el gráfico es sticky y no cabe más); la completa, con
 * notas y licencia, va dentro del <details>.
 */
export function Figura({titulo, fuente, tabla, children}: {titulo: string; fuente: ClaveFuente; tabla: Tabla; children: ReactNode}) {
  const p = procedencia[fuente];
  return (
    <figure className="figura">
      <p className="figura-titulo">{titulo}</p>
      <div aria-hidden>{children}</div>
      <figcaption className="figura-fuente">
        Fuente: <a href={p.url}>{corta(p.fuente)}</a>
      </figcaption>
      <details className="figura-tabla">
        <summary>Ver los datos en una tabla</summary>
        <p className="mt-2 max-w-prose">
          {p.fuente}. {p.nota ? `${p.nota}. ` : ''}
          {p.licencia}. Descargado el {p.descargado}.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {tabla.columnas.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.filas.map((f, i) => (
                <tr key={i}>
                  {f.map((v, j) =>
                    j === 0 ? (
                      <th key={j} scope="row">
                        {v}
                      </th>
                    ) : (
                      <td key={j}>{typeof v === 'number' ? v.toLocaleString('es-ES') : v}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
