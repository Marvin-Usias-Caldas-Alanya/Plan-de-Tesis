# Documento final de evidencias — Calidad, estándares y despliegue

**Proyecto de tesis:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Sistema evaluado:** NutriStore — aplicación web (`suplementos-app`)  
**Stack:** React 19, Vite 8, JavaScript, Supabase, Vitest, ESLint, Prettier, SonarQube/SonarCloud, Vercel  
**Fecha de referencia:** Mayo 2026

---

## Introducción

El presente documento consolida las **evidencias verificables** del proceso de ingeniería de software aplicado al sistema NutriStore. Su finalidad es servir como **anexo integrador** de la memoria de tesis, reuniendo en un solo artefacto los resultados de pruebas automatizadas, prácticas de código limpio, análisis estático, alineación con normas ISO, diseño de interfaz (mockups) y despliegue en producción.

Cada evidencia se vincula con un **artefacto del repositorio**, un **comando reproducible** o una **captura sugerida** para la defensa oral y la evaluación escrita.

---

## 1. Evidencias de pruebas automatizadas

### 1.1 Comando de ejecución

```powershell
npm.cmd run test:coverage
```

Equivalente definido en `package.json`:

```json
"test:coverage": "vitest run --coverage"
```

### 1.2 Herramientas involucradas

| Herramienta | Función |
| ----------- | ------- |
| **Vitest 4** | Ejecución de pruebas unitarias, de componentes e integración |
| **React Testing Library** | Validación de UI orientada al usuario |
| **@vitest/coverage-v8** | Medición de cobertura con proveedor V8 |
| **jsdom** | Simulación de entorno de navegador |
| **supabaseMock.js** | Aislamiento de pruebas sin base de datos real |

**Configuración:** `vitest.config.js` — informes en `./coverage/`, incluido `coverage/lcov.info` para Sonar.

### 1.3 Resultados obtenidos (última corrida verificada)

| Métrica | Valor | Umbral del proyecto |
| ------- | ----- | ------------------- |
| **Archivos de prueba** | 36 | — |
| **Pruebas ejecutadas** | 196 | 196 aprobadas |
| **Statements** | **73,41%** | ≥ 60% |
| **Branches** | **61,99%** | ≥ 50% |
| **Functions** | **72,27%** | ≥ 60% |
| **Lines** | **76,63%** | ≥ 60% |

**Resumen de cobertura:**

```
Statements   : 73.41% ( 848/1155 )
Branches     : 61.99% ( 535/863 )
Functions    : 72.27% ( 232/321 )
Lines        : 76.63% ( 787/1027 )
```

### 1.4 Tipos de prueba implementados

| Tipo | Ubicación | Ejemplos |
| ---- | --------- | -------- |
| Unitarias | `src/tests/unit/` | `authService.test.js`, `chatbotService.test.js`, `validators.test.js` |
| Componentes | `src/tests/components/` | `ChatWidget.test.jsx`, `AdminProductsPanel.test.jsx` |
| Hooks | `src/tests/hooks/` | `useAuth.test.jsx`, `useChatbot.test.jsx` |
| Integración | `src/tests/integration/` | `servicesLayer.test.js` |
| Rutas | `src/tests/routes/` | `ProtectedRoute.test.jsx`, `RoleRoute.test.jsx` |

### 1.5 Capturas sugeridas

1. Terminal con salida de `npm.cmd run test:coverage` (196 passed + tabla de cobertura).
2. Informe HTML en `coverage/index.html` abierto en navegador.
3. Fragmento de `docs/REPORTE_PRUEBAS.md` con casos de prueba trazados.

**Documento de soporte:** [`docs/REPORTE_PRUEBAS.md`](REPORTE_PRUEBAS.md)

---

## 2. Evidencias de código limpio

### 2.1 ESLint

**Comando:**

```powershell
npm.cmd run lint
```

**Configuración:** `eslint.config.js` — reglas para JavaScript, JSX, React Hooks y React Refresh. Política: **`--max-warnings 0`** (cero advertencias toleradas).

**Resultado verificado:** ejecución sin errores ni advertencias.

**Evidencia adicional:** regla `no-console` para evitar logs de depuración en producción; solo `console.warn` / `console.error` permitidos en contextos controlados (`supabaseClient.js`).

### 2.2 Prettier

**Comandos:**

```powershell
npm.cmd run format
npm.cmd run format:check
```

**Configuración:** `.prettierrc` — formato uniforme en `src/`, `docs/` y archivos raíz.

**Integración:** `eslint-config-prettier` evita conflictos entre reglas de estilo y lint.

### 2.3 Arquitectura por capas

Organización documentada en [`docs/ARQUITECTURA.md`](ARQUITECTURA.md) y [`docs/CODIGO_LIMPIO.md`](CODIGO_LIMPIO.md):

```
src/
├── components/   # Presentación (UI)
├── hooks/        # Orquestación y estado
├── pages/        # Vistas por ruta
├── routes/       # Protección y roles
├── services/     # Supabase y lógica remota
├── utils/        # Funciones puras
└── tests/        # Evidencia de calidad
```

### 2.4 Capas y separación de responsabilidades

| Capa | Responsabilidad | Evidencia en código |
| ---- | --------------- | ------------------- |
| **services/** | Comunicación con Supabase, reglas de negocio persistente | `authService.js`, `productService.js`, `chatbotService.js`, `orderService.js` |
| **hooks/** | Estado, efectos, coordinación UI–servicios | `useAuth`, `useProducts`, `useChatbot`, `useSellerConversations` |
| **components/** | Renderizado y eventos de UI | `components/common/`, `components/chatbot/`, `components/admin/` |
| **utils/** | Validación y formateo sin efectos secundarios | `validators.js`, `authErrors.js`, `productStock.js` |
| **routes/** | Control de acceso | `ProtectedRoute.jsx`, `RoleRoute.jsx` |

**Principio de responsabilidad única:** el motor del chatbot (`chatbotEngine.js`) está separado de la persistencia (`chatbotService.js`) y de React.

**Inversión de dependencias en pruebas:** mocks de Supabase (`src/tests/helpers/supabaseMock.js`) permiten probar servicios sin red.

### 2.5 Pipeline integrado de calidad

```powershell
npm.cmd run quality
```

Ejecuta secuencialmente: `lint` → `test:coverage` → `build`.

**Documento de soporte:** [`docs/CODIGO_LIMPIO.md`](CODIGO_LIMPIO.md)

---

## 3. Evidencia Sonar (análisis estático)

### 3.1 Configuración del proyecto

| Archivo | Propósito |
| ------- | --------- |
| `sonar-project.properties` | Clave, fuentes, exclusiones, ruta LCOV |
| `coverage/lcov.info` | Cobertura importada desde Vitest |
| `docs/SONAR_ANALISIS.md` | Guía académica del análisis |

**Comando:**

```powershell
npm.cmd run quality
npm.cmd run sonar
```

**Requisito:** SonarScanner CLI instalado y variable de entorno `SONAR_TOKEN` (no incluida en el repositorio).

### 3.2 Métricas evaluadas por Sonar

| Dimensión Sonar | Qué mide | Evidencia en NutriStore |
| --------------- | -------- | ------------------------ |
| **Bugs** | Defectos probables en ejecución | Análisis semántico de `src/` (excl. tests y mocks) |
| **Vulnerabilities** | Riesgos de seguridad en código | Patrones inseguros, exposición de datos |
| **Code smells** | Deuda técnica y mantenibilidad | Complejidad, funciones largas, duplicación lógica |
| **Coverage** | Líneas cubiertas por pruebas | Importación de `coverage/lcov.info` (~76,6% líneas) |
| **Duplications** | Bloques de código repetido | Refactor hacia `utils/` y `components/common/` |
| **Quality Gate** | Umbral global Passed/Failed | Configurable en SonarCloud según política del proyecto |

### 3.3 Relación con otras herramientas

Sonar **complementa** ESLint y Prettier: mientras estos últimos controlan estilo y reglas sintácticas, Sonar aporta métricas históricas, deuda técnica estimada y evaluación de seguridad a nivel de proyecto.

### 3.4 Capturas sugeridas

1. Dashboard SonarCloud — pestaña **Overview** (Quality Gate).
2. Pestaña **Measures** — coverage, duplications, ratings A–E.
3. Pestaña **Issues** — bugs, vulnerabilities, code smells (si existen, documentar corrección o justificación).
4. Terminal con ejecución exitosa de `sonar-scanner`.

**Documento de soporte:** [`docs/SONAR_ANALISIS.md`](SONAR_ANALISIS.md)

---

## 4. Evidencia ISO (alineación normativa)

El sistema fue evaluado y documentado conforme a normas internacionales de calidad. La correspondencia detallada figura en [`docs/ESTANDARES_ISO.md`](ESTANDARES_ISO.md).

| Norma | Aplicación en NutriStore | Evidencia principal |
| ----- | ------------------------ | ------------------- |
| **ISO/IEC 25010** | Calidad del producto: funcionalidad, usabilidad, fiabilidad, seguridad, mantenibilidad, portabilidad | Módulos funcionales, pruebas, arquitectura, RLS |
| **ISO/IEC/IEEE 29119** | Proceso de pruebas: unitarias, componentes, integración, cobertura, casos, evidencia de ejecución | Vitest, RTL, `REPORTE_PRUEBAS.md`, `coverage/` |
| **ISO/IEC 27001** | Seguridad: autenticación, roles, control de acceso, RLS, variables de entorno | Supabase Auth, `ProtectedRoute`, `schema.sql`, `.env` |
| **ISO/IEC 12207** | Ciclo de vida: análisis, diseño, implementación, pruebas, despliegue, mantenimiento | `ARQUITECTURA.md`, migraciones, `DESPLIEGUE.md` |
| **ISO 9001** | Mejora continua: revisión, corrección, documentación, trazabilidad | `docs/`, pipeline `quality`, checklist |
| **ISO/IEC 25023** | Medición: cobertura, mantenibilidad, defectos, Sonar, build | Métricas numéricas de este documento |

**Nota metodológica:** se trata de **adaptación académica proporcional** de las normas; no implica certificación formal ISO de la organización.

---

## 5. Evidencia de mockups (diseño de interfaz)

### 5.1 Acceso a la galería

**Ruta:** `/mockups`  
**Implementación:** `src/pages/MockupsPage.jsx`  
**Documentación:** [`docs/MOCKUPS.md`](MOCKUPS.md)

Los mockups son **estáticos**, no dependen de Supabase, y permiten exportar capturas PNG o PDF para anexos.

### 5.2 Pantallas documentadas (relacionadas con la tesis)

| Pantalla | Componente | Requisito funcional |
| -------- | ---------- | ------------------- |
| **Login** | `LoginMockup.jsx` | RF-01 Autenticación |
| **Registro** | `RegisterMockup.jsx` | RF-01 Autenticación |
| **Home** | `HomeMockup.jsx` | RF-02 Navegación y propuesta de valor |
| **Catálogo** | `CatalogMockup.jsx` | RF-03 Gestión de productos |
| **Admin dashboard** | `AdminDashboardMockup.jsx` | RF-05 Panel administrativo |
| **Chatbot flotante** | `CatalogMockup.jsx` (widget) | RF-04 Chatbot híbrido |
| **Handoff humano** | `SellerPanelMockup.jsx` (variante) | RF-08 Handoff |
| **Publicaciones IA** | `SocialAIMockup.jsx` | RF-07 Redes sociales e IA |
| **Configuración chatbot** | `ChatbotConfigMockup.jsx` | RF-04 Chatbot híbrido |

### 5.3 Capturas sugeridas

1. Galería completa en `/mockups` (vista general).
2. PNG individual por pantalla (botón **Capturar PNG** en cada tarjeta).
3. PDF de la galería (botón **Imprimir / Exportar PDF**).
4. Comparación mockup vs. pantalla real en producción (misma funcionalidad).

---

## 6. Evidencia de despliegue

### 6.1 Build aprobado

**Comando:**

```powershell
npm.cmd run build
```

**Configuración Vite:** `outDir: 'dist'` en `vite.config.js`.

**Resultado verificado:** compilación exitosa; artefactos generados:

```
dist/index.html
dist/assets/index-*.css
dist/assets/index-*.js
```

### 6.2 Plataforma Vercel

| Elemento | Valor |
| -------- | ----- |
| **Plataforma** | [Vercel](https://vercel.com) |
| **Framework** | Vite (SPA) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Configuración** | `vercel.json` — rewrites SPA para React Router |

El archivo `vercel.json` evita **error 404** al recargar rutas como `/catalogo`, `/admin` o `/vendedor`.

### 6.3 Variables de entorno

Configuradas en **Vercel → Settings → Environment Variables** (valores reales solo en el panel, nunca en el repositorio):

| Variable | Descripción |
| -------- | ----------- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública **anon** (no `service_role`) |

Plantilla local: `.env.example` (placeholders sin secretos).

### 6.4 URL pública

Tras el deploy en Vercel, el sistema queda accesible en una URL del tipo:

```
https://tu-proyecto.vercel.app
```

**Evidencia:** captura del dashboard Vercel con deploy exitoso y enlace público funcional.

### 6.5 Configuración Supabase (Auth)

Supabase → **Authentication** → **URL Configuration**:

| Campo | Valor |
| ----- | ----- |
| **Site URL** | `https://tu-proyecto.vercel.app` |
| **Redirect URLs** | `https://tu-proyecto.vercel.app/**` |

Sin esta configuración, el login en producción puede fallar aunque el build sea correcto.

### 6.6 Validación post-despliegue

1. Navegar a `/`, `/login`, `/registro`, `/catalogo`.
2. Recargar página en rutas protegidas — sin 404.
3. Iniciar sesión con usuario de prueba en Supabase.
4. Verificar chatbot y panel vendedor según rol.

**Documento de soporte:** [`docs/DESPLIEGUE.md`](DESPLIEGUE.md)

---

## 7. Tabla final consolidada de evidencias

| Evidencia | Herramienta | Resultado obtenido | Captura sugerida | Relación con la tesis |
| --------- | ----------- | ------------------ | ---------------- | --------------------- |
| Pruebas automatizadas | Vitest + RTL | 196/196 OK | Terminal `test:coverage` | Valida funcionalidad del sistema híbrido IA + handoff |
| Cobertura Statements | @vitest/coverage-v8 | 73,41% | Tabla en consola / `coverage/index.html` | Demuestra exhaustividad de pruebas en código crítico |
| Cobertura Branches | @vitest/coverage-v8 | 61,99% | Informe HTML de cobertura | Evidencia de prueba de ramas condicionales |
| Cobertura Functions | @vitest/coverage-v8 | 72,27% | Informe HTML de cobertura | Funciones de servicios y hooks verificadas |
| Cobertura Lines | @vitest/coverage-v8 | 76,63% | `coverage/lcov.info` | Supera umbral del 70% para evidencia académica |
| Lint estático | ESLint | 0 errores, 0 warnings | Terminal `npm run lint` | Código limpio y consistente (ISO 25010 mantenibilidad) |
| Formato | Prettier | Formato uniforme | Diff o `format:check` | Legibilidad y estándares de equipo |
| Arquitectura por capas | Diseño + docs | services / hooks / components | Diagrama en `ARQUITECTURA.md` | Separación de responsabilidades profesional |
| Análisis Sonar — bugs | SonarCloud | Evaluado en dashboard | Captura pestaña Issues / Reliability | Fiabilidad del producto software |
| Análisis Sonar — vulnerabilities | SonarCloud | Evaluado en dashboard | Captura pestaña Security | Seguridad alineada ISO 27001 |
| Análisis Sonar — code smells | SonarCloud | Deuda técnica medida | Captura Maintainability | Mantenibilidad a largo plazo |
| Análisis Sonar — coverage | SonarCloud + LCOV | ~76,6% importado | Dashboard Sonar Measures | Correlación pruebas ↔ análisis estático |
| Análisis Sonar — duplications | SonarCloud | % duplicación reportado | Dashboard Duplications | Refactor y reutilización (DRY) |
| Quality Gate Sonar | SonarCloud | Passed / Failed | Overview SonarCloud | Criterio objetivo de aceptación de calidad |
| ISO/IEC 25010 | Documentación | 8 características mapeadas | Tabla en `ESTANDARES_ISO.md` | Calidad del producto software |
| ISO/IEC/IEEE 29119 | Vitest + docs | Proceso de prueba documentado | `REPORTE_PRUEBAS.md` | Rigurosidad en verificación y validación |
| ISO/IEC 27001 | Supabase + código | Auth, RLS, `.env` | Captura RLS + variables Vercel (ocultas) | Protección de datos y acceso |
| ISO/IEC 12207 | Repositorio + docs | Ciclo de vida completo | `ARQUITECTURA.md`, `DESPLIEGUE.md` | Proceso de ingeniería de software |
| ISO 9001 | Pipeline + docs | Mejora continua documentada | Checklist en `DESPLIEGUE.md` | Gestión de calidad del proyecto |
| ISO/IEC 25023 | Métricas cuantitativas | Cobertura, build, Sonar | Este documento | Medición objetiva de calidad |
| Mockup Login | MockupsPage | Diseño estático RF-01 | PNG `/mockups` #login | Usabilidad autenticación |
| Mockup Registro | MockupsPage | Diseño estático RF-01 | PNG `/mockups` #register | Onboarding de clientes |
| Mockup Home | MockupsPage | Landing NutriStore | PNG `/mockups` #home | Propuesta de valor del negocio |
| Mockup Catálogo | MockupsPage | Grid de suplementos | PNG `/mockups` #catalog | RF catálogo y ventas |
| Mockup Admin | MockupsPage | KPIs administrativos | PNG `/mockups` #admin | Gestión operativa del sistema |
| Mockup Chatbot | MockupsPage | Widget NutriBot | PNG `/mockups` #chatbot | Componente IA del sistema híbrido |
| Mockup Handoff | MockupsPage | Conversación humano | PNG `/mockups` #handoff | Objetivo central de la tesis |
| Mockup Publicaciones IA | MockupsPage | Generador redes sociales | PNG `/mockups` #social-ai | RF redes sociales |
| Mockup Config. chatbot | MockupsPage | Intenciones y reglas | PNG `/mockups` #chatbot-config | Configurabilidad del bot |
| Build producción | Vite | `dist/` generado OK | Terminal `npm run build` | Software desplegable |
| Despliegue Vercel | Vercel + GitHub | SPA publicada | Dashboard Vercel verde | Operacionalización del prototipo |
| Variables entorno | Vercel + Vite | `VITE_*` configuradas | Settings Vercel (valores ocultos) | Seguridad sin secretos en Git |
| URL pública | Vercel CDN | HTTPS activo | Navegador en URL `.vercel.app` | Demostración en vivo ante jurado |
| Supabase Auth URLs | Supabase | Site URL + Redirects | Captura panel Auth | Integración frontend–backend |

---

## 8. Checklist final de evidencias

Use este checklist al preparar anexos y la defensa:

- [ ] Captura de `npm.cmd run test:coverage` con métricas 73,41 / 61,99 / 72,27 / 76,63
- [ ] Captura de `npm.cmd run lint` sin advertencias
- [ ] Captura de `npm.cmd run build` exitoso
- [ ] Informe HTML de cobertura (`coverage/index.html`)
- [ ] Dashboard SonarCloud (bugs, vulnerabilities, smells, coverage, duplications, Quality Gate)
- [ ] Galería `/mockups` con capturas PNG de pantallas clave
- [ ] Dashboard Vercel con deploy exitoso
- [ ] URL pública funcionando (login + recarga de rutas)
- [ ] Supabase URL Configuration configurada
- [ ] Tabla de este documento incluida o referenciada en la memoria

---

## 9. Conclusión académica

El sistema web NutriStore, desarrollado como soporte tecnológico de la tesis *Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales*, ha sido sometido a un proceso integral de **aseguramiento de la calidad** cuyas evidencias quedan consolidadas en el presente documento.

Desde el plano de la **verificación funcional**, la ejecución de **196 pruebas automatizadas** con Vitest y React Testing Library, junto con una **cobertura de líneas del 76,63%**, demuestra que los módulos críticos — autenticación, catálogo, chatbot, handoff humano, panel administrativo y servicios Supabase — fueron validados de forma repetible y medible.

Desde el plano del **código limpio**, la aplicación de ESLint sin advertencias, Prettier, arquitectura por capas (services, hooks, components, utils) y separación de responsabilidades constituye evidencia de **mantenibilidad** y **profesionalismo** en el desarrollo frontend.

Desde el plano del **análisis estático**, la integración con SonarQube/SonarCloud — mediante importación del informe LCOV y evaluación de bugs, vulnerabilities, code smells, duplicaciones y Quality Gate — complementa las pruebas dinámicas con métricas objetivas reconocidas en la industria.

Desde el plano **normativo**, la documentada alineación con ISO/IEC 25010, ISO/IEC/IEEE 29119, ISO/IEC 27001, ISO/IEC 12207, ISO 9001 e ISO/IEC 25023 vincula las decisiones técnicas del proyecto con **marcos internacionales de calidad**, pruebas, seguridad, ciclo de vida y medición.

Desde el plano del **diseño**, la galería de mockups en `/mockups` evidencia la coherencia visual y la trazabilidad entre requisitos funcionales e interfaz de usuario para una tienda de suplementos nutricionales.

Desde el plano de la **operacionalización**, el build de producción aprobado, la configuración de despliegue en Vercel, la gestión segura de variables de entorno y la integración con Supabase Auth demuestran que el prototipo trasciende el entorno de desarrollo local y es **demostrable públicamente** mediante una URL accesible.

En conjunto, estas evidencias permiten sostener, con respaldo empírico y documental, que el software desarrollado cumple los criterios de calidad exigidos en un proyecto de tesis de ingeniería de software de carácter aplicado, integrando de manera coherente **inteligencia artificial conversacional**, **handoff humano**, **gestión comercial** y **buenas prácticas de ingeniería** en un mismo producto verificable.

---

## 10. Índice de documentos relacionados

| Documento | Contenido |
| --------- | --------- |
| [`REPORTE_PRUEBAS.md`](REPORTE_PRUEBAS.md) | Detalle de casos de prueba |
| [`CODIGO_LIMPIO.md`](CODIGO_LIMPIO.md) | Prácticas de mantenibilidad |
| [`SONAR_ANALISIS.md`](SONAR_ANALISIS.md) | Análisis estático Sonar |
| [`ESTANDARES_ISO.md`](ESTANDARES_ISO.md) | Alineación normativa ISO |
| [`MOCKUPS.md`](MOCKUPS.md) | Galería de diseño UI |
| [`DESPLIEGUE.md`](DESPLIEGUE.md) | Procedimiento Vercel + Supabase |
| [`ARQUITECTURA.md`](ARQUITECTURA.md) | Diseño del sistema |
| [`MODULOS_IMPLEMENTADOS.md`](MODULOS_IMPLEMENTADOS.md) | Trazabilidad módulo–prueba |
| [`README.md`](../README.md) | Guía general del proyecto |
