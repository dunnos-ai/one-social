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

Búscalos con `grep -n "'ene','feb'\|ene:mm.ene\|ene:0,feb:0" index.html`:

1. `const MESES_KEY` y `const MESES_LBL` — la lista maestra y su etiqueta visible.
2. El `reps.push({...})` que arma cada representante (`ene:mm.ene||0, …`).
3. Los cinco `personal:{…}` de sup, gc, distrital, divisional y regional.
4. El inicializador de `OFFICE_MONTHLY_DIRECT`.
5. Los cuatro `MKEYS` / `MK` locales que recorren los meses: el rollup de sup y gc,
   `historicoDistritalHTML`, `repEntriesConPersonal` y `officeCategoryList`.
6. `maxMonthOf` — la lista suelta que busca el mejor mes.

**No** toques el `['ene',…,'jun']` de `eneJunOf`: ese es el Viaje de Campeones,
que por definición sólo cuenta enero–junio. Tampoco las listas de 12 meses.

Después de agregarlo, comprobar la regla de oro:

> **El acumulado de cualquier renglón tiene que ser igual a la suma de sus
> columnas de meses.** Si no cuadra, falta un mes en alguno de esos lugares.

Y actualizar el rango que anuncia `insignias.html` ("Suman tus inscripciones de
Enero–_mes_ …").

### El corte del mes: `cierre_manual` ⚠️

Los rankings "en vivo" cuentan las inscripciones con
`created_at >= inicio_mes_efectivo()`. Esa función devuelve
`cierre_manual.forzado_desde` **siempre que esa fecha ya haya pasado** — sin
importar en qué mes estemos:

```sql
select forzado_desde into v_forzado from cierre_manual where id=1;
if v_forzado is not null and now() >= v_forzado then
  return v_forzado;   -- se queda pegado ahí para siempre
end if;
```

Sirve para dar chance de capturar ventas rezagadas: las que entren antes de ese
corte cuentan para el mes anterior. Así fue en agosto — 18 inscripciones (22
ventas) capturadas el 1 de septiembre antes de las 16:19 quedaron en el cierre
de agosto, correctamente y sin contarse dos veces.

**El riesgo:** si no se mueve, el mes en vivo nunca avanza. Con
`forzado_desde` en el 1 de septiembre, al llegar octubre el ranking "del mes"
seguiría arrancando en septiembre y mostraría los dos meses sumados.

Por eso, **al cerrar cada mes hay que actualizar esa fila a mano en Supabase**
(la app nunca la escribe): ponerle el nuevo corte, o dejarla en `NULL` para que
aplique la regla automática (el mes anterior sigue vivo hasta las 13:00 del
primer día hábil del mes nuevo).

### Por qué el acumulado no se suma desde `.t`

El campo `.t` de un supervisor o gerente **ya trae a su equipo dentro**. Sumarlo
junto a los renglones de ese mismo equipo cuenta al equipo dos veces (tres, en
gerentes comerciales, porque además pasa por sus supervisores). Por eso
`totalesPorMes()` calcula el acumulado sumando las columnas de meses ya
resueltas, y nunca los `.t` de los líderes. No volver a sumar `.t` ahí.

## Qué es público y qué es anónimo

Dos cosas distintas que se confunden fácil:

| | Se ve | Dónde |
|---|---|---|
| **Meses cerrados** (acumulado, E–_mes_) | Con nombre, para toda la red | Ranking (Acum. y por mes), perfiles |
| **Mes en curso — tarjeta de rivalidad** | Anónimo: "⬡ Rival A/B/C" | Home |
| **Mes en curso — pestaña 🔴 En vivo** | Con nombre | Ranking |
| **Rango de carrera** (Recluta→Élite) | Sólo tú y tus amigos | Perfil |

El mes en curso **no es anónimo en general**. Lo que hace la función
`ranking_categoria_vivo` es limitar por rol: **si quien consulta es `rep`, sólo
ve con nombre a la gente de su propia oficina**; fuera de ahí le queda la
tarjeta anónima. Un sup, gc o líder ve la red completa con nombres.

**Un Gerente Regional ve sus oficinas por nombre.** Hubo una regla que le dejaba
sólo su oficina base y le mostraba el resto como "Oficina A, B, C…". Estaba
escrita en **tres lugares** y hay que quitarla de los tres o el síntoma vuelve:
`buildMeFromAuthUser` y el portal por oficina en el `index.html`, y las
funciones `red_ranking_oficinas_vivo` y `oficina_detalle_vivo` en Supabase.
La autorización sigue saliendo de `profile_offices`: cada quien sólo alcanza
las oficinas que tiene asignadas.

Por eso el rango de carrera del perfil se muestra **sólo a ti y a tus amigos**:
sale del mes en curso, y la amistad es la excepción explícita a esa privacidad.
La tabla de amigos sigue la misma regla — sólo lista a amigos aceptados.

> **Ojo:** el anonimato es de interfaz, no de datos. `loadLive()` baja a cada
> navegador las últimas 2000 inscripciones **con nombre**, sin filtrar por rol.
> Quien sepa abrir la consola puede ver quién es cada "Rival". Si el anonimato
> tiene que ser real, esa consulta debe pasar por una función que filtre en el
> servidor.

## KPIs del representante (`activity_log`)

Cada asesor captura su día en el Home: **llamadas, citas, presencial, virtual y
apartados**. Una fila por persona y fecha (`unique (profile_id, fecha)`), y se
guarda con `upsert` en cuanto se toca el `+`.

Con eso se arma el **embudo**: llamadas → citas → charlas (presencial + virtual)
→ apartados → inscripciones, con el porcentaje que pasa de un peldaño al
siguiente y el cierre global ("de cada 100 llamadas, N terminan en
inscripción"). Las inscripciones **no** se capturan a mano: salen de
`enrollments` validadas en el mismo rango de fechas, para que el embudo compare
peras con peras.

Pestañas: Hoy (editable, con navegación a días pasados), Semana, Mes e
Histórico.

**Embudo del equipo** (`embudoEquipoHTML`, sólo para líderes): vive en la
pestaña **Equipo → Métricas**. Es el mismo embudo sumado sobre `getMyTeam()`,
más la lista de **quién registró y quién no**, con los que faltan hasta arriba.

Los pendientes de aprobación quedan **fuera** de las sub-pestañas, arriba de
todo: son trabajo por hacer con alguien esperando del otro lado, no una vista
que se pueda esconder detrás de una pestaña. Esa lista es el punto: un dato que sólo el asesor
captura y sólo él ve se abandona en dos semanas. Lo que sostiene la captura es
que su líder la vea y pregunte en la junta.

La lectura del equipo la permite la política `activity_select_own_or_team`
(`is_in_my_hierarchy`), así que cada líder alcanza sólo a su gente.

> `loadActv()` carga **12 meses**, no sólo el mes en curso. Antes cargaba desde
> el día 1 del mes actual, así que al cambiar de mes toda la captura anterior
> desaparecía de la pantalla y la gente reportaba que "no se guardaba" — sí se
> guardaba, sólo no se volvía a leer.

## Acceso: bloqueo por inactividad

`profiles.last_seen_at` se sella al entrar, y también por trigger cuando se
registra una inscripción a nombre de esa persona — así no se castiga a quien
vende aunque sea su líder quien captura.

Con **60 días** sin señal (`DIAS_INACTIVIDAD` en el `index.html`) se le cierra
el acceso al entrar. **La persona no se borra**: sigue contando en rankings,
cierres e históricos. Sólo deja de poder entrar.

Para reactivar a alguien, en Supabase:

```sql
update profiles set last_seen_at = now(), auto_deactivated = false
where nombre = 'NOMBRE EXACTO';
```

La revisión vive en el navegador, como la regla de representantes que ya
existía. Sirve para sacar a quien ya no está en la empresa, no como barrera
de seguridad: alguien con conocimientos técnicos podría saltársela hablando
directo con Supabase. Lo que sí quedó cerrado con llave son los datos (abajo).

## Qué puede escribir un usuario en su propio perfil

`profiles` tenía `UPDATE` abierto en **todas** sus columnas para `anon` y
`authenticated`. Con la política `profiles_update_own` eso permitía que
cualquiera, desde la consola del navegador, se pusiera `base_total_ej = 999`
(subir en el ranking y auto-otorgarse insignias), `role = 'general'` (ver toda
la red) o `manual_block = false`. RLS no limita columnas: eso se hace con
`GRANT` por columna, y ya está puesto.

Sólo estas once son escribibles, que son justo las que la app usa:

    bio, fecha_nacimiento, instagram, tiktok, facebook, threads, foto_url,
    username, auth_user_id, auto_deactivated, last_seen_at

**Si algún día la app necesita escribir otra columna, hay que otorgarla
explícitamente** o la escritura falla en silencio.

## Frase del día

`FRASES` en el `index.html`, en cinco familias con su propio color y etiqueta:

| Familia | Etiqueta | Ejemplos |
|---|---|---|
| `ventas` | Frase del día | Ziglar, Rohn, Tracy, Cardone, Sinek, Carnegie |
| `autoayuda` | Frase del día | Robbins, Covey, Hill, Maxwell, Angelou, Ford |
| `estoicos` | De los estoicos | Marco Aurelio, Séneca, Epicteto |
| `literatura` | De la literatura | Shakespeare, Milton, Kipling, Tennyson, Shaw |
| `biblia` | Versículo del día | Reina-Valera 1960 |

Rota **por fecha, no al azar**: la misma para toda la red cada día, para que se
vuelva tema de conversación. `FRASES_ORDEN` recorre las familias **en ronda**
(ventas → autoayuda → estoicos → literatura → versículo → …), así que dos días
seguidos nunca caen del mismo tipo. Al agregar frases el reparto se reacomoda
solo y el ciclo se alarga.

Para agregar una, basta con un renglón más en `FRASES` con su `k`. **Verifica la
atribución antes**: circulan muchas citas famosas mal atribuidas — por ejemplo
"la suerte es lo que pasa cuando la preparación se encuentra con la oportunidad"
se le cuelga a Séneca y no es suya. Cuando una cita venga de una obra, se anota
(`Marco Aurelio · Meditaciones`).

## Cómo se publica (no se sube nada a mano)

Netlify está conectado a este repo. No hay build: sirve los archivos tal cual.

1. Los cambios se hacen en una rama y se hace push.
2. Al fusionar en `main`, Netlify despliega solo en ~1 minuto.

**Editar aquí + merge a `main` = actualización en vivo.**
Los pasos de la conexión inicial están en `DESPLIEGUE.md`.

## Cómo llega una versión nueva a la gente

No hay service worker y Netlify sirve el `index.html` con `no-cache`, así que
**quien cierra la app y la vuelve a abrir ya recibe la versión nueva**. No hay
que borrar cachés ni reinstalar nada.

El problema es quien nunca la cierra: en iPhone, la app instalada en la pantalla
de inicio queda suspendida días y sigue corriendo el código viejo. Para eso está
`arrancarVigilanciaDeVersion()`: compara el `last-modified` del `index.html` en
el servidor contra el que había al cargar — cada 5 minutos y **al volver a la
app** — y si cambió muestra un aviso fijo con botón *Actualizar*.

No hay archivo de versión que recordar actualizar: la marca la pone Netlify sola
en cada deploy.

> El aviso sólo aparece en dispositivos que ya cargaron una versión **que
> incluye este código**. La primera vez, quien tenga la app abierta desde antes
> tiene que cerrarla y reabrirla una vez. De ahí en adelante ya se avisa solo.

No se recarga automáticamente a propósito: alguien puede estar a media captura
de una inscripción o escribiendo en el muro, y una recarga sin avisar le borra
lo que llevaba.

## Convenciones

- Mensajes de commit en español, estilo `feat:`, `fix:`, `chore:`.
- No partir `index.html` en varios archivos: la app depende de que todo esté inline.
- `index.html` es enorme — buscar la sección con `grep -n` antes de tocarlo,
  no leerlo entero.
- Al tocar la interfaz, revisar que se vea bien **en los dos temas**: hay tokens
  que sólo existen en uno de los dos bloques `:root`.
