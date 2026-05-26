# Alineación del sistema NutriStore con estándares ISO de calidad de software

**Proyecto de tesis:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Sistema evaluado:** NutriStore — aplicación web (`suplementos-app`)  
**Stack tecnológico:** React 19, Vite 8, JavaScript, Supabase (PostgreSQL, Auth, RLS), Vitest, ESLint, Prettier, SonarQube/SonarCloud  
**Fecha de referencia:** Mayo 2026

---

## 1. Introducción

El presente documento establece la **relación explícita** entre el sistema web NutriStore y un conjunto de normas internacionales de la familia ISO/IEC/IEEE aplicables a la **calidad del producto software**, las **pruebas**, la **seguridad de la información**, el **ciclo de vida del software** y la **mejora continua**. Su finalidad es servir como **evidencia académica** en la memoria de tesis, demostrando que el desarrollo no se limitó a la implementación funcional, sino que incorporó prácticas reconocidas por la industria y alineadas con marcos normativos internacionales.

Se aclara que la aplicación de estas normas en un proyecto académico de prototipo implica una **adaptación proporcional** de sus requisitos: no se pretende la certificación formal de la organización ni del producto, sino la **demostración documentada** de que los criterios de cada norma encuentran correspondencia verificable en decisiones de diseño, artefactos del repositorio, herramientas de calidad y resultados de ejecución automatizada.

---

## 2. ISO/IEC 25010 — Modelo de calidad del producto software

La norma **ISO/IEC 25010** define un modelo de calidad del producto software organizado en **características de calidad** y **subcaracterísticas**. NutriStore aborda dichas dimensiones de la siguiente manera:

### 2.1 Adecuación funcional

El sistema cubre los requisitos funcionales del dominio de la tesis: catálogo de suplementos, autenticación, panel administrativo, chatbot con handoff humano, gestión de publicaciones en redes sociales y operaciones de venta. Cada módulo se documenta en `docs/MODULOS_IMPLEMENTADOS.md` y se valida mediante pruebas automatizadas en `src/tests/` (servicios, componentes e integración).

**Evidencia:** 36 archivos de prueba con casos orientados a login, CRUD de productos, motor del chatbot, handoff, generación de contenido y paneles admin.

### 2.2 Eficiencia de desempeño

El frontend se construye como **SPA** con Vite, que ofrece compilación optimizada y empaquetado para producción (`npm run build`). La arquitectura separa la lógica pesada en servicios y utilidades puras, evitando renderizados innecesarios mediante hooks especializados (`useAuth`, `useProducts`, `useChatbot`).

**Evidencia:** build de producción exitoso en `dist/`; separación de capas descrita en `docs/ARQUITECTURA.md`.

### 2.3 Compatibilidad

La aplicación es compatible con entornos modernos de navegador mediante JavaScript estándar (ESM) y APIs web soportadas por `jsdom` en pruebas. La integración con Supabase utiliza el cliente oficial `@supabase/supabase-js`, garantizando interoperabilidad con Auth JWT, PostgreSQL y políticas RLS del backend.

**Evidencia:** dependencias declaradas en `package.json`; cliente singleton en `src/services/supabaseClient.js`.

### 2.4 Usabilidad

Se implementó una biblioteca de componentes reutilizables (`Button`, `Input`, `Card`, `Loading`, `Navbar`, `Layout`) con estilos coherentes (`src/styles/variables.css`). Los formularios muestran mensajes de error traducidos (`utils/authErrors.js`) y estados de carga explícitos en rutas protegidas (`ProtectedRoute`, `RoleRoute`).

**Evidencia:** pruebas de componentes con React Testing Library orientadas al comportamiento visible (`LoginPage.test.jsx`, `ChatWidget.test.jsx`, `ProductCard.test.jsx`).

### 2.5 Fiabilidad

La fiabilidad se refuerza con manejo centralizado de errores en servicios, validadores reutilizables (`validators.js`), persistencia de sesión en Supabase Auth y pruebas que simulan fallos de red mediante mocks (`supabaseMock.js`).

**Evidencia:** suite Vitest con 196 pruebas aprobadas; cobertura de líneas superior al 76% en el alcance definido.

### 2.6 Seguridad

Se aborda en profundidad en la sección 4 (ISO/IEC 27001). En el plano de producto, destacan rutas protegidas, control por rol y RLS en base de datos.

### 2.7 Mantenibilidad

La estructura por capas (`components/`, `hooks/`, `services/`, `utils/`), nombres significativos, funciones puras en utilidades y documentación técnica (`docs/CODIGO_LIMPIO.md`, `docs/ARQUITECTURA.md`) favorecen la modificabilidad y la comprensión del código.

**Evidencia:** ESLint con `--max-warnings 0`, Prettier, análisis estático Sonar (`docs/SONAR_ANALISIS.md`).

### 2.8 Portabilidad

El proyecto es independiente del sistema operativo de desarrollo (Windows, Linux, macOS) al basarse en Node.js y npm. El despliegue del frontend puede realizarse en cualquier hosting estático (Vite `dist/`), mientras Supabase provee backend gestionado en la nube.

**Evidencia:** scripts `dev`, `build`, `preview` en `package.json`; variables de entorno externalizadas (`.env`, excluido de git).

---

## 3. ISO/IEC/IEEE 29119 — Proceso y documentación de pruebas de software

La serie **ISO/IEC/IEEE 29119** establece conceptos, procesos y documentación para las **pruebas de software**. NutriStore implementa un proceso de pruebas reproducible alineado con sus principios:

### 3.1 Pruebas unitarias

Ubicadas en `src/tests/unit/`, verifican funciones y servicios de forma aislada mediante mocks de Supabase. Ejemplos: `validators.test.js`, `authService.test.js`, `chatbotService.test.js`, `productService.test.js`.

**Propósito:** validar unidades de código mínimas (funciones puras, métodos de servicio) con entrada/salida conocida.

### 3.2 Pruebas de componentes

En `src/tests/components/` y `src/tests/hooks/`, emplean **React Testing Library** y **user-event** para comprobar renderizado, interacción y accesibilidad desde la perspectiva del usuario.

**Ejemplos:** `AdminProductsPanel.test.jsx`, `ChatWidget.test.jsx`, `useAuth.test.jsx`.

### 3.3 Pruebas de integración

El archivo `src/tests/integration/servicesLayer.test.js` ejerce la **capa de servicios** con un mock compartido de Supabase, verificando la coordinación entre módulos sin base de datos real.

### 3.4 Reporte de cobertura

Vitest con proveedor **v8** genera informes en `./coverage/`, incluido `coverage/lcov.info`, consumido por Sonar. Métricas recientes: **76,63% líneas**, **73,41% sentencias**, **61,99% ramas** en el alcance configurado en `vitest.config.js`.

**Comando:** `npm run test:coverage`.

### 3.5 Casos de prueba

Los casos se organizan por archivo `*.test.js` / `*.test.jsx`, con descripciones en bloques `describe`/`it` y datos de prueba en `src/tests/helpers/mockData.js`. El inventario detallado figura en `docs/REPORTE_PRUEBAS.md`.

### 3.6 Evidencia de ejecución

Cada corrida de `npm run test` o `npm run test:coverage` produce salida en consola con número de archivos, pruebas aprobadas y duración. El script `npm run quality` encadena lint, cobertura y build como evidencia integrada de aceptación local.

---

## 4. ISO/IEC 27001 — Seguridad de la información (controles aplicables)

**ISO/IEC 27001** define un Sistema de Gestión de Seguridad de la Información (SGSI). En un prototipo académico, se adoptan **controles técnicos equivalentes** en lugar de la certificación formal del SGSI:

### 4.1 Autenticación

Supabase Auth gestiona registro, login, sesión JWT, renovación de token y cierre de sesión. El hook `useAuth` expone el estado de autenticación a toda la aplicación; `authService.js` centraliza las operaciones sobre `profiles` y roles.

**Evidencia:** `authService.test.js`; rutas de login/registro en `src/components/auth/`.

### 4.2 Roles

El modelo relacional incluye tablas `roles`, `role_permissions` y perfiles vinculados. En frontend, `RoleRoute` y `utils/authRoutes.js` restringen rutas según rol (`admin`, `seller`, `customer`).

**Evidencia:** `RoleRoute.test.jsx`; menú admin en `utils/adminMenu.js`.

### 4.3 Control de acceso

Doble capa: **frontend** (`ProtectedRoute`, `RoleRoute`, `canAccessRoute`) y **backend** mediante políticas RLS en PostgreSQL. Solo la clave anónima (`VITE_SUPABASE_ANON_KEY`) se expone al cliente; las operaciones sensibles quedan acotadas por políticas del servidor.

**Evidencia:** `src/routes/ProtectedRoute.jsx`, `src/routes/RoleRoute.jsx`.

### 4.4 RLS de Supabase

El archivo `supabase/schema.sql` habilita **Row Level Security** en tablas críticas (`profiles`, `products`, `orders`, `conversations`, `system_settings`, entre otras). Las migraciones incrementales (`supabase/migrations/`) mantienen políticas coherentes con nuevos módulos (p. ej. configuración del chatbot).

**Evidencia:** sección 8 de `supabase/schema.sql` — `ENABLE ROW LEVEL SECURITY`.

### 4.5 Protección de variables de entorno

Las credenciales se cargan desde `import.meta.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). El archivo `.env` está en `.gitignore`; `supabaseClient.js` valida variables faltantes y advierte sin exponer secretos en producción.

**Evidencia:** `getMissingSupabaseEnvVars()`, `.env.example` como plantilla, `.gitignore`.

### 4.6 No exposición de claves privadas

No se incluyen **service role keys**, tokens de Sonar ni contraseñas en el repositorio. SonarScanner utiliza `SONAR_TOKEN` por variable de entorno (`docs/SONAR_ANALISIS.md`). ESLint restringe `console.log` para evitar fugas accidentales de datos en consola.

**Evidencia:** `sonar-project.properties` sin tokens; regla ESLint `no-console`.

---

## 5. ISO/IEC 12207 — Procesos del ciclo de vida del software

**ISO/IEC 12207** describe procesos del ciclo de vida del software. NutriStore sigue una correspondencia práctica con las actividades principales:

| Actividad ISO/IEC 12207 | Realización en NutriStore |
| ----------------------- | ------------------------- |
| **Análisis** | Definición de requisitos de tesis (chatbot, handoff, redes sociales, ventas); modelado de ~51 tablas en `supabase/schema.sql`; documentación en `docs/ARQUITECTURA.md` y `docs/MODULOS_IMPLEMENTADOS.md`. |
| **Diseño** | Arquitectura por capas (presentación, hooks, servicios, datos); separación del motor del chatbot (`chatbotEngine.js`); diseño de rutas y roles. |
| **Implementación** | Código fuente en `src/` (React, servicios Supabase, utilidades); migraciones SQL; estilos modulares. |
| **Pruebas** | Suite Vitest (unit, componentes, integración); cobertura; mocks; reporte en `docs/REPORTE_PRUEBAS.md`. |
| **Despliegue** | Build estático con Vite (`npm run build` → `dist/`); backend en Supabase Cloud; variables de entorno por entorno. |
| **Mantenimiento** | Refactorización documentada, corrección de issues de lint, ampliación de pruebas, análisis Sonar y actualización de migraciones. |

El script `npm run quality` sintetiza la verificación previa a entrega o demostración académica.

---

## 6. ISO 9001 — Mejora continua y gestión de la calidad

**ISO 9001** enfatiza el enfoque al cliente, la mejora continua y la gestión basada en evidencias. En el ámbito del proyecto de tesis, se materializa así:

### 6.1 Revisión de calidad

Revisiones periódicas mediante `npm run lint`, `npm run format:check`, `npm run quality` y análisis Sonar antes de considerar una versión estable.

### 6.2 Corrección de errores

Los fallos detectados por pruebas o ESLint se corrigen antes de integrar cambios; los servicios traducen errores de Supabase a mensajes comprensibles (`authErrors.js`).

### 6.3 Documentación

Conjunto de artefactos en `docs/`: arquitectura, código limpio, reporte de pruebas, análisis Sonar, módulos implementados y el presente documento de estándares ISO.

### 6.4 Trazabilidad

Requisito funcional → módulo → servicio/tablas → archivo de prueba. Ejemplo: handoff humano → `chatbotService.js` → tablas `handoff_requests`, `conversations` → casos en `chatbotService.test.js` y `ChatWidget.test.jsx`.

### 6.5 Evidencias

Salidas de consola de Vitest, informes HTML/LCOV en `coverage/`, resultados de build, capturas de SonarCloud (cuando se ejecute el scanner) y este repositorio documentado.

---

## 7. ISO/IEC 25023 — Medición de la calidad del producto software

**ISO/IEC 25023** complementa ISO/IEC 25010 al definir **medidas de calidad**. NutriStore emplea métricas cuantificables:

| Medida | Implementación | Valor de referencia |
| ------ | -------------- | ------------------- |
| **Cobertura de pruebas** | Vitest + `@vitest/coverage-v8` → `coverage/lcov.info` | > 70% líneas (actual ~76,6%) |
| **Mantenibilidad** | ESLint, Prettier, estructura por capas, deuda técnica Sonar | Lint sin advertencias; documentación de smells en Sonar |
| **Defectos detectados** | Vitest (regresiones), ESLint (estático), Sonar (bugs/vulnerabilities) | 196/196 pruebas OK en última corrida |
| **Calidad estática con Sonar** | `sonar-project.properties`, `npm run sonar` | Importación LCOV; Quality Gate en SonarCloud |
| **Build exitoso** | `vite build` en pipeline `quality` | Artefactos en `dist/` sin error de compilación |

El script `npm run quality` agrupa las mediciones operativas en un único punto de verificación reproducible.

---

## 8. Tabla resumen de alineación normativa

| Norma ISO | Criterio aplicado | Evidencia en el sistema | Herramienta utilizada | Resultado esperado |
| --------- | ----------------- | ----------------------- | --------------------- | ------------------ |
| **ISO/IEC 25010** | Adecuación funcional | Módulos auth, catálogo, chatbot, handoff, redes sociales, admin | Vitest, RTL | Requisitos de tesis verificados por pruebas |
| **ISO/IEC 25010** | Eficiencia de desempeño | SPA Vite, hooks especializados, build optimizado | Vite | Build de producción exitoso |
| **ISO/IEC 25010** | Compatibilidad | Cliente Supabase, ESM, React Router | `@supabase/supabase-js`, Vite | Integración estable con backend cloud |
| **ISO/IEC 25010** | Usabilidad | Componentes comunes, mensajes de error, estados de carga | React Testing Library | Interacciones críticas validadas |
| **ISO/IEC 25010** | Fiabilidad | Validadores, mocks, manejo de errores en servicios | Vitest, jsdom | 196 pruebas aprobadas |
| **ISO/IEC 25010** | Seguridad | Auth JWT, roles, RLS, `.env` | Supabase Auth, PostgreSQL RLS | Acceso restringido por rol y política |
| **ISO/IEC 25010** | Mantenibilidad | Capas, documentación, lint, Sonar | ESLint, Prettier, SonarScanner | Código legible y analizable |
| **ISO/IEC 25010** | Portabilidad | Node/npm, hosting estático, Supabase cloud | Vite, npm scripts | Ejecución multiplataforma |
| **ISO/IEC/IEEE 29119** | Pruebas unitarias | `src/tests/unit/*.test.js` | Vitest | Funciones y servicios aislados OK |
| **ISO/IEC/IEEE 29119** | Pruebas de componentes | `src/tests/components/`, `src/tests/hooks/` | RTL, user-event | UI crítica validada |
| **ISO/IEC/IEEE 29119** | Pruebas de integración | `servicesLayer.test.js` | Vitest + supabaseMock | Capa de servicios coordinada |
| **ISO/IEC/IEEE 29119** | Reporte de cobertura | `coverage/lcov.info`, informe HTML | `@vitest/coverage-v8` | Cobertura > 70% |
| **ISO/IEC/IEEE 29119** | Casos de prueba | `describe`/`it`, `mockData.js` | Vitest | Casos trazables en REPORTE_PRUEBAS |
| **ISO/IEC/IEEE 29119** | Evidencia de ejecución | Salida CLI, `npm run quality` | npm, Vitest | Corridas reproducibles documentadas |
| **ISO/IEC 27001** | Autenticación | `authService`, Supabase Auth, `useAuth` | Supabase Auth | Sesión segura y persistente |
| **ISO/IEC 27001** | Roles | Tablas `roles`, `RoleRoute`, `authRoutes.js` | React Router | Rutas acordes al rol |
| **ISO/IEC 27001** | Control de acceso | `ProtectedRoute`, políticas RLS | Supabase RLS | Denegación de acceso no autorizado |
| **ISO/IEC 27001** | RLS Supabase | `schema.sql`, migraciones | PostgreSQL (Supabase) | Políticas por tabla habilitadas |
| **ISO/IEC 27001** | Variables de entorno | `.env`, `.gitignore`, `supabaseClient.js` | Vite env | Secretos fuera del repositorio |
| **ISO/IEC 27001** | No exposición de claves | Solo anon key; tokens Sonar por env | ESLint, gitignore | Sin filtración de credenciales |
| **ISO/IEC 12207** | Análisis | Requisitos tesis, esquema BD | Documentación, SQL | Modelo de dominio definido |
| **ISO/IEC 12207** | Diseño | Capas, motor chatbot, rutas | docs/ARQUITECTURA.md | Arquitectura trazable |
| **ISO/IEC 12207** | Implementación | `src/`, migraciones | React, Supabase | Prototipo funcional |
| **ISO/IEC 12207** | Pruebas | Suite completa `src/tests/` | Vitest | Regresiones detectadas |
| **ISO/IEC 12207** | Despliegue | `npm run build`, Supabase Cloud | Vite, Supabase | Sistema demostrable |
| **ISO/IEC 12207** | Mantenimiento | Refactors, nuevas pruebas, docs | Git, npm scripts | Evolución controlada |
| **ISO 9001** | Revisión de calidad | `npm run quality`, Sonar | ESLint, Vitest, Sonar | Verificación antes de entrega |
| **ISO 9001** | Corrección de errores | Fixes tras lint/tests | Vitest, ESLint | Defectos corregidos |
| **ISO 9001** | Documentación | Carpeta `docs/` | Markdown | Memoria y evidencias |
| **ISO 9001** | Trazabilidad | Módulo → prueba → tabla | MODULOS_IMPLEMENTADOS | Requisito vinculado a prueba |
| **ISO 9001** | Evidencias | Reportes, cobertura, build | Vitest, Vite, Sonar | Artefactos verificables |
| **ISO/IEC 25023** | Cobertura de pruebas | `coverage/lcov.info` | Vitest v8 | ≥ 70% en alcance definido |
| **ISO/IEC 25023** | Mantenibilidad | Lint, capas, Sonar smells | ESLint, SonarScanner | Deuda técnica acotada |
| **ISO/IEC 25023** | Defectos detectados | Tests + análisis estático | Vitest, ESLint, Sonar | Bugs priorizados |
| **ISO/IEC 25023** | Calidad estática Sonar | `sonar-project.properties` | SonarQube/SonarCloud | Quality Gate evaluado |
| **ISO/IEC 25023** | Build exitoso | `dist/` generado | Vite | Compilación sin errores |

---

## 9. Conclusión académica

El sistema web NutriStore, desarrollado con **React**, **Vite** y **Supabase**, fue sometido a un proceso de evaluación de calidad **multidimensional** y **documentado**, coherente con los principios de las normas ISO/IEC 25010, ISO/IEC/IEEE 29119, ISO/IEC 27001, ISO/IEC 12207, ISO 9001 e ISO/IEC 25023.

En concreto, la calidad del producto se sustentó en:

1. **Pruebas automatizadas** ejecutadas con Vitest y React Testing Library, abarcando pruebas unitarias, de componentes e integración, con **196 pruebas aprobadas** y **cobertura de código superior al 70%** en el alcance definido para servicios, utilidades, hooks y componentes prioritarios.

2. **Análisis estático** mediante ESLint (cero advertencias en `npm run lint`) y **SonarQube/SonarCloud**, configurado para importar el informe LCOV generado por Vitest y evaluar bugs, vulnerabilidades, code smells, duplicaciones y mantenibilidad.

3. **Revisión de cobertura** documentada en `docs/REPORTE_PRUEBAS.md` y en los informes HTML/LCOV de la carpeta `coverage/`.

4. **Linting y formateo** uniforme con ESLint y Prettier, como base de mantenibilidad y legibilidad del código fuente.

5. **Compilación para producción** verificada mediante `npm run build`, integrada en el script `npm run quality`, que demuestra que el sistema es desplegable como artefacto estático optimizado.

6. **Controles de seguridad** alineados con buenas prácticas de gestión de la información: autenticación Supabase, control de acceso por rol en frontend y backend, Row Level Security en PostgreSQL, y exclusión de credenciales sensibles del repositorio.

En conjunto, estas actividades constituyen **evidencia empírica** de que el prototipo no solo cumple funcionalmente los objetivos de la tesis, sino que fue desarrollado y evaluado conforme a **estándares internacionales de calidad de software**, apto para ser citado en la memoria como demostración de **ingeniería de software rigurosa**, **trazabilidad de requisitos** y **mejora continua** basada en métricas objetivas.

---

## 10. Referencias documentales internas

| Documento | Contenido |
| --------- | --------- |
| `docs/ARQUITECTURA.md` | Diseño del sistema y capas |
| `docs/CODIGO_LIMPIO.md` | Prácticas de mantenibilidad |
| `docs/REPORTE_PRUEBAS.md` | Casos de prueba y resultados |
| `docs/SONAR_ANALISIS.md` | Análisis estático y métricas Sonar |
| `docs/MODULOS_IMPLEMENTADOS.md` | Trazabilidad módulo–prueba |
| `sonar-project.properties` | Configuración del análisis Sonar |
| `vitest.config.js` | Cobertura y alcance de pruebas |

---

## 11. Referencias normativas (bibliografía sugerida para la tesis)

- ISO/IEC 25010:2023 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model.
- ISO/IEC/IEEE 29119 (series) — Software and systems engineering — Software testing.
- ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements.
- ISO/IEC 12207:2017 — Systems and software engineering — Software life cycle processes.
- ISO 9001:2015 — Quality management systems — Requirements.
- ISO/IEC 25023:2016 — Measurement of quality of software products.
