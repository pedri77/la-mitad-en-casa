/**
 * «Uno de cada dos sigue en casa»: cuatro escenas con Scrolly. Las cifras salen de `cifras` (src/datos.ts).
 */
import {Figura} from './components/Figura';
import {Scrolly} from './components/Scrolly';
import {contenido as c} from './content';
import {cifras as k, datos, procedencia, puestos} from './datos';
import {Cien} from './graficos/Cien';
import {Edad} from './graficos/Edad';
import {Hueco} from './graficos/Hueco';
import {Ranking} from './graficos/Ranking';
import {dec1, lista, pc, puntos, unoDeCada, veces} from './lib/formato';

const cp = datos.conPadres;
const ed = datos.edad;
const n = (v: number) => Math.round(v);

const tablaHueco = {
  columnas: ['Año', 'España (%)', 'UE-27 (%)'],
  filas: cp.espana.map((p) => {
    const u = cp.ue.find((d) => d.anio === p.anio);
    return [p.anio, dec1(p.v), u ? `${dec1(u.v)}${u.f === 'e' ? ' (estimado)' : ''}` : 'sin dato'];
  }),
};
const p10 = puestos(2010);
const p25 = puestos(2025);
const tablaRanking = {
  columnas: ['País', '2010 (%)', 'Puesto 2010', '2025 (%)', 'Puesto 2025'],
  filas: [...cp.paises]
    .sort((a, b) => p25[a.geo] - p25[b.geo])
    .map((p) => [
      p.nombre,
      dec1(p.v2010),
      p10[p.geo],
      `${dec1(p.v2025)}${p.f2025 === 'p' ? ' (provisional)' : p.f2025 === 'b' ? ' (corte de serie)' : ''}`,
      p25[p.geo],
    ]),
};
const tablaEdad = {
  columnas: ['Año', 'España (años)', 'UE-27 (años)'],
  filas: ed.espana.map((p) => {
    const u = ed.ue.find((d) => d.anio === p.anio);
    const corte = (f?: string) => (f === 'b' ? ' (corte de serie)' : '');
    return [p.anio, `${dec1(p.v)}${corte(p.f)}`, u ? `${dec1(u.v)}${corte(u.f)}` : 'sin dato'];
  }),
};
const tablaCien = {
  columnas: ['Grupo', 'De cada 100 (redondeado)', 'Dato (%)'],
  filas: [
    [`España ${k.anioIni}`, n(k.es2004), dec1(k.es2004)],
    [`España ${k.anioFin}`, n(k.es2025), dec1(k.es2025)],
    [`UE-27 ${k.anioFin}`, n(k.ue2025), dec1(k.ue2025)],
  ],
};

const estadosCien = [
  {n: k.es2004, quien: `España, ${k.anioIni}`},
  {n: k.es2025, quien: `España, ${k.anioFin}`},
  {n: k.ue2025, quien: `UE-27, ${k.anioFin}`},
];

export default function App() {
  return (
    <main>
      <header className="portada">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-14 sm:px-6 sm:pt-28">
          <p className="text-etiqueta uppercase text-texto-2">{c.antetitulo}</p>
          <h1 className="mt-4 font-display text-hero text-balance">{c.titulo}</h1>
          <p className="mt-6 text-lead text-texto-2 text-pretty">
            En {k.anioFin}, el {pc(k.es2025)} de los españoles de 25 a 34 años vivía con sus padres. En {k.anioIni} era el {pc(k.es2004)}.
            En el conjunto de la Unión Europea, el {pc(k.ue2025)}, casi lo mismo que en 2010 ({pc(k.ue2010)}).
          </p>
        </div>
      </header>

      <Scrolly
        id="cien"
        grafico={(paso) => (
          <Figura titulo="Jóvenes de 25 a 34 años que viven con sus padres, de cada 100" fuente="con_padres" tabla={tablaCien}>
            <Cien {...estadosCien[paso]} />
          </Figura>
        )}
        pasos={[
          <p key="0">
            <strong id="cien-titulo">Piensa en cien españoles de 25 a 34 años.</strong> En {k.anioIni}, {n(k.es2004)} de ellos vivían en casa de sus padres:{' '}
            {unoDeCada(k.es2004) ?? `${n(k.es2004)} de cada 100`}.
          </p>,
          <p key="1">
            En {k.anioFin} ya son {n(k.es2025)}: {unoDeCada(k.es2025) ?? `${n(k.es2025)} de cada 100`}.
          </p>,
          <p key="2">
            En el conjunto de la Unión Europea son {n(k.ue2025)} de cada 100. España está {puntos(k.h2025)} por encima.
          </p>,
        ]}
      />

      <Scrolly
        id="hueco"
        grafico={(paso) => (
          <Figura titulo="Jóvenes de 25 a 34 años que viven con sus padres (%)" fuente="con_padres" tabla={tablaHueco}>
            <Hueco paso={paso} />
          </Figura>
        )}
        pasos={[
          <p key="0">
            <strong id="hueco-titulo">La línea española sube casi sin pausa:</strong> del {pc(k.es2004)} en {k.anioIni} al {pc(k.es2025)} en {k.anioFin},{' '}
            {puntos(k.subida)} más.
          </p>,
          <p key="1">
            La media europea, en cambio, está plana: {pc(k.ue2010)} en 2010 y {pc(k.ue2025)} en {k.anioFin}. El tramo discontinuo es una estimación de
            Eurostat.
          </p>,
          <p key="2">
            En 2010 España estaba {puntos(k.h2010)} por encima de Europa. En {k.anioFin}, {puntos(k.h2025)}: el hueco es {veces(k.h2010, k.h2025)} mayor.
          </p>,
        ]}
      />

      <Scrolly
        id="ranking"
        grafico={(paso) => (
          <Figura titulo={`Jóvenes de 25 a 34 años que viven con sus padres, por país (%)`} fuente="con_padres" tabla={tablaRanking}>
            <Ranking paso={paso} />
          </Figura>
        )}
        pasos={[
          <p key="0">
            <strong id="ranking-titulo">En 2010 España estaba en mitad de la tabla:</strong> puesto {k.puesto2010} de {k.nPaises}, con un {pc(k.es2010)}.
          </p>,
          <p key="1">
            En {k.anioFin} ha subido al puesto {k.puesto2025}. Por delante solo quedan {lista(k.delante2025.map((p) => p.nombre))}.
          </p>,
          <p key="2">
            En el otro extremo, {lista(k.bajos.map((p) => p.nombre))}: menos de {k.techoBajos} de cada 100 jóvenes de esa edad siguen en casa.
          </p>,
        ]}
      />

      <Scrolly
        id="edad"
        grafico={(paso) => (
          <Figura titulo="Edad media estimada a la que se deja la casa de los padres (años)" fuente="edad" tabla={tablaEdad}>
            <Edad paso={paso} />
          </Figura>
        )}
        pasos={[
          <p key="0">
            <strong id="edad-titulo">Otra forma de medirlo: la edad a la que uno se va.</strong> En España, {dec1(k.e2025)} años de media en {k.anioFin}; en
            2005, {dec1(k.e2005)}. Con el eje en cero, apenas se nota: {dec1(k.subidaEdad)} años más.
          </p>,
          <p key="1">
            En la Unión Europea, {dec1(k.eUe2025)} años. Un joven español se va de casa {dec1(k.dif2025)} años más tarde que la media europea.
          </p>,
          <p key="2">
            Ampliado, se ve la tendencia. La línea vertical marca {k.corteEdad}, cuando cambió el método de la encuesta. Antes de ese cambio la distancia
            con Europa ya había pasado de {dec1(k.dif2005)} a {dec1(k.dif2020)} años; en {k.anioFin} es de {dec1(k.dif2025)}.
          </p>,
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6" aria-labelledby="matiz">
        <h2 id="matiz" className="font-display text-display">
          {c.cierreTitulo}
        </h2>
        <ul className="mt-8 space-y-5 text-body text-texto-2 text-pretty">
          <li>
            <strong className="text-texto">No dicen por qué.</strong> No separan a quien no puede irse de quien no quiere, ni a quien se fue y volvió. Las
            explicaciones habituales (paro juvenil, precio de la vivienda) necesitan otros datos.
          </li>
          <li>
            <strong className="text-texto">«Vivir con los padres» es la definición de Eurostat.</strong> Cuenta a quien vive en el hogar de sus padres y
            también a quien aporta ingresos a ese hogar o se beneficia de ellos, aunque duerma fuera. No es lo mismo que el padrón.
          </li>
          <li>
            <strong className="text-texto">Son dos encuestas distintas.</strong> El porcentaje sale de la encuesta de condiciones de vida (EU-SILC) y la edad
            media, de la encuesta de población activa (EU-LFS). Cuentan la misma historia, pero no se pueden mezclar en una cuenta.
          </li>
          <li>
            <strong className="text-texto">Algunas cifras son provisionales o estimadas.</strong> La media europea de 2010 a 2018 es una estimación de Eurostat,
            Lituania {k.anioFin} es provisional y Luxemburgo {k.anioFin} y la edad media de {k.corteEdad} tienen corte de serie.
          </li>
        </ul>

        <p className="mt-16 font-display text-lead text-pretty">
          En {k.anioIni}, {unoDeCada(k.es2004) ?? `${n(k.es2004)} de cada 100`}. En {k.anioFin}, {unoDeCada(k.es2025) ?? `${n(k.es2025)} de cada 100`}. En Europa la proporción no se ha movido; en España,
          sí.
        </p>

        <h2 className="mt-16 text-etiqueta uppercase text-texto-2">Fuentes</h2>
        <ul className="mt-4 space-y-3 text-sm text-texto-2">
          {Object.values(procedencia).map((p) => (
            <li key={p.url}>
              <a href={p.url} className="underline underline-offset-3">
                {p.fuente}
              </a>
              . {p.nota}. {p.licencia}. Descargado el {p.descargado}
              {p.datos && (
                <>
                  {' '}
                  (<a href={p.datos} className="underline underline-offset-3">
                    datos en SDMX-CSV
                  </a>
                  )
                </>
              )}
              .
            </li>
          ))}
        </ul>
        <p className="mt-12 text-etiqueta uppercase text-texto-3">{c.pie}</p>
      </section>
    </main>
  );
}
