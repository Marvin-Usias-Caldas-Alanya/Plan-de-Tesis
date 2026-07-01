# Estado del arte y su aplicación en NutriStore

**Proyecto de tesis:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Aplicación:** NutriStore (`suplementos-app`)  
**Fuente bibliográfica del investigador:** [Carpeta Estado del Arte — Google Drive](https://drive.google.com/drive/folders/1UyonMaHiZEMG-1GNKbQQwYkV8sCmF9OR?usp=sharing)  
**Fecha de referencia:** Mayo 2026

---

## 1. Introducción

El **estado del arte** reúne las investigaciones, tendencias tecnológicas y soluciones existentes en un dominio específico. En esta tesis, ese material se consultó en la carpeta de Google Drive indicada arriba y se **tradujo en decisiones concretas** para el diseño e implementación de NutriStore.

El presente documento **no sustituye** el capítulo bibliográfico de la memoria; documenta **cómo cada línea del estado del arte se aplicó en la web** que desarrollamos: qué se adoptó, dónde quedó en el código y qué evidencia lo respalda.

> **Nota:** Los PDF, artículos y fichas bibliográficas originales permanecen en Drive. Aquí se describe la **aplicación técnica y funcional** en el prototipo.

---

## 2. Metodología de aplicación

| Paso | Acción |
| ---- | ------ |
| 1 | Revisión de fuentes en la carpeta Drive (papers, informes, comparativas de mercado). |
| 2 | Identificación de **patrones recurrentes** (chatbots, handoff, e-commerce, IA en redes). |
| 3 | Selección de tecnologías acordes al alcance académico (React, Supabase, Vitest). |
| 4 | Implementación en módulos trazables (`services/`, `components/`, `supabase/`). |
| 5 | Validación con pruebas automatizadas, mockups y documentación en `docs/`. |

---

## 3. Mapa estado del arte → aplicación en NutriStore

### 3.1 Comercio electrónico y retail digital

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Tiendas online especializadas | El nicho fitness/nutrición exige catálogo claro, stock visible y confianza | Catálogo con categorías (proteínas, creatinas, vitaminas), precios y stock | `CatalogPage`, `productService.js`, `ProductCard.jsx` |
| Panel administrativo | El retail digital requiere backoffice para productos e inventario | Dashboard admin modular con CRUD y KPIs | `AdminDashboardPage`, `AdminProductsPanel`, `AdminInventoryPanel` |
| Experiencia de compra | Flujos cortos y CTA visibles mejoran conversión | Home con beneficios, CTA a catálogo y chatbot | `HomePage.jsx`, mockup `/mockups` |

**Referencia Drive:** documentos sobre e-commerce B2C y retail nutricional/deportivo.

---

### 3.2 Chatbots conversacionales en atención al cliente

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Asistentes 24/7 | Los chatbots reducen tiempo de respuesta en consultas frecuentes | Widget **NutriBot** flotante en catálogo e inicio | `ChatWidget.jsx`, `useChatbot.js` |
| Intenciones y reglas | Modelos basados en intenciones superan respuestas fijas | Motor de reglas + intenciones configurables en BD | `chatbotEngine.js`, `chatbotConfigService.js` |
| Recomendación de productos | Bots orientados a objetivos (masa, definición) aumentan relevancia | Reglas por objetivo fitness y recomendación de suplementos | `chatbotGoalRules.js`, tests en `chatbotService.test.js` |
| Fallback controlado | Respuestas por defecto evitan silencios del bot | Módulo de fallback centralizado | `chatbotFallback.js` |

**Referencia Drive:** artículos sobre chatbots en retail, NLU ligero y rule-based bots.

---

### 3.3 Sistemas híbridos: IA + handoff humano

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Limitaciones del bot puro | La IA no cierra alone ventas complejas o sensibles | Detección de intención de **compra** → derivación a vendedor | `detectHumanHandoffIntent`, `HANDOFF_CLIENT_MESSAGE` |
| Handoff / escalamiento | Modelos híbridos combinan automatización y empatía humana | Estados de conversación: `bot` → `pending_handoff` → `human` | Tablas `conversations`, `handoff_requests`, `seller_assignments` |
| Panel del vendedor | Agentes humanos necesitan cola y contexto | Panel vendedor con conversaciones y respuestas | `SellerDashboardPage`, `useSellerConversations` |
| Trazabilidad | El cliente debe saber que fue derivado | Mensaje fijo al activar handoff | `utils/constants.js`, `ChatWidget.test.jsx` |

**Referencia Drive:** investigaciones sobre *human-in-the-loop*, *agent handoff* y customer service híbrido.

---

### 3.4 Inteligencia artificial en redes sociales y marketing

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Generación de contenido | La IA acelera copy para Instagram, Facebook, TikTok, WhatsApp | Servicio de generación por plataforma y tono | `aiContentService.js` |
| Revisión humana previa | Publicar sin revisar es riesgo de marca | Flujo: generar → editar → publicar | `AdminSocialPostsPanel`, `AIGeneratorPanel` |
| Campañas y métricas | Las redes requieren trazabilidad de publicaciones | Tablas `social_posts`, `social_campaigns`, `social_metrics` | `socialService.js`, `socialMediaService.js` |
| Multicanal | Mismo producto, distintos formatos por red | Plantillas por plataforma en tests | `aiContentService.test.js` |

**Referencia Drive:** papers sobre IA generativa en marketing digital y social commerce.

---

### 3.5 Arquitecturas web modernas (frontend)

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| SPA y componentización | React domina interfaces reactivas mantenibles | React 19 + Vite 8 + React Router 7 | `src/`, `vite.config.js`, `AppRouter.jsx` |
| Separación por capas | Pages / hooks / services reduce acoplamiento | Arquitectura documentada en capas | `docs/ARQUITECTURA.md`, `docs/CODIGO_LIMPIO.md` |
| Diseño responsive | Mobile-first en retail | CSS fluido + mockup móvil en `/mockups` | `MobileMockup.jsx`, estilos en `HomePage.css` |
| UI coherente | Design systems mejoran usabilidad | Componentes comunes (`Button`, `Input`, `Card`) | `src/components/common/` |

**Referencia Drive:** informes sobre stacks JavaScript modernos y SPAs empresariales.

---

### 3.6 Backend as a Service y seguridad de datos

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| BaaS / Supabase | PostgreSQL gestionado + Auth acelera prototipos académicos | Supabase como backend único | `supabaseClient.js`, `supabase/schema.sql` |
| Modelo relacional | ~50 tablas soportan escalabilidad del dominio | Esquema normalizado por módulos | `supabase/schema.sql`, `DATABASE-THESIS.md` |
| Row Level Security | Seguridad en servidor, no solo en frontend | RLS por rol en tablas sensibles | Sección RLS en `schema.sql` |
| Roles (admin, seller, customer) | RBAC es estándar en sistemas multiusuario | `ProtectedRoute`, `RoleRoute`, tablas `roles` | `authRoutes.js`, `RoleRoute.jsx` |
| Variables de entorno | Secretos fuera del repositorio | `.env` + Vercel env vars | `.env.example`, `.gitignore` |

**Referencia Drive:** documentación Supabase, artículos BaaS y seguridad ISO 27001 aplicada.

---

### 3.7 Gestión de inventario, pedidos y operaciones

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Stock en tiempo real | Evita sobreventa y mejora confianza | Campo stock en productos + panel inventario | `productStock.js`, `inventoryService.js` |
| Pedidos y ventas | Trazabilidad order-to-cash | Servicios `orderService`, `salesService`, `paymentService` | `src/services/`, tablas `orders`, `sales` |
| Auditoría | Retail exige registro de cambios | `auditService.js`, tablas de auditoría | Panel admin auditoría |

**Referencia Drive:** estudios de ERP ligero e inventario en pymes retail.

---

### 3.8 Calidad de software, pruebas y análisis estático

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Pruebas automatizadas | TDD/RTL reducen regresiones | Vitest + RTL, 196 pruebas | `src/tests/`, `docs/REPORTE_PRUEBAS.md` |
| Cobertura medible | Métricas objetivas para tesis | > 76% líneas en alcance definido | `vitest.config.js`, `coverage/lcov.info` |
| Lint y formato | Estilo uniforme = mantenibilidad | ESLint + Prettier, cero warnings | `npm run lint`, `eslint.config.js` |
| Análisis Sonar | Deuda técnica y security en CI | SonarCloud + `sonar-project.properties` | `docs/SONAR_ANALISIS.md` |
| Normas ISO | Marco académico de calidad | Documento de alineación ISO | `docs/ESTANDARES_ISO.md` |

**Referencia Drive:** ISO/IEC 25010, 29119, 12207; guías SonarQube.

---

### 3.9 Despliegue cloud y operación

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Hosting estático + CDN | Vite build en edge es costo-eficiente | Despliegue en **Vercel** | `vercel.json`, `docs/DESPLIEGUE.md` |
| SPA routing | Rewrites evitan 404 al recargar | `rewrites` → `index.html` | `vercel.json` |
| Integración Auth producción | URLs deben registrarse en Supabase | Site URL + Redirect URLs | Sección Auth en `DESPLIEGUE.md` |

**Referencia Drive:** DevOps ligero, JAMstack, despliegue continuo.

---

### 3.10 Diseño de interfaz y experiencia de usuario

| Aspecto del estado del arte | Hallazgo investigado | Aplicación en NutriStore | Evidencia |
| --------------------------- | -------------------- | ------------------------ | --------- |
| Wireframes / mockups | Documentar UI antes de codificar acelera validación | Galería estática en `/mockups` | `MockupsPage.jsx`, `docs/MOCKUPS.md` |
| Identidad visual fitness | Verde/naranja/oscuro comunica energía y salud | Tokens en `variables.css` | `src/styles/variables.css` |
| Usabilidad por rol | Cada actor (cliente, vendedor, admin) tiene flujo propio | Rutas y layouts separados | `/`, `/catalogo`, `/vendedor`, `/admin` |

**Referencia Drive:** referencias UI/UX e-commerce y dashboards admin.

---

## 4. Tabla resumen consolidada

| # | Tema del estado del arte | Decisión en NutriStore | Módulo / ruta | Documento de soporte |
| - | ------------------------ | ---------------------- | ------------- | -------------------- |
| 1 | E-commerce retail | Catálogo + admin + stock | `/catalogo`, `/admin` | `MODULOS_IMPLEMENTADOS.md` |
| 2 | Chatbots | NutriBot con reglas e intenciones | `ChatWidget`, `chatbotEngine` | `REPORTE_PRUEBAS.md` |
| 3 | Handoff híbrido | Bot → vendedor humano | `/vendedor`, handoff tables | Mockup `HandoffMockup` |
| 4 | IA en redes sociales | Generador de publicaciones | `aiContentService` | `aiContentService.test.js` |
| 5 | SPA React moderna | Vite + Router + capas | `src/` | `ARQUITECTURA.md` |
| 6 | Supabase + RLS | Backend y seguridad | `supabase/` | `ESTANDARES_ISO.md` §27001 |
| 7 | Inventario y pedidos | Servicios de negocio | `inventoryService`, `orderService` | Schema SQL |
| 8 | Calidad y pruebas | Pipeline `quality` + Sonar | npm scripts | `EVIDENCIAS_CALIDAD_DESPLIEGUE.md` |
| 9 | Despliegue cloud | Vercel + env vars | URL pública | `DESPLIEGUE.md` |
| 10 | UX documentada | Mockups exportables PNG | `/mockups` | `MOCKUPS.md` |

---

## 5. Brechas conscientes (estado del arte vs. prototipo)

Para honestidad académica, se declaran limitaciones respecto al estado del arte completo:

| Tema avanzado en bibliografía | Estado en NutriStore | Trabajo futuro |
| ----------------------------- | -------------------- | -------------- |
| LLM en tiempo real (GPT, etc.) | Motor rule-based + IA simulada en contenido | Edge Function `chat-ai` |
| Integración API real Instagram/Facebook | Publicaciones guardadas en BD, sin post automático | APIs Meta/TikTok |
| Pasarela de pago en producción | Modelo de datos de pagos, flujo parcial | Stripe/Mercado Pago |
| CRM enterprise | Funcionalidad acotada a conversaciones y pedidos | Ampliar módulo clientes |

Estas brechas **no invalidan** la aplicación del estado del arte; delimitan el alcance del prototipo de tesis.

---

## 6. Conclusión académica

La revisión del estado del arte — documentada en la [carpeta de Google Drive](https://drive.google.com/drive/folders/1UyonMaHiZEMG-1GNKbQQwYkV8sCmF9OR?usp=sharing) — no permaneció como marco teórico aislado. Cada línea investigada se **materializó** en decisiones verificables de NutriStore: arquitectura por capas, chatbot con handoff, generación de contenido para redes, seguridad con Supabase RLS, pruebas automatizadas, análisis Sonar y despliegue en Vercel.

Esta trazabilidad **estado del arte → diseño → código → evidencia** demuestra que el sistema web no es una implementación ad hoc, sino una respuesta **fundamentada** a tendencias y buenas prácticas reconocidas en comercio digital, atención híbrida con IA y calidad de software.

---

## 7. Referencias cruzadas internas

| Documento | Relación |
| --------- | -------- |
| [`ARQUITECTURA.md`](ARQUITECTURA.md) | Decisiones técnicas derivadas del estado del arte |
| [`MODULOS_IMPLEMENTADOS.md`](MODULOS_IMPLEMENTADOS.md) | Trazabilidad funcional |
| [`MOCKUPS.md`](MOCKUPS.md) | Diseño UI aplicado |
| [`ESTANDARES_ISO.md`](ESTANDARES_ISO.md) | Calidad normativa |
| [`EVIDENCIAS_CALIDAD_DESPLIEGUE.md`](EVIDENCIAS_CALIDAD_DESPLIEGUE.md) | Evidencias finales |
| [`MANTENIMIENTO.md`](MANTENIMIENTO.md) | Sostenibilidad post-tesis |

---

## 8. Anexo: sincronización con la carpeta Drive

Si agregas nuevas fuentes al Drive, actualiza esta tabla en el repositorio:

| Archivo en Drive | Tema | Aplicación en NutriStore | Fecha revisión |
| ---------------- | ---- | ------------------------ | -------------- |
| _(completar)_ | | | |

Mantener esta tabla al día refuerza la **trazabilidad bibliográfica** en defensa de tesis.
