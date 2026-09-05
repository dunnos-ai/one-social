# Ligas de reclamo — cómo mandarlas

152 personas tienen ventas en los cierres y nunca han creado cuenta. Esta es la
lista de sus ligas personales, agrupada por quién debe mandarlas.

## Sacar la lista

Pégala en Supabase → **SQL Editor** y usa **Download CSV**:

```sql
select
  coalesce(o.name,'(sin oficina)')      as oficina,
  coalesce(jefe.nombre,'(SIN LIDER)')   as quien_la_manda,
  p.nombre,
  coalesce(p.base_total_ej,0)           as acumulado,
  'https://one-social.app/reclama.html?t='||ct.token as liga
from profiles p
join claim_tokens ct on ct.profile_id = p.id
left join offices o  on o.id = p.office_id
left join profiles jefe on jefe.id = coalesce(p.supervisor_id, p.gc_id, p.distrital_id)
where p.auth_user_id is null
  and coalesce(p.base_total_ej,0) > 0
order by 1, 2, 4 desc;
```

Cada liga es única y no se adivina. **No las publiques en un grupo**: cada quien
recibe la suya, porque muestra sus números.

## El mensaje

Uno por persona. Corto, y el gancho va antes de pedir nada:

> Oye {NOMBRE}, ya está tu perfil en ONE con todo tu historial —
> llevas {ACUMULADO} inscripciones contadas y tienes insignias esperándote.
> Ábrelo y recoge tu cuenta: {LIGA}

## Medir si funcionó

Corre esto a los pocos días. Es el único número que importa esta semana:

```sql
select count(*) filter (where auth_user_id is not null) as con_cuenta,
       count(*)                                        as total,
       round(100.0*count(*) filter (where auth_user_id is not null)/count(*)) as pct
from profiles
where coalesce(base_total_ej,0) > 0;
```

Hoy va en **108 de 260 (42%)**. Si la liga sirve, ese número sube solo.

## Detalles que salieron al armar la lista

- **12 personas de Cabo San Lucas y algunas más no tienen líder asignado**
  (`supervisor_id`, `gc_id` y `distrital_id` vacíos). Aparecen como `(SIN LIDER)`:
  a esas hay que mandarles la liga desde la oficina, o asignarles líder primero.
- **DULCE GOMEZ está duplicada**: un perfil en Cd. Obregón con 8 acumuladas y otro
  en Juárez Plutarco con 1. Si es la misma persona, sus ventas están partidas y
  hay que fusionarlas antes de mandarle liga — si no, recibirá dos.

## Cómo revertirlo

Si algún día quieres quitar todo esto, es aditivo y sale limpio:

```sql
drop function if exists public.reclamo_por_token(uuid);
drop table if exists public.claim_tokens;
```

Y borrar `reclama.html` junto con el bloque `#reclamar=` del `index.html`.
