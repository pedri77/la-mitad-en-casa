#!/usr/bin/env python3
"""
Descarga, limpia y guarda los datos de la web en src/datos/*.json, con su procedencia.

Uso (desde la raíz del proyecto):  npm run datos   (= uv run python -I scripts/datos.py)

Fuente: Eurostat, API de difusión SDMX 2.1 en formato SDMX-CSV (una fila por observación, con
columnas OBS_VALUE y OBS_FLAG). Decimales con punto: se leen con numero_punto(), no con numero().

Banderas de Eurostat que se conservan en el JSON (campo «f»): b = corte de serie, e = estimado,
p = provisional. El gráfico las marca y el texto las dice.
"""
import csv
import datetime
import io
import json
import pathlib
import shutil
import ssl
import subprocess
import urllib.request

RAIZ = pathlib.Path.cwd()
CRUDOS = RAIZ / "datos-crudos"
SALIDA = RAIZ / "src" / "datos"
HOY = datetime.date.today().isoformat()

API = "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/{tabla}/?format=SDMX-CSV&compressed=false"
LICENCIA = "Eurostat, CC BY 4.0 (política de reutilización de la Comisión Europea, Decisión 2011/833/UE)"

FUENTES = {
    "con_padres": {
        "url": API.format(tabla="ilc_lvps08"),
        "web": "https://ec.europa.eu/eurostat/databrowser/view/ilc_lvps08/default/table",
        "fuente": "Eurostat: jóvenes de 25 a 34 años que viven con sus padres, en % (EU-SILC, tabla ilc_lvps08)",
        "licencia": LICENCIA,
        "nota": "Encuesta de condiciones de vida (EU-SILC). Incluye a quien aporta ingresos al hogar de sus padres o se beneficia de ellos. La media de la UE-27 de 2010 a 2018 es una estimación de Eurostat (bandera e). Lituania 2025 es provisional y Luxemburgo 2025 tiene corte de serie",
    },
    "edad": {
        "url": API.format(tabla="yth_demo_030"),
        "web": "https://ec.europa.eu/eurostat/databrowser/view/yth_demo_030/default/table",
        "fuente": "Eurostat: edad media estimada a la que los jóvenes dejan el hogar de sus padres (encuesta de población activa, tabla yth_demo_030)",
        "licencia": LICENCIA,
        "nota": "Encuesta de población activa (EU-LFS), distinta de EU-SILC. España tiene cortes de serie en 2005 y 2021, y la UE-27 en 2021: la serie empieza en 2005 y el corte de 2021 se marca",
    },
}

# Los 27 Estados miembros actuales (geo de Eurostat → nombre en castellano).
UE27 = {
    "AT": "Austria", "BE": "Bélgica", "BG": "Bulgaria", "CY": "Chipre", "CZ": "Chequia", "DE": "Alemania",
    "DK": "Dinamarca", "EE": "Estonia", "EL": "Grecia", "ES": "España", "FI": "Finlandia", "FR": "Francia",
    "HR": "Croacia", "HU": "Hungría", "IE": "Irlanda", "IT": "Italia", "LT": "Lituania", "LU": "Luxemburgo",
    "LV": "Letonia", "MT": "Malta", "NL": "Países Bajos", "PL": "Polonia", "PT": "Portugal", "RO": "Rumanía",
    "SE": "Suecia", "SI": "Eslovenia", "SK": "Eslovaquia",
}
UE = "EU27_2020"


def descargar(clave: str) -> str:
    """Devuelve el texto de la fuente, usando la copia de datos-crudos/ si existe."""
    CRUDOS.mkdir(exist_ok=True)
    destino = CRUDOS / f"{clave}.csv"
    if not destino.exists():
        url = FUENTES[clave]["url"]
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "web-datos/1.0"})
            with urllib.request.urlopen(req, timeout=120) as r:
                destino.write_bytes(r.read())
        except urllib.error.URLError as e:
            # El Python de uv usa su propio OpenSSL y no siempre valida cadenas que el sistema sí
            # (en macOS, CERTIFICATE_VERIFY_FAILED con Eurostat). curl usa el almacén del sistema.
            if not isinstance(e.reason, ssl.SSLError) or not shutil.which("curl"):
                raise
            print(f"{clave}: urllib no valida el certificado; descargo con curl")
            subprocess.run(["curl", "-fsSL", "--max-time", "120", "-A", "web-datos/1.0", "-o", str(destino), url], check=True)
    return destino.read_bytes().decode("utf-8-sig")


def numero_punto(v: str) -> float | None:
    """Formato internacional (Eurostat, OCDE, Banco Mundial): '29.4' → 29.4; vacío o ':' → None."""
    v = (v or "").strip()
    return None if v in ("", ":", "..", "-") else float(v)


def observaciones(clave: str, **filtro: str) -> dict[tuple[str, int], dict]:
    """SDMX-CSV de Eurostat → {(geo, año): {"v": valor, "f": bandera}} con las filas que cumplen el filtro."""
    filas = csv.DictReader(io.StringIO(descargar(clave)))
    out = {}
    for f in filas:
        if any(f[k] != v for k, v in filtro.items()):
            continue
        valor = numero_punto(f["OBS_VALUE"])
        obs = {"v": valor}
        if f.get("OBS_FLAG"):
            obs["f"] = f["OBS_FLAG"].strip()
        out[(f["geo"], int(f["TIME_PERIOD"]))] = obs
    assert out, f"{clave}: el filtro {filtro} no devuelve filas"
    return out


def serie(obs: dict, geo: str, desde: int) -> list[dict]:
    puntos = [{"anio": a, **o} for (g, a), o in obs.items() if g == geo and a >= desde]
    return sorted(puntos, key=lambda d: d["anio"])


_procedencia: dict = {}


def escribir(nombre: str, datos, *claves_fuente: str) -> None:
    if not claves_fuente:
        raise ValueError(f"{nombre}: sin fuente no se escribe")
    SALIDA.mkdir(parents=True, exist_ok=True)
    (SALIDA / f"{nombre}.json").write_text(json.dumps(datos, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    fs = [FUENTES[c] for c in claves_fuente]
    _procedencia[nombre] = {
        "fuente": "; ".join(f["fuente"] for f in fs),
        "url": fs[0]["web"],
        "datos": fs[0]["url"],
        "licencia": "; ".join(sorted({f["licencia"] for f in fs})),
        "descargado": HOY,
        "nota": "; ".join(f["nota"] for f in fs if f.get("nota")),
    }


def preparar() -> None:
    # 1. Jóvenes de 25 a 34 que viven con sus padres (EU-SILC), total por sexo.
    cp = observaciones("con_padres", age="Y25-34", sex="T", unit="PC")
    es = serie(cp, "ES", 2004)
    ue = serie(cp, UE, 2010)
    assert es[0]["anio"] == 2004 and ue[0]["anio"] == 2010, "cambió el arranque de las series"
    assert all(p["v"] is not None for p in es + ue), "hueco en España o UE: tratarlo como null en el gráfico"
    paises = []
    for geo, nombre in UE27.items():
        a, b = cp.get((geo, 2010)), cp.get((geo, 2025))
        assert a and b, f"{geo}: falta 2010 o 2025"
        paises.append({"geo": geo, "nombre": nombre, "v2010": a["v"], "v2025": b["v"],
                       **({"f2010": a["f"]} if "f" in a else {}), **({"f2025": b["f"]} if "f" in b else {})})
    assert len(paises) == 27
    escribir("con_padres", {"espana": es, "ue": ue, "paises": paises}, "con_padres")

    # 2. Edad media de emancipación (EU-LFS), desde el corte de 2005.
    ed = observaciones("edad", sex="T", unit="AVG")
    escribir("edad", {"espana": serie(ed, "ES", 2005), "ue": serie(ed, UE, 2005)}, "edad")


if __name__ == "__main__":
    preparar()
    (SALIDA / "procedencia.json").write_text(json.dumps(_procedencia, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for n, p in _procedencia.items():
        print(f"{n}.json  ←  {p['fuente']}")
