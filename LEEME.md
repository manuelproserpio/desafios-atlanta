# Desafíos del Bohemio

Sitio de minijuegos de hinchas sobre el Club Atlético Atlanta (no es la web oficial del club). Cobertura: 2010 en adelante.

## Cómo está armado

| Archivo o carpeta | Qué es |
|---|---|
| `index.html`, `app.js` | La página y su lógica. No contienen datos. |
| `assets/camisetas/` | Fotos de camisetas ya optimizadas (WebP). |
| `herramientas/optimizar_imagenes.py` | Achica y convierte fotos nuevas de camisetas (necesita Pillow). |
| `datos.js` | Lo que lee la página. **Se genera solo**: no se edita a mano. |
| `jornadas.js` | Los 7 desafíos de cada fecha, **congelados**: una jornada ya publicada no cambia aunque se agreguen preguntas. Se genera solo. |
| `datos/` | La base de datos: archivos CSV que sí se editan (ver `datos/LEEME_DATOS.md`). |
| `herramientas/validar.py` | Controla los datos (sumas contra la tabla de cada temporada, duplicados, nombres). |
| `herramientas/generar.py` | Corre el validador y escribe `datos.js` con los datos aptos. |
| `herramientas/congelar.js` | Congela en `jornadas.js` la jornada de cada fecha (necesita Node 18 o más nuevo). |
| `.github/workflows/publicar.yml` | Hace todo lo anterior automáticamente en GitHub y publica el sitio: cada vez que cambiás algo y todos los días a las 00:10 de Argentina (congela la jornada del día). |
| `informe_validacion.txt` | Último informe del validador. |

Los datos con error o pendientes **no entran** a los juegos: el validador los deja afuera y lo avisa en el informe.

## Archivo histórico

El calendario muestra cada día desde el 15/10/2026 con victorias y desafíos jugados (verde: 7 victorias, azul: día completo, amarillo: a medias). Tocar un día abre sus 7 desafíos originales. La fecha de inicio es la constante `INICIO` de `app.js`. Para la racha cuenta solo lo jugado el mismo día: reponer un día del archivo no suma racha.

## Dónde publicarlo (gratis)

Recomendado para empezar: **GitHub Pages** (todo queda en el mismo lugar que los datos y la automatización). Si algún día hay mucho tráfico, se pasa a **Cloudflare Pages** conectando el mismo repositorio. Netlify en el plan gratuito queda corto porque cada actualización diaria consume créditos.

## Publicarlo (GitHub Pages)

Resumen (el paso a paso detallado se dio en el chat):

1. Crear un repositorio **público** en github.com y subir **el contenido** de esta carpeta (no la carpeta en sí): `index.html` tiene que quedar en la raíz del repositorio.
2. Verificar que exista `.github/workflows/publicar.yml` (si no se subió porque es una carpeta oculta, crearlo a mano).
3. En «Settings → Pages», elegir como fuente **GitHub Actions** (no «Deploy from a branch»).
4. En la pestaña «Actions», correr «Validar, generar y publicar» con «Run workflow».
5. El sitio queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

Importante: los commits que hace el robot de la automatización **no** vuelven a publicar Pages por sí solos (así lo indica la documentación de GitHub). Por eso el mismo flujo de trabajo publica el sitio al final de cada ejecución.

## Rutina de actualización (con los CSV)

1. Entrá al repositorio y abrí `datos/partidos.csv` (lápiz de editar).
2. Agregá una fila por partido nuevo y, si tenés los goleadores, filas en `datos/goles.csv`.
3. Confirmá el cambio («Commit changes»).
4. GitHub corre solo el validador, el generador y la publicación. En 1 a 3 minutos se actualiza la web.
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
