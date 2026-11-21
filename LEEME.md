# Desafíos del Bohemio

Sitio de minijuegos de hinchas sobre el Club Atlético Atlanta (no es la web oficial del club). Cobertura: 2010 en adelante.

## Cómo está armado

| Archivo o carpeta | Qué es |
|---|---|
| `index.html`, `app.js` | La página y su lógica. No contienen datos. |
| `assets/camisetas/` | Fotos de camisetas ya optimizadas (WebP). |
| `netlify.toml`, `404.html` | Configuración de Netlify: oculta del sitio público las carpetas internas (`datos/`, `herramientas/`, `.github/`), el informe y esta guía. |
| `herramientas/optimizar_imagenes.py` | Achica y convierte fotos nuevas de camisetas (necesita Pillow). |
| `datos.js` | Lo que lee la página. **Se genera solo**: no se edita a mano. |
| `jornadas.js` | Los 7 desafíos de cada fecha, **congelados**: una jornada ya publicada no cambia aunque se agreguen preguntas. Se genera solo. |
| `datos/` | La base de datos: archivos CSV que sí se editan (ver `datos/LEEME_DATOS.md`). |
| `herramientas/validar.py` | Controla los datos (sumas contra la tabla de cada temporada, duplicados, nombres). |
| `herramientas/generar.py` | Corre el validador y escribe `datos.js` con los datos aptos. |
| `herramientas/congelar.js` | Congela en `jornadas.js` la jornada de cada fecha (necesita Node 18 o más nuevo). |
| `.github/workflows/publicar.yml` | Valida, regenera `datos.js` y congela jornadas cuando hace falta (al subir cambios y los lunes). No publica: eso lo hace Netlify. |
| `informe_validacion.txt` | Último informe del validador. |

Los datos con error o pendientes **no entran** a los juegos: el validador los deja afuera y lo avisa en el informe.

## Archivo histórico

El calendario muestra cada día desde el 15/10/2026 con victorias y desafíos jugados (verde: 7 victorias, azul: día completo, amarillo: a medias). Tocar un día abre sus 7 desafíos originales. La fecha de inicio es la constante `INICIO` de `app.js`. Para la racha cuenta solo lo jugado el mismo día: reponer un día del archivo no suma racha.

## Dónde está publicado: Netlify (con límites)

El sitio se publica en **Netlify** conectado a este repositorio: cada vez que hay un cambio en `main`, Netlify publica de nuevo. Configuración del sitio: sin comando de build y carpeta de publicación `.` (la raíz).

**Ojo con el cupo gratuito:** el plan gratuito actual de Netlify da 300 créditos por mes (límite duro: al agotarse, el sitio se pausa). Cada publicación exitosa cuesta 15 créditos, es decir, unas 20 por mes, y el tráfico también consume. Por eso el flujo de GitHub **no hace commits todos los días**: congela las jornadas con 28 días de anticipación y solo agrega más cuando quedan menos de 14 días congelados. Aun así, conviene juntar varios cambios en un solo push. Si el sitio crece o hace falta más margen, la alternativa gratuita sin ese límite es **Cloudflare Pages** conectado al mismo repositorio (tráfico ilimitado y 500 publicaciones por mes). Las cuentas de Netlify creadas antes del cambio de abril de 2026 pueden seguir en el plan anterior; el panel de Netlify muestra cuál tenés.

## Rutina de actualización (con los CSV)

1. Entrá al repositorio y abrí `datos/partidos.csv` (lápiz de editar).
2. Agregá una fila por partido nuevo y, si tenés los goleadores, filas en `datos/goles.csv`.
3. Confirmá el cambio («Commit changes»).
4. GitHub valida y regenera `datos.js` solo si hace falta, y Netlify publica. En 1 a 3 minutos se actualiza la web.
5. Si la pestaña «Actions» muestra una cruz roja, hay un error de datos: abrí `informe_validacion.txt` o el detalle de la ejecución, corregí la fila y volvé a confirmar. Mientras tanto la web sigue con los datos anteriores.

Con computadora, además, podés correr `python herramientas/generar.py` y ver el informe antes de subir.

## Fotos de camisetas

Las fotos vienen del aporte del usuario y su permiso de uso está **PENDIENTE** (`camisetas.csv`). Antes de publicar el sitio conviene confirmar la fuente de cada una y pedir permiso o dar crédito; algunas fotos tienen marca de agua de su origen. Una foto con `permiso` en `NO` no se usa.

## Reglas de calidad (decididas con el dueño del proyecto)

- Un dato de `FUENTE_UNICA` entra a los juegos solo si su temporada pasa el control de sumas contra la tabla final.
- `PENDIENTE` y `CONFLICTO` nunca entran.
- Manicomio Bohemio y Sentimiento Bohemio valen solo como pista, no como fuente de un dato.
- Si dos fuentes se contradicen, gana ESPN o un medio que no sea del club. La alternativa queda anotada en `observaciones`.

## Pendientes

Partidos de 2019/20 a 2021; goleadores de varios partidos de 2025 y 2026; corrección de 2016/17 y 2017/18; fotos de jugadores; confirmar fuente y permiso de las fotos de camisetas; camiseta 2006/07 y 2025; tarjeta de «partido de la semana».

`herramientas/historial/migrar_inicial.py` es solo un registro de cómo se armaron los CSV la primera vez; no hace falta correrlo.
