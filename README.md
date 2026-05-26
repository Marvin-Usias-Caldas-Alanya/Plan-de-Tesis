# NutriStore — Sistema Híbrido IA + Handoff Humano
Proyecto integrado con SonarCloud para análisis de calidad de código.
Aplicación web para el proyecto de tesis:

**Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales**

## Stack

- React 19 + Vite
- JavaScript
- React Router DOM
- Supabase (auth, base de datos, roles)
- Vitest + React Testing Library
- ESLint + Prettier

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [npm](https://www.npmjs.com/) (incluido con Node)
- Cuenta y proyecto en [Supabase](https://supabase.com)

## Configuración de variables de entorno

Las credenciales **no** van en el código fuente. Vite las lee desde un archivo `.env` local en la raíz de `suplementos-app`.

### 1. Obtener URL y clave en Supabase

1. Entra a [supabase.com](https://supabase.com) y abre tu proyecto.
2. Ve a **Project Settings** → **API**.
3. Copia:
   - **Project URL** → será `VITE_SUPABASE_URL`
   - **anon public** (clave pública) → será `VITE_SUPABASE_ANON_KEY`

> Usa solo la clave **anon public**. No subas la `service_role` al frontend ni al repositorio.

### 2. Crear el archivo `.env` local

En la raíz del proyecto (`suplementos-app/`), copia la plantilla:

**Windows (PowerShell):**

```powershell
cd "d:\PLAN DE TESIS\suplementos-app"
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cd suplementos-app
cp .env.example .env
```

### 3. Editar `.env` con tus valores reales

Abre `.env` y reemplaza los placeholders:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El archivo `.env` está en `.gitignore` y **no debe subirse a Git**. Solo `.env.example` (sin secretos) se versiona.

### 4. Reiniciar el servidor de desarrollo

Vite carga las variables al iniciar. Si cambias `.env`, detén el servidor (`Ctrl+C`) y vuelve a ejecutar:

```bash
npm run dev
```

### Comportamiento sin `.env`

Si faltan variables, la aplicación **sigue arrancando** en desarrollo y verás una advertencia en la consola del navegador. Login, catálogo y chat no funcionarán contra Supabase hasta que configures `.env` correctamente.

Puedes comprobar el estado en código con:

```js
import {
  isSupabaseConfigured,
  getSupabaseConfigMessage,
} from './services/supabaseClient';
```

## Instalación y ejecución

```bash
cd suplementos-app
npm install
# Crea y completa .env (ver sección anterior)
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

### Build de producción

```bash
npm run build
npm run preview
```

En producción conviene tener siempre `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` definidas; si faltan, se registrará un error en consola.

## Scripts disponibles

| Script                  | Descripción                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Servidor de desarrollo                   |
| `npm run build`         | Build de producción                      |
| `npm run preview`       | Vista previa del build                   |
| `npm run test`          | Ejecutar pruebas (Vitest)                |
| `npm run test:watch`    | Pruebas en modo observación              |
| `npm run test:coverage` | Pruebas con cobertura                    |
| `npm run lint`          | ESLint (React, hooks, sin advertencias)  |
| `npm run lint:fix`      | ESLint con corrección automática         |
| `npm run format`        | Formatear con Prettier                   |
| `npm run format:check`  | Verificar formato sin modificar archivos |
| `npm run sonar`         | Análisis SonarQube/SonarCloud            |
| `npm run quality`       | Lint + cobertura + build                 |

Evidencia de código limpio: [`docs/CODIGO_LIMPIO.md`](docs/CODIGO_LIMPIO.md).  
Reporte de pruebas (tesis): [`docs/REPORTE_PRUEBAS.md`](docs/REPORTE_PRUEBAS.md).  
Despliegue en producción: [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).

## Cliente Supabase

El cliente se define en `src/services/supabaseClient.js` y se exporta como:

```js
import { supabase } from './services/supabaseClient';
```

Los demás servicios (`authService`, `productService`, `chatbotService`) importan ese cliente; no dupliques `createClient` en otros archivos.

## Base de datos en Supabase

1. En el **SQL Editor**, ejecuta **`supabase/schema.sql`** (exactamente **50 tablas**).
   - Documentación: `supabase/DATABASE-THESIS.md`
2. Usuarios de prueba creados por el script:

   | Rol      | Email                      | Contraseña        |
   | -------- | -------------------------- | ----------------- |
   | Admin    | `admin@nutristore.test`    | `NutriStore2025!` |
   | Vendedor | `vendedor@nutristore.test` | `NutriStore2025!` |

3. El script también inserta productos, una conversación de ejemplo y borradores de redes sociales.
4. Los registros nuevos desde la app reciben rol `customer` automáticamente (trigger).

## Integración con las 50 tablas de Supabase

| Módulo | Tablas usadas en frontend |
|--------|---------------------------|
| Auth | `profiles`, `roles`, `customers` |
| Catálogo / Admin | `products`, `product_categories`, `product_images` |
| Chatbot + Handoff | `conversations`, `messages`, `handoff_requests`, `seller_assignments`, `chatbot_rules`, `chatbot_intents` |
| Pedidos | `orders`, `order_details`, `order_statuses` |
| Redes sociales | `social_posts`, `social_platforms`, `social_campaigns`, `ai_generated_contents` |
| Sistema | `system_settings`, `notifications` |

Las demás tablas del esquema (inventario, cupones, tickets, etc.) quedan modeladas en BD para escalabilidad de la tesis; el panel admin puede ampliarse sin romper la arquitectura por capas.

## Estructura del proyecto

```
src/
  components/   # UI modular (common, auth, products, chatbot, dashboard)
  pages/        # Vistas por ruta
  services/     # Supabase: auth, products, chatbot, orders, social, settings…
  hooks/        # useAuth, useProducts, useOrders, useChatbotRules…
  routes/       # Router, rutas protegidas y por rol
  utils/        # Constantes y validadores
  tests/        # Pruebas unitarias
  styles/       # CSS global y tokens
```

## Rutas de la aplicación

| Ruta        | Descripción                         |
| ----------- | ----------------------------------- |
| `/`         | Inicio                              |
| `/login`    | Inicio de sesión                    |
| `/registro` | Registro                            |
| `/catalogo` | Catálogo                            |
| `/admin`    | Panel admin: productos, pedidos, redes, chatbot, config |
| `/vendedor` | Panel vendedor: conversaciones y pedidos (`seller`/`admin`) |
| `/mockups`  | Galería de mockups (evidencia de diseño, sin auth)          |

## Verificación antes del despliegue

Ejecuta esta secuencia en la raíz de `suplementos-app` y confirma que todo termina sin errores:

```powershell
npm.cmd run lint
npm.cmd run test:coverage
npm.cmd run build
```

O en un solo comando:

```powershell
npm.cmd run quality
```

| Comando                  | Qué valida                                      |
| ------------------------ | ----------------------------------------------- |
| `npm run lint`           | Calidad y reglas ESLint (React, hooks)          |
| `npm run test:coverage`  | 196 pruebas + cobertura (> 70% líneas)          |
| `npm run build`          | Compilación de producción en carpeta `dist/`    |
| `npm run sonar`          | Análisis estático Sonar (token solo en entorno) |

Documentación completa: [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).

---

## Despliegue en Vercel

El proyecto está preparado para publicarse como **SPA** (Single Page Application) con Vite. El archivo `vercel.json` en la raíz configura el build y **rewrites** hacia `index.html` para evitar **error 404** al recargar rutas como `/catalogo`, `/login` o `/admin`.

### Requisitos

- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com)
- Proyecto Supabase configurado (`supabase/schema.sql` ejecutado)
- Variables de entorno listas (ver `.env.example`)

### Paso 1 — Subir el proyecto a GitHub

1. Crea un repositorio nuevo en GitHub (por ejemplo `nutristore-app`).
2. En la carpeta `suplementos-app`, inicializa git si aún no lo hiciste:

```bash
cd suplementos-app
git init
git add .
git commit -m "NutriStore: sistema híbrido IA + handoff humano"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

> No subas el archivo `.env` (contiene secretos). Solo se versiona `.env.example`.

### Paso 2 — Importar en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Importa el repositorio de GitHub.
3. Vercel detectará **Vite** automáticamente. Verifica:

| Campo               | Valor              |
| ------------------- | ------------------ |
| Framework Preset    | Vite               |
| **Build Command**   | `npm run build`    |
| **Output Directory**| `dist`             |
| Install Command     | `npm install`      |

Estos valores están definidos en `vercel.json` y en `vite.config.js` (`outDir: 'dist'`).

### Paso 3 — Configurar variables de entorno

En el proyecto de Vercel: **Settings** → **Environment Variables**. Añade para **Production** (y **Preview** si quieres ramas de prueba):

| Variable                 | Descripción                              | Ejemplo                           |
| ------------------------ | ---------------------------------------- | --------------------------------- |
| `VITE_SUPABASE_URL`      | URL del proyecto Supabase                | `https://xxxxx.supabase.co`       |
| `VITE_SUPABASE_ANON_KEY` | Clave pública **anon** (no service_role) | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

Copia los valores desde Supabase → **Project Settings** → **API**.

### Paso 4 — Configurar Supabase para producción

En Supabase → **Authentication** → **URL Configuration**:

| Campo             | Valor                               |
| ----------------- | ----------------------------------- |
| **Site URL**      | `https://tu-proyecto.vercel.app`    |
| **Redirect URLs** | `https://tu-proyecto.vercel.app/**` |

Añade también la URL de preview de Vercel si usas despliegues de ramas (`https://*-tu-usuario.vercel.app/**`).

### Paso 5 — Ejecutar el despliegue

1. Haz clic en **Deploy** (o push a `main` si conectaste Git).
2. Vercel ejecutará `npm install` y `npm run build`.
3. Si el build es exitoso, obtendrás una **URL pública**, por ejemplo:
   - `https://nutristore-app.vercel.app`
   - o `https://nutristore-app-tu-usuario.vercel.app`

### Paso 6 — Comprobar la aplicación en producción

1. Abre la URL pública.
2. Prueba navegación: `/`, `/login`, `/registro`, `/catalogo` (con sesión).
3. **Recarga** la página en `/catalogo` y `/admin`: no debe aparecer 404 de Vercel.
4. Inicia sesión con usuarios de prueba (si existen en tu Supabase).

### Despliegue local del build (opcional)

```bash
npm run build
npm run preview
```

Abre `http://localhost:4173` para simular producción en local.

### Solución de problemas

| Problema                        | Posible solución                                                |
| ------------------------------- | --------------------------------------------------------------- |
| 404 al recargar una ruta        | Confirma que `vercel.json` está en la raíz y vuelve a desplegar |
| Login no funciona en producción | Revisa variables `VITE_*` y URLs en Supabase Auth               |
| Build falla en Vercel           | Ejecuta `npm run build` localmente y corrige errores            |
| Pantalla en blanco              | Abre consola del navegador; verifica claves Supabase            |

### Checklist final (tesis)

- [ ] **Lint aprobado** — `npm run lint`
- [ ] **Test coverage aprobado** — `npm run test:coverage`
- [ ] **Build aprobado** — `npm run build`
- [ ] **Sonar aprobado** — `npm run sonar` (token `SONAR_TOKEN` solo local/CI)
- [ ] **Despliegue aprobado** — URL Vercel operativa, rutas sin 404, login Supabase OK

Detalle académico: [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md).

---

## Próximos pasos sugeridos

- Edge Function `chat-ai` para respuestas de IA reales
- Módulo de redes sociales (publicaciones, métricas)
- Políticas RLS refinadas por rol
