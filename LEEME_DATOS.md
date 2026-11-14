# Base de datos (CSV)

Codificación UTF-8, separador coma. Estados posibles: `VERIFICADO` (dos fuentes que coinciden), `FUENTE_UNICA`, `PENDIENTE`, `CONFLICTO`.

| Archivo | Una fila es… | Columnas clave |
|---|---|---|
| `temporadas.csv` | una temporada | temporada, torneo, zona, posicion, puntos, pj, pg, pe, pp, gf, gc, goleadores (`COMPLETO` si la lista suma los goles del equipo, `LIDER` si solo está confirmado el máximo goleador, `PARCIAL`), dato_clave (un hecho que sirve de pista), nivel (`n` o `d`), pos_definitiva (`NO` si el torneo se suspendió), fuente_1, fuente_2, estado |
| `partidos.csv` | un partido oficial | id, temporada, torneo, zona, fecha_oficial, fecha (AAAA-MM-DD), local, goles_local, goles_visitante, visitante, estadio, estado, fuente_1, fuente_2, observaciones |
| `goles.csv` | un gol | partido_id, equipo (`ATL` o `RIVAL`), jugador, minuto, tipo (`normal` o `penal`), fuente |
| `goleadores_temporada.csv` | un jugador en una temporada | temporada, jugador, goles_liga (solo liga), estado, fuente_1, fuente_2, observaciones |
| `planteles.csv` | un jugador en una temporada | temporada, jugador, jugo_partidos (`SI` o `DESCONOCIDO`), fuente |
| `jugadores.csv` | un jugador | nombre canónico y variantes de escritura separadas con `|` (en minúsculas y sin acentos) |
| `alineaciones.csv` | un jugador en una formación | id, temporada, rival, fecha, jugador, orden, alias, ciego (`n` o `d`: en qué nivel se oculta) |
| `hitos.csv` | un hecho histórico | orden (año con decimales para ordenar), fecha, hecho, fuente_1, fuente_2, estado |
| `fuentes.csv` | una fuente | id, nombre, tipo, confianza (`pista` = no sirve como fuente de un dato) |

## Cómo agregar un partido

1. En `partidos.csv`: una fila nueva con un `id` único (por ejemplo `2026-037`), todos los campos y el estado. Las temporadas con totales cargados deben seguir sumando lo que dice `temporadas.csv`.
2. En `goles.csv`: una fila por gol de Atlanta (y del rival si lo tenés). La cantidad de goles de Atlanta cargados debe ser igual al marcador; si no, el partido no se usa en «¿Quién la metió?».
3. Si aparece un jugador nuevo, agregalo en `jugadores.csv` (y en `planteles.csv` si querés que cuente para su temporada).
