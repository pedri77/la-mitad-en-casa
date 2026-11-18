import {interpolate} from 'd3-interpolate';
import {useEffect, useRef, useState} from 'react';
import {useMovimientoReducido} from './useMovimientoReducido';

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Interpola un valor (número, array u objeto de números) hacia `objetivo` cuando cambia.
 * El gráfico se dibuja con el valor intermedio: barras que crecen, puntos que se recolocan,
 * una línea que se alarga. Con movimiento reducido salta directamente.
 *
 * Mantén la forma estable (mismas claves, mismo largo de array) entre pasos; si cambia,
 * d3-interpolate añade o quita elementos de golpe.
 */
export function useTransicion<T>(objetivo: T, ms = 700): T {
  const reducido = useMovimientoReducido();
  const [valor, setValor] = useState(objetivo);
  const actual = useRef(objetivo);
  const clave = JSON.stringify(objetivo);

  useEffect(() => {
    if (reducido) {
      actual.current = objetivo;
      setValor(objetivo);
      return;
    }
    const f = interpolate(actual.current as never, objetivo as never) as (t: number) => T;
    const t0 = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const v = f(suave(k));
      actual.current = v;
      setValor(v);
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [clave, reducido, ms]); // eslint-disable-line react-hooks/exhaustive-deps

  return valor;
}
