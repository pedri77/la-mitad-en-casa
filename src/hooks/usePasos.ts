import {useEffect, useRef, useState} from 'react';

/**
 * Qué paso del texto está en el centro de la pantalla. Un IntersectionObserver con una franja de 1 px
 * en mitad del viewport: sin listeners de scroll ni re-renders por fotograma.
 *
 * `?escena=<id>&paso=n` en la URL salta a ese paso de esa escena al cargar (para enlazar y para el QA
 * con scripts/estados.mjs). Si la página tiene un solo Scrolly, basta `?paso=n`.
 */
const pasoInicial = (id: string, total: number) => {
  const q = new URLSearchParams(location.search);
  const escena = q.get('escena');
  if (escena !== null && escena !== id) return null;
  const n = Number(q.get('paso'));
  return q.has('paso') && Number.isInteger(n) && n >= 0 && n < total ? n : null;
};

export function usePasos(total: number, id = '') {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [activo, setActivo] = useState(() => pasoInicial(id, total) ?? 0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActivo(Number((e.target as HTMLElement).dataset.paso));
      },
      {rootMargin: '-50% 0px -50% 0px'},
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [total]);

  // Salto inicial: centra ese paso sin animación.
  useEffect(() => {
    const n = pasoInicial(id, total);
    if (n === null) return;
    const el = refs.current[n];
    if (!el) return;
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      window.scrollTo({top: window.scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: 'auto'});
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const registrar = (i: number) => (el: HTMLElement | null) => void (refs.current[i] = el);
  return {activo, registrar};
}
