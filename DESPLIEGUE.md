# Conectar ONE a GitHub y Netlify

Esto se hace **una sola vez**. Después de esto, ya no vuelves a subir archivos
a mano: los cambios se piden por chat, se empujan al repo y Netlify publica solo.

## 1. Crear el repo en GitHub

1. Entra a <https://github.com/organizations/dunnos-ai/repositories/new>
2. Nombre: `one-social`
3. Visibilidad: **Private**
4. **No** marques "Add a README", ni `.gitignore`, ni licencia — el repo tiene
   que quedar vacío para que el primer push entre limpio.
5. *Create repository*.

Con eso basta. La subida de los archivos la hace Claude.

## 2. Conectar el sitio de Netlify al repo

En Netlify, en el sitio que ya sirve **one-social.app**:

1. *Site configuration* → *Build & deploy* → *Continuous deployment*
2. En "Build settings", botón **Link repository** (si el sitio se creó
   arrastrando archivos, ahí dirá que no hay repo conectado).
3. Elige **GitHub** → autoriza si te lo pide → selecciona `dunnos-ai/one-social`.
4. Configuración del build:
   - **Branch to deploy:** `main`
   - **Build command:** *(vacío)*
   - **Publish directory:** `.`

   Estos dos últimos ya vienen en `netlify.toml`, pero conviene verificar que
   la interfaz no los sobrescriba.
5. *Deploy site*.

> ⚠️ **Antes de dar Deploy**, asegúrate de que el repo ya tenga el `index.html`
> real de ONE. Si conectas el repo estando incompleto, el primer deploy
> reemplaza el sitio en vivo con lo que haya en el repo — y one-social.app se
> queda sin app.

## 3. Variables de entorno

Si ONE usa llaves (Supabase, Anthropic, etc.), van en:

*Site configuration* → *Environment variables*

Nunca en el código ni en el HTML — el navegador puede leer todo lo que está en
el HTML. Cuando agregues o cambies una variable hay que **redesplegar** para
que las funciones la tomen.

## 4. Comprobar que quedó

1. Pide un cambio chiquito por chat (por ejemplo, una coma en `insignias.html`).
2. Se hace push y se fusiona en `main`.
3. En Netlify, pestaña *Deploys*: debe aparecer un deploy nuevo, disparado por
   el commit, en ~1 minuto.
4. Abre one-social.app y verifica el cambio.

Si eso funciona, ya nunca más tienes que subir un archivo.

## De aquí en adelante

- **Tú:** dices qué quieres cambiar.
- **Claude:** edita, hace commit y push a una rama.
- **Tú:** entras a GitHub y das *Merge* (un clic).
- **Netlify:** publica solo.

Si prefieres saltarte el paso del merge, puedes autorizar que Claude empuje
directo a `main`. Se publica sin que toques nada, pero pierdes la revisión
previa.
