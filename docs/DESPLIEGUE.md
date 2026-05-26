# Despliegue del sistema NutriStore en Vercel

**Proyecto de tesis:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Aplicación:** `suplementos-app` (React + Vite + Supabase)  
**Plataforma de despliegue:** [Vercel](https://vercel.com)  
**Fecha de referencia:** Mayo 2026

---

## 1. Objetivo del despliegue

El despliegue tiene como finalidad **publicar el prototipo funcional** del sistema NutriStore en una URL accesible desde Internet, de modo que:

- El jurado y evaluadores puedan **demostrar la aplicación en vivo** durante la defensa de tesis.
- Se valide el comportamiento en **entorno de producción** (build optimizado, variables de entorno, enrutamiento SPA).
- Se integre el frontend desplegado con el backend **Supabase** (Auth, PostgreSQL, RLS) de forma segura, sin exponer claves privadas en el repositorio.

El despliegue constituye la **evidencia de operacionalización** del software desarrollado, complementaria a las pruebas automatizadas, el análisis estático y la documentación de calidad.

---

## 2. Plataforma utilizada

| Elemento | Tecnología |
| -------- | ---------- |
| **Hosting frontend** | Vercel (CDN global, HTTPS automático, despliegues desde Git) |
| **Build** | Vite 8 → carpeta `dist/` |
| **Framework UI** | React 19 + React Router 7 (SPA) |
| **Backend** | Supabase Cloud (Auth, PostgreSQL, RLS) |
| **Control de versiones** | GitHub (repositorio conectado a Vercel) |

Vercel fue seleccionada por su **compatibilidad nativa con Vite**, despliegue continuo y configuración sencilla de variables de entorno para proyectos académicos.

---

## 3. Pasos realizados para preparar el despliegue

1. **Verificación del build local** con `npm run build` (salida en `dist/`).
2. **Configuración de `vercel.json`** en la raíz del proyecto:
   - `buildCommand`: `npm run build`
   - `outputDirectory`: `dist`
   - `rewrites` para React Router (evitar 404 al recargar rutas como `/catalogo` o `/admin`).
3. **Plantilla de variables** en `.env.example` (sin secretos reales).
4. **Exclusión de `.env`** en `.gitignore` para no subir credenciales a GitHub.
5. **Documentación** en `README.md` y este archivo (`docs/DESPLIEGUE.md`).
6. **Pipeline de calidad** previo: `npm run quality` (lint + cobertura + build).

---

## 4. Configuración de variables de entorno

Las variables deben configurarse en **dos lugares**: Vercel (frontend) y Supabase (Auth URLs).

### 4.1 En Vercel

Ruta: **Project → Settings → Environment Variables**

| Variable | Descripción | Entornos |
| -------- | ----------- | -------- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (Settings → API → Project URL) | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Clave pública **anon** (Settings → API → anon public) | Production, Preview |

**Importante:**

- Solo usar la clave **anon public**. Nunca la `service_role` en el frontend.
- No incluir claves reales en el repositorio ni en esta documentación.
- Tras añadir variables, **redeploy** el proyecto para que Vite las incorpore en el build.

### 4.2 Valores de ejemplo (placeholders)

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ejemplo
```

Copiar los valores reales desde el panel de Supabase al configurar Vercel.

---

## 5. Pruebas antes del despliegue

Ejecutar en la raíz del proyecto (`suplementos-app/`):

```powershell
npm.cmd run lint
npm.cmd run test:coverage
npm.cmd run build
```

O el pipeline integrado:

```powershell
npm.cmd run quality
```

| Verificación | Comando | Resultado esperado |
| ------------ | ------- | ------------------- |
| Lint | `npm run lint` | 0 errores, 0 advertencias |
| Pruebas + cobertura | `npm run test:coverage` | 196 pruebas OK, cobertura > 70% líneas |
| Build | `npm run build` | Carpeta `dist/` generada sin errores |
| Análisis Sonar | `npm run sonar` | Quality Gate evaluado (requiere SonarScanner + token local) |

---

## 6. Prueba de build

### 6.1 Comando

```powershell
npm.cmd run build
```

### 6.2 Configuración en Vite (`vite.config.js`)

```javascript
build: {
  outDir: 'dist',
  sourcemap: false,
}
```

### 6.3 Salida esperada

```
✓ built in ~1s
dist/index.html
dist/assets/index-*.css
dist/assets/index-*.js
```

### 6.4 Vista previa local (simula producción)

```powershell
npm.cmd run preview
```

Abrir `http://localhost:4173` y probar navegación entre rutas.

---

## 7. Configuración en Vercel (`vercel.json`)

Archivo en la raíz del repositorio:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/((?!assets/|.*\\..*).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Propósito del rewrite:** React Router gestiona las rutas en el cliente. Al recargar `/catalogo` o `/admin`, el servidor debe devolver `index.html` en lugar de un 404. Los archivos estáticos (`/assets/*.js`, `/assets/*.css`) quedan excluidos del rewrite.

---

## 8. Configuración de Supabase — URL Configuration

Tras obtener la URL pública de Vercel (p. ej. `https://nutristore-app.vercel.app`):

Supabase → **Authentication** → **URL Configuration**

| Campo | Valor |
| ----- | ----- |
| **Site URL** | `https://tu-proyecto.vercel.app` |
| **Redirect URLs** | `https://tu-proyecto.vercel.app/**` |

Si usas despliegues de preview por rama, añade también:

```
https://*-tu-usuario.vercel.app/**
```

Sin esta configuración, el login y la confirmación de correo pueden fallar en producción aunque el build sea correcto.

---

## 9. Procedimiento de despliegue (paso a paso)

### Paso 1 — Subir el proyecto a GitHub

1. Crear repositorio en GitHub (p. ej. `nutristore-app`).
2. Inicializar git, commit y push (sin incluir `.env`):

```powershell
git init
git add .
git commit -m "NutriStore: preparación para despliegue Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

### Paso 2 — Importar proyecto en Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Importar el repositorio de GitHub.
3. Verificar configuración detectada:

| Campo | Valor |
| ----- | ----- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Paso 3 — Configurar variables de entorno

Añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Production (y Preview si aplica).

### Paso 4 — Ejecutar deploy

Clic en **Deploy** o push a `main`. Vercel ejecutará `npm install` → `npm run build` → publicación de `dist/`.

### Paso 5 — Obtener URL pública

Al finalizar el deploy, Vercel muestra la URL, por ejemplo:

- `https://nutristore-app.vercel.app`
- `https://nutristore-app-usuario.vercel.app`

### Paso 6 — Validación post-despliegue

1. Abrir la URL pública.
2. Navegar a `/`, `/login`, `/registro`, `/mockups`.
3. Iniciar sesión con usuario de prueba (si existe en Supabase).
4. **Recargar** en `/catalogo` y `/admin`: no debe aparecer error 404.
5. Probar chatbot y panel vendedor según rol.

---

## 10. Evidencia esperada

Para la tesis, se recomienda conservar:

| Evidencia | Descripción |
| --------- | ----------- |
| Captura del dashboard Vercel | Deploy exitoso (verde) |
| URL pública | Enlace funcional en memoria/anexo |
| Captura de variables configuradas | Vercel Settings (valores ocultos) |
| Captura Supabase URL Configuration | Site URL y Redirect URLs |
| Log de build local | Salida de `npm run build` |
| Captura de rutas en producción | Home, login, catálogo recargado |
| Checklist de calidad | Sección 11 de este documento |

---

## 11. Checklist final de calidad y despliegue

Marcar cada ítem antes de considerar el proyecto listo para defensa:

- [ ] **Lint aprobado** — `npm run lint` sin errores ni advertencias
- [ ] **Test coverage aprobado** — `npm run test:coverage` con 196 pruebas OK y cobertura > 70% líneas
- [ ] **Build aprobado** — `npm run build` genera `dist/` sin errores
- [ ] **Sonar aprobado** — `npm run sonar` con Quality Gate Passed (token `SONAR_TOKEN` solo en entorno local/CI, no en repo)
- [ ] **Despliegue aprobado** — URL pública Vercel operativa, rutas SPA sin 404 al recargar, login Supabase funcional

**Estado de referencia (Mayo 2026, entorno local):**

| Ítem | Estado |
| ---- | ------ |
| Lint | Aprobado |
| Test coverage | Aprobado (~76,6% líneas) |
| Build | Aprobado |
| Sonar | Pendiente de ejecutar en SonarCloud con token local |
| Despliegue Vercel | Pendiente hasta push a GitHub e importación |

---

## 12. Solución de problemas

| Problema | Posible causa | Solución |
| -------- | ------------- | -------- |
| 404 al recargar ruta | Falta rewrite SPA | Verificar `vercel.json` y redeploy |
| Pantalla en blanco | Variables `VITE_*` ausentes | Configurar en Vercel y redeploy |
| Login falla en producción | URLs no registradas en Supabase | Actualizar Site URL y Redirect URLs |
| Build falla en Vercel | Error de compilación local | Ejecutar `npm run build` localmente y corregir |
| Supabase no conecta | Clave incorrecta o proyecto pausado | Revisar API keys y estado del proyecto |

---

## 13. Conclusión académica

El despliegue de NutriStore en Vercel cierra el ciclo de **ingeniería de software** iniciado con el análisis de requisitos, diseño, implementación y pruebas. La publicación en una URL pública demuestra que el prototipo es **operativo**, **accesible** y **reproducible**, cualidades exigidas en un proyecto de tesis de carácter aplicado.

La separación entre código fuente (GitHub), configuración sensible (variables en Vercel) y backend (Supabase) refleja **buenas prácticas de seguridad** alineadas con ISO/IEC 27001. La configuración de rewrites para React Router evidencia comprensión de las particularidades de las **SPA** en hosting estático.

En conjunto, el despliegue — junto con lint, cobertura, build y análisis Sonar — constituye la **evidencia integral** de que el sistema fue desarrollado y validado conforme a estándares profesionales, apto para demostración académica y evolución futura del producto.

---

## 14. Referencias internas

- [`README.md`](../README.md) — instalación y despliegue resumido
- [`docs/ESTANDARES_ISO.md`](ESTANDARES_ISO.md) — alineación normativa
- [`docs/SONAR_ANALISIS.md`](SONAR_ANALISIS.md) — análisis estático
- [`docs/REPORTE_PRUEBAS.md`](REPORTE_PRUEBAS.md) — pruebas automatizadas
- [Documentación Vercel — Vite](https://vercel.com/docs/frameworks/vite)
- [Supabase — Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
