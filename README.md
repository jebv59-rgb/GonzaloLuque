# Willy Luque — Dashboard Comercial

Panel de una sola página (HTML + CSS + JS, sin frameworks ni build step) con mi
currículum, con **dos roles**:

- **Invitado** (cualquiera que entra al link): ve solo lo que está marcado como
  visible. Sin login, sin edición.
- **Admin** (vos): entrás con contraseña desde el botón *"🔒 Modo admin"*
  arriba a la derecha. Ahí podés editar cualquier texto haciendo clic sobre él,
  mostrar/ocultar cualquier tarjeta, fila o sección entera con el switch
  correspondiente, y agregar o borrar proyectos, experiencias, habilidades,
  estudios e idiomas.

**Vivo:** https://willyluque.github.io/ *(una vez publicado en GitHub Pages — ver abajo)*

## Estructura

```
.
├── index.html        # estructura de la página (vacía de contenido: todo sale de data.js)
├── css/style.css      # estilo — tema placeholder, ver nota de diseño abajo
├── js/data.js         # ⭐ toda la información del sitio, en un objeto editable
├── js/main.js         # motor de render + lógica de admin (login, edición, publicar)
└── README.md
```

No hay dependencias externas ni paso de build: es HTML/CSS/JS estático puro,
abrible incluso con doble clic desde tu computadora (siempre que **extraigas
todo el ZIP primero** — ver más abajo).

## Cómo funciona el modo admin (y sus límites)

Este sitio es 100% estático (no tiene servidor propio), así que el modo admin
funciona así:

1. Entrás con tu contraseña → se abre la edición.
2. Todo lo que cambiás (textos, qué se muestra y qué no, proyectos que agregás
   o borrás) se guarda automáticamente **solo en tu navegador** (en
   `localStorage`), como un borrador. Podés cerrar la pestaña y volver más
   tarde: tu borrador sigue ahí.
3. Mientras no hagas nada más, los **invitados no ven nada de esto** — ellos
   siempre ven la última versión publicada (`js/data.js` tal como está en
   GitHub).
4. Cuando estés conforme, apretá **"⬇ Publicar (descargar data.js)"**. Se
   descarga un archivo `data.js` con todos tus cambios adentro. Reemplazá el
   `js/data.js` de tu repositorio por ese archivo y subí el cambio:
   ```bash
   git add js/data.js
   git commit -m "Actualizo datos del CV"
   git push
   ```
   A partir de ahí, todos los invitados ven la versión nueva.

Es decir: **"Publicar" no sube nada solo** — te da el archivo listo, y subirlo
a GitHub es un paso manual tuyo (2 comandos, o arrastrando el archivo en la web
de GitHub). Elegiste este modelo (sin servicios externos ni cuentas de
terceros) en vez de un backend con cambios instantáneos para todos — si en
algún momento preferís eso, se puede migrar a Firebase/Supabase más adelante.

### Sobre la contraseña — importante

`ADMIN_PASSWORD` está en `js/main.js` (buscá `willy2026`), en texto plano.
**Esto no es seguridad real**: es un sitio estático público en GitHub, así que
cualquiera que abra el código fuente puede leer la contraseña. Sirve para que
un visitante casual no toque nada por accidente — no para proteger
información sensible. **Cambiala** antes de publicar, y no cargues en este
sitio nada que necesite protección de verdad (ver también la nota de
privacidad más abajo).

## Cómo publicarlo en GitHub Pages

**Opción A — repo personal `usuario.github.io` (recomendado):**

1. Creá en GitHub un repositorio que se llame exactamente `TU-USUARIO.github.io`.
2. Subí estos archivos a la rama `main`:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/TU-USUARIO.github.io.git
   git branch -M main
   git push -u origin main
   ```
3. En unos minutos el sitio queda publicado en `https://TU-USUARIO.github.io/`.

**Opción B — como proyecto dentro de otro repo:**

1. Subí esta carpeta a cualquier repositorio.
2. Andá a *Settings → Pages* y elegí la rama y carpeta donde está `index.html`.
3. GitHub te da la URL (`https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`).

## Antes de publicar — revisar

- [ ] Cambiar `ADMIN_PASSWORD` en `js/main.js` por una contraseña propia.
- [ ] Reemplazar `willyluque` por tu usuario real de GitHub en `js/data.js`
      (`contact.github.url`) si es distinto.
- [ ] Confirmar que el email de contacto (`jebv59@gmail.com`) es el que
      querés mostrar públicamente.
- [ ] **Nunca cargues** desde el modo admin datos que no quieras públicos:
      DNI, dirección, teléfono personal, fecha de nacimiento, estado civil,
      pretensión salarial, o datos de terceros — es un sitio público, todo lo
      que publiques (lo marcado como visible) lo puede ver cualquiera.

## Nota de diseño

El tema visual (navy + celeste, cards blancas con barra de color arriba,
pastillas de estado, fondo gris-celeste) está calcado del estilo real de
los dashboards HTML de Willy (RIMSA/Arcor: Desempeño, Tarea, Fiado,
Materiales, Precios). Ningún dato real ni confidencial de esos dashboards
(clientes, saldos, productos, precios) fue copiado — solo se tomó la
paleta de colores, la tipografía y la estructura visual de tarjetas y
navegación.

## Notas de privacidad

A propósito **no incluí** datos personales sensibles que estaban cargados en
tu perfil de Working360: DNI, dirección particular, teléfono personal, fecha
de nacimiento, estado civil, cantidad de hijos, ni la pretensión salarial.
Tampoco incluí los contactos de referencia de tus ex-supervisores (son datos
de terceros). Como ahora vos mismo podés cargar lo que quieras desde el modo
admin, quedó documentado acá qué se dejó afuera a propósito y por qué — la
decisión de agregarlo o no es tuya.
