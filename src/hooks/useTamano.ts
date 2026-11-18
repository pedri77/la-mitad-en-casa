import {useEffect, useRef, useState} from 'react';

/**
 * Ancho real del contenedor. Los gráficos se dibujan a tamaño de píxel (viewBox = ancho real),
 * no escalados: si no, en móvil un SVG de 640 px se encoge y el texto de los ejes queda a 6 px.
 * Con el ancho, cada gráfico decide qué simplificar (menos etiquetas, márgenes menores).
 */
export function useTamano<T extends HTMLElement = HTMLDivElement>(inicial = 640) {
  const ref = useRef<T>(null);
  const [ancho, setAncho] = useState(inicial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAncho(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, ancho] as const;
}
