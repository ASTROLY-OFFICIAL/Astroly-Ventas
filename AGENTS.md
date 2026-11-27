# Acuerdo de trabajo para personas e IA

Estas reglas valen para este repositorio y para todos sus colaboradores, personas o asistentes de IA
(Claude, Codex u otros). `CLAUDE.md` solo apunta aquí.

## Memoria compartida: CONTEXTO.md

Los chats con una IA se pierden; el repositorio no. `CONTEXTO.md` es la memoria del proyecto:

- **Al empezar** cualquier tarea, léelo completo junto con `DESIGN.md` y `PRODUCT.md`. Lo que diga ahí manda sobre
  suposiciones propias o sobre chats anteriores que no hayas visto.
- **Al terminar** cada tarea, en la misma rama y en el mismo PR:
  1. Agrega al inicio de "Registro de sesiones" una entrada con fecha, quién pidió, qué se cambió, qué se decidió y qué
     quedó pendiente. Máximo 6 líneas, sin copiar el chat.
  2. Si cambió una decisión vigente (paleta, mascota, estructura, textos, permisos), actualiza también
     "Decisiones vigentes" o "Pendientes". Una decisión nueva reemplaza a la anterior; no dejes las dos.
  3. Si el registro pasa de 15 entradas, resume las más antiguas en una sola línea dentro de "Historia resumida".
- No escribas en `CONTEXTO.md` datos privados (contraseñas, tokens, correos o teléfonos personales, datos de clientes).

## Antes de editar

1. Comprueba la carpeta (`git rev-parse --show-toplevel`), el estado (`git status --short --branch`) y el remoto.
2. Cada persona usa su propio clon. Cada tarea usa su propia rama desde `origin/main` actualizado.
   Prefijos: `claude/` para el asistente de Santiago y `colab/` para el del socio.
3. Revisa los Issues y PR abiertos que toquen las mismas páginas o archivos. Una petición directa del usuario ya asigna
   la tarea a su asistente; no exige otra confirmación.
4. No trabajes en `main`, en una rama ajena ni sobre cambios que no sabes de dónde vienen.

## Durante el trabajo

- La fuente compartida es GitHub. No reemplaces el repositorio con ZIP ni con copias de carpetas viejas
  (por ejemplo `C:\ASTROLY\TIENDA` puede estar desactualizada).
- Mantén las decisiones de `CONTEXTO.md` y `DESIGN.md` salvo que la tarea pida cambiarlas.
- Tareas que tocan reglas globales (tokens de `tienda.css`, `ui.js`, `mascota.js`, `store.js`) se hacen una a la vez.
- Sincroniza con `git fetch origin` y `git merge origin/main`. Sin force push, `reset --hard` ni `clean -fd`.
- En conflictos conserva ambas intenciones; si son incompatibles decide una persona.
- No inventes clientes, testimonios, cifras, garantías, reseñas ni precios reales. Los productos y precios de
  `data.js` son de ejemplo hasta que el socio cargue los reales.
- Las redes sociales (`CONFIG.socials`) son provisionales hasta que se confirmen.

## Entrega y permisos

- Valida según `CONTRIBUTING.md` y declara solo las comprobaciones que ejecutaste.
- Sube la rama de la tarea y abre su PR con la plantilla. Usa Draft si falta validación.
- **Cada merge a `main` se publica solo en https://astrolytienda.vercel.app (Vercel).** Por eso la integración a
  `main` requiere la decisión de una persona. Una IA no aprueba ni integra su propio trabajo sin que se lo pidan.
- Hosting, dominio, Shopify, pagos y visibilidad del repositorio solo cambian con autorización explícita del propietario.
