# Cómo colaborar en la tienda astroly

Dos personas, cada una con su propia IA. GitHub guarda la versión compartida; `main` es la versión revisada y
**publicada** (Vercel publica cada cambio de `main` en https://astrolytienda.vercel.app). Cada tarea vive en una rama
corta y entra a `main` con un Pull Request (PR).

## Preparación (una vez)

1. El propietario invita al socio a la organización o al repositorio con su propia cuenta. No compartan credenciales.
2. Si el plan lo permite, protejan `main`: exigir PR y una aprobación, sin force push ni borrado.
3. Si no se puede proteger, mantengan la regla como acuerdo: nada directo a `main` y un merge a la vez.

## Clon propio

```powershell
git clone <url del repositorio>
cd Astroly-Ventas
```

No compartan carpeta de trabajo ni la sincronicen por OneDrive o Drive.

## Empezar cada tarea

1. Abran un Issue con la plantilla "Tarea" (resultado, responsable, archivos, límites, criterios).
2. Desde la raíz del clon, con el árbol limpio:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c claude/nombre-de-la-tarea   # el socio usa colab/nombre-de-la-tarea
```

3. Lean `AGENTS.md`, `CONTEXTO.md`, `DESIGN.md` y `PRODUCT.md`.

## Ver la tienda en local

```powershell
node server.mjs
```

Abre http://127.0.0.1:4180. No hay build ni dependencias que instalar. Si los dos usan el mismo equipo, cada clon
necesita su propio puerto (cambien el número al final de `server.mjs` solo en local, sin subirlo).

## Validar

- Código: `git diff --check` y `node --check assets/js/<archivo>.js` en los módulos que tocaron.
- Interfaz: revisar en navegador escritorio (1440×900) y celular (390×844), tema claro y oscuro: inicio, catálogo
  con filtros, búsqueda, ficha, carrito, cuenta, mascota y consola sin errores ni desbordes horizontales.
- Digan exactamente qué revisaron. Si falta algo, el PR queda en Draft.

## Entregar

```powershell
git add <archivos de la tarea>
git commit -m "Describe el cambio"
git fetch origin
git merge origin/main
git push -u origin claude/nombre-de-la-tarea
```

Antes de abrir el PR, actualicen `CONTEXTO.md` (registro de sesión y decisiones). Abran el PR hacia `main` con la
plantilla. Una persona decide el merge, y ese merge publica el sitio.

## Errores en main

Arreglen con una rama nueva o un PR de reversión. No borren historia con reset ni force push.
