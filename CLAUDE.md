# ONE · Zona Uno — guía del proyecto

App web (PWA) de la red: inscripciones, ranking mensual e insignias de los
asesores. Vive en **one-social.app**, alojada en Netlify.

Todo el front es HTML/CSS/JS plano, inline, sin build step ni framework —
igual que `dunnos-app` y `portal-franquicias`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa: login, registro de inscripciones, ranking, perfil. Un solo archivo, todo inline. |
| `insignias.html` | Página pública que explica cada insignia y qué se necesita para ganarla. |
| `manifest.json`, `sw.js`, `icons/` | Piezas de la PWA. El service worker **borra cachés a propósito**: cada recarga trae la versión nueva. |
| `img/` | Ilustraciones. `mascota-asesor.gif` es el personaje del asesor. |
| `netlify.toml` | Config de Netlify: `publish = "."`, headers `no-cache` para el HTML y caché de una semana para `icons/` e `img/`. |

## Identidad visual

Tomada de `insignias.html` — usar estos valores, no inventar otros:

| Token | Valor | Uso |
|---|---|---|
| `--mint` | `#0E9E75` | Color de marca. Logo, acentos, estados de éxito. |
| `--mint-d` | `#07543E` | Verde oscuro para texto sobre fondo claro. |
| `--page` | `#F2EFE6` | Fondo de página (crema). |
| `--card` | `#FFFFFF` | Tarjetas. |
| `--line` | `#E9E4D6` | Bordes. |
| `--ink` / `--t2` / `--t3` | `#1C1A14` / `#5C5847` / `#8A8574` | Texto: principal, secundario, terciario. |
| Fondo oscuro | `#0B0F0D` | Bloques destacados, `theme_color`, fondo del ícono. |

Tipografías (Google Fonts): **Space Grotesk** para títulos, **JetBrains Mono**
para etiquetas y números, **Inter** para texto corrido.

El logo es un arco con astil vertical en mint, sobre cuadro oscuro redondeado.
El SVG inline está en el `<div class="hero-mark">` de `insignias.html`.

## Reglas de las insignias

`insignias.html` es la fuente de verdad de cara al asesor. Si cambia una regla
en `index.html`, **hay que cambiarla también ahí** o la página miente.

- **Viaje de Campeones** — 60 inscripciones acumuladas de enero a junio.
- **Por volumen acumulado** — Garantía del Mes (12 en un mes, se queda para
  siempre), Club 15 / 25 / 50 / 75 / 100 y Club Oro (120).
- **Por ranking del mes** — Top 10 Nacional, Podio Nacional (top 3).
- **Por consistencia** — Top Performer (top 3 en 3 meses distintos),
  Influencer (top 5 en 3), Closer (top 10 en 3).
- **Del mes en curso** — Primer Registro (1), Racha Activa (5), Doble Dígito (10).
- **De rol** — Líder de Equipo (supervisores y gerentes).

## Cómo se publica (no se sube nada a mano)

Netlify está conectado a este repo de GitHub. No hay build: Netlify sirve los
archivos tal cual.

1. Los cambios se hacen en una rama y se hace push.
2. Al fusionar en `main`, Netlify despliega solo en ~1 minuto.

**Editar aquí + merge a `main` = actualización en vivo.**

Los pasos de la conexión inicial están en `DESPLIEGUE.md`.

## Convenciones

- Mensajes de commit en español, estilo `feat:`, `fix:`, `chore:`.
- No partir `index.html` en varios archivos: la app depende de que todo esté inline.
- `index.html` es enorme — buscar la sección con `grep -n` antes de tocarlo,
  no leerlo entero.
- Las llaves y secretos **nunca** en el código: van en Netlify → Site settings
  → Environment variables, y se leen desde una Netlify Function.
