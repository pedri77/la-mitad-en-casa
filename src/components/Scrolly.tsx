import type {ReactNode} from 'react';
import {usePasos} from '../hooks/usePasos';

type Props = {
  id: string;
  /** Gráfico fijo: recibe el paso activo y dibuja ese estado. */
  grafico: (paso: number) => ReactNode;
  /** Un párrafo corto por paso. Cada uno cambia UNA cosa del gráfico. */
  pasos: ReactNode[];
};

/**
 * Scrollytelling: gráfico fijo (sticky) + pasos de texto que pasan por encima o al lado.
 * Escritorio: texto a la izquierda, gráfico a la derecha. Móvil: gráfico arriba (sticky)
 * y tarjetas de texto que suben sobre él, con fondo para que se lean.
 */
export function Scrolly({id, grafico, pasos}: Props) {
  const {activo, registrar} = usePasos(pasos.length, id);
  return (
    <section className="scrolly" aria-labelledby={`${id}-titulo`}>
      <div className="scrolly-grafico" aria-live="polite">
        {grafico(activo)}
      </div>
      <div className="scrolly-pasos">
        {pasos.map((p, i) => (
          <div key={i} ref={registrar(i)} data-paso={i} className={`scrolly-paso ${i === activo ? 'activo' : ''}`}>
            <div className="scrolly-tarjeta">{p}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
