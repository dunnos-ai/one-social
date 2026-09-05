# ONE · Zona Uno — guía del proyecto

App web (PWA) de la red de asesores: inscripciones, ranking mensual, insignias,
muro social y "Mr. Patterson" (coach de objeciones con IA).
Vive en **one-social.app**, alojada en Netlify.

Front de HTML/CSS/JS plano, todo inline, sin build step ni framework — igual
que `dunnos-app` y `portal-franquicias`.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (~250 KB, ~3800 líneas): login, registro de inscripciones, rankings, perfil, muro, Mr. Patterson. Un solo archivo. |
| `insignias.html` | Página que explica cada insignia y cómo ganarla. Es la versión clara (tema light) de la identidad. |
| `mrpatterson.gif` | El personaje del coach. Va en la **raíz**: el `index.html` lo pide como `mrpatterson.gif`. |
| `favicon.ico`, `apple-touch-icon.png` | En la raíz, que es donde el `index.html` los busca. |
| `manifest.json`, `icons/` | PWA. |
| `sw.js` | Service worker que borra cachés. **Hoy el `index.html` no lo registra** — se controla la caché con los `<meta http-equiv="Cache-Control">` del head y los headers de Netlify. Se deja por si se quiere activar. |
| `netlify.toml` | `publish = "."`, sin build. HTML sin caché; íconos y GIF con caché de una semana. |

## Backend: Supabase

No hay Netlify Functions. El navegador habla directo con Supabase usando la
llave **publishable** (`sb_publishable_…`), que es pública por diseño: la
seguridad real la da **RLS en Supabase**, no esconder la llave.

> Por lo mismo: **nunca** poner en el `index.html` la `service_role key`. Esa sí
> es secreta. Si algún día hace falta, va en una Netlify Function con la llave
> en variables de entorno.

- Proyecto: `otlcrsnoeosyscwhjfxr.supabase.co`
- Auth: `sb.auth.signUp` / `signInWithPassword` (usuario + contraseña).
- Tablas: `profiles`, `enrollments`, `friendships`, `wall_posts`, `badge_requests`,
  `profile_offices`, `offices`, `feed_badge_events`, `activity_log`,
  `patterson_conversaciones`, `objeciones_banco`, y las cerradas por mes
  (`monthly_totals_closed`, `monthly_plan_totals_closed`, `office_monthly_totals_closed`).
- Los rankings **en vivo** son RPC, no consultas directas: `mi_rango_nacional_vivo`,
  `mi_rango_oficina_vivo`, `mi_rango_proyectado_vivo`, `ranking_categoria_vivo`,
  `categoria_ranking_anonimo_vivo`, `red_ranking_oficinas_vivo`, `oficina_*_vivo`,
  `inicio_mes_efectivo`, `mapa_resistencias_stats`, `promover_a_banco`.
- Mr. Patterson: Edge Function `/functions/v1/mr-patterson`, llamada con el
  `access_token` de la sesión en el header `Authorization`.

Roles (`ME.role`): `rep` (asesor), `sup` (supervisor), `gc` (gerente comercial),
`general`.

## Identidad visual

La app es **oscura por defecto** y tiene tema claro en
`:root[data-theme="light"]`. `insignias.html` usa la paleta clara.

| | Oscuro (default) | Claro |
|---|---|---|
| Fondo | `--ink:#0B0B0F` | `#F2EFE6` |
| Superficies | `#131319` / `#1B1B23` / `#26262F` | `#FFFFFF` / `#EDEAE0` / `#E4E0D3` |
| Bordes | `#2E2E39` | `#E9E4D6` |
| Texto | `#F4F2ED` / `#A2A2AE` / `#6E6E7C` | `#1C1A14` / `#5C5847` / `#8A8574` |
| **Mint (marca)** | `#19E6A0` | `#0E9E75` |
| Acentos | acid `#C8FF3D`, iris `#8B7BFF`, sky `#4CC9F0`, coral `#FF4D6D`, amber `#FFB020` | `#B4E82A`, `#6552E6`, `#1A8FBF`, `#E0324F`, `#C97C05` |

Tipografías: **Bricolage Grotesque** (display, `--fd`), **Space Grotesk**
(cuerpo, `--fb`), **JetBrains Mono** (números y etiquetas, `--fm`).

El logo es un arco con astil vertical en mint sobre cuadro oscuro redondeado.
El SVG inline está en `insignias.html`, en `.hero-mark`.

## Reglas de las insignias

`insignias.html` es la fuente de verdad de cara al asesor, y los nombres coinciden
uno a uno con los del `index.html`. **Si cambia una regla en la app, hay que
cambiarla también ahí** o la página miente.

- **Viaje de Campeones** — 60 inscripciones acumuladas de enero a junio.
- **Volumen acumulado** — Garantía del Mes (12 en un mes, se queda para siempre),
  Club 15 / 25 / 50 / 75 / 100, Club Oro (120).
- **Ranking del mes** — Top 10 Nacional, Podio Nacional (top 3).
- **Consistencia** — Top Performer (top 3 en 3 meses distintos), Influencer
  (top 5 en 3), Closer (top 10 en 3).
- **Mes en curso** — Primer Registro (1), Racha Activa (5), Doble Dígito (10).
- **Rol** — Líder de Equipo (supervisores y gerentes).

Las insignias viejas se piden a mano desde el perfil y caen en `badge_requests`,
para que un gerente las apruebe.

## Cerrar un mes (checklist)

Cuando un mes termina y sus totales entran a `monthly_totals_closed`,
`monthly_plan_totals_closed` y `office_monthly_totals_closed`, hay que agregar
esa clave de mes **en todos estos lugares del `index.html`**. Olvidar uno solo
descuadra los acumulados — ya pasó con agosto:

1. `const MESES_KEY` — la lista maestra de meses cerrados.
2. `const MESES_LBL` — su etiqueta visible ('Septiembre', etc.).
3. El `reps.push({...})` que arma cada representante (`ene:mm.ene||0, …`).
4. Los cinco `personal:{…}` de sup, gc, distrital, divisional y regional.
5. El inicializador de `OFFICE_MONTHLY_DIRECT`.

Después de agregarlo, comprobar la regla de oro:

> **El acumulado de cualquier renglón tiene que ser igual a la suma de sus
> columnas de meses.** Si no cuadra, falta un mes en alguno de esos lugares.

Y actualizar el rango que anuncia `insignias.html` ("Suman tus inscripciones de
Enero–_mes_ …").

### Por qué el acumulado no se suma desde `.t`

El campo `.t` de un supervisor o gerente **ya trae a su equipo dentro**. Sumarlo
junto a los renglones de ese mismo equipo cuenta al equipo dos veces (tres, en
gerentes comerciales, porque además pasa por sus supervisores). Por eso
`totalesPorMes()` calcula el acumulado sumando las columnas de meses ya
resueltas, y nunca los `.t` de los líderes. No volver a sumar `.t` ahí.

## Cómo se publica (no se sube nada a mano)

Netlify está conectado a este repo. No hay build: sirve los archivos tal cual.

1. Los cambios se hacen en una rama y se hace push.
2. Al fusionar en `main`, Netlify despliega solo en ~1 minuto.

**Editar aquí + merge a `main` = actualización en vivo.**
Los pasos de la conexión inicial están en `DESPLIEGUE.md`.

## Convenciones

- Mensajes de commit en español, estilo `feat:`, `fix:`, `chore:`.
- No partir `index.html` en varios archivos: la app depende de que todo esté inline.
- `index.html` es enorme — buscar la sección con `grep -n` antes de tocarlo,
  no leerlo entero.
- Al tocar la interfaz, revisar que se vea bien **en los dos temas**: hay tokens
  que sólo existen en uno de los dos bloques `:root`.
