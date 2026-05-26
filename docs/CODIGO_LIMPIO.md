# Evidencia de código limpio y calidad de software

**Proyecto:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Aplicación:** NutriStore (`suplementos-app`)  
**Stack:** React 19, Vite, JavaScript, Supabase, Vitest, ESLint, Prettier

---

## 1. Introducción

Este documento describe las decisiones de arquitectura y las prácticas de **código limpio** adoptadas en el frontend del sistema. Su propósito es servir como **evidencia académica** de que el desarrollo sigue estándares profesionales de mantenibilidad, pruebas automatizadas y control de calidad, alineados con principios reconocidos en ingeniería de software (nombres significativos, responsabilidad única, separación de capas y validación centralizada).

---

## 2. Estructura del proyecto

La organización del código fuente en `src/` responde a una **arquitectura por capas y por dominio funcional**:

```
src/
├── components/       # Interfaz de usuario (presentación)
│   ├── auth/           # Formularios y layout de autenticación
│   ├── chatbot/        # Widget, ventana, mensajes, panel vendedor
│   ├── common/         # UI reutilizable (Button, Input, Card, Navbar…)
│   ├── dashboard/      # Layouts y paneles admin/vendedor
│   └── products/       # Catálogo y CRUD visual de productos
├── hooks/              # Estado y orquestación reutilizable
├── pages/              # Vistas enlazadas al router
├── routes/             # Protección por rol y sesión
├── services/           # Comunicación con Supabase y lógica de negocio remota
├── styles/             # Variables CSS y estilos globales
├── utils/              # Validadores, constantes, formateadores (sin efectos secundarios)
├── admin/              # Paneles del dashboard administrativo
├── social/             # Publicaciones y generador IA
├── chatbot-config/     # Reglas e intenciones del bot
└── tests/              # Pruebas (unit, components, integration)
    ├── unit/
    ├── components/
    ├── integration/
    └── helpers/        # supabaseMock, mockData, testUtils
```

**Criterio:** cada carpeta tiene un propósito único. Los componentes no importan credenciales ni ejecutan consultas SQL directas; eso queda en `services/`.

---

## 3. Separación de responsabilidades

| Capa           | Responsabilidad                                 | Ejemplo                                                                                    |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Pages**      | Componer secciones y conectar hooks             | `CatalogPage.jsx`, `SellerDashboardPage.jsx`                                               |
| **Components** | Renderizar UI y delegar eventos                 | `ProductCard.jsx`, `ChatWindow.jsx`                                                        |
| **Hooks**      | Estado local, efectos, llamadas a servicios     | `useAuth`, `useProducts`, `useAdminProductActions`, `useChatbot`, `useSellerConversations` |
| **Services**   | API Supabase, reglas de negocio persistente     | `authService`, `productService`, `chatbotService`, `orderService`, `socialService`, etc. |
| **Utils**      | Funciones puras: validación, formato, etiquetas | `validators.js`, `productStock.js`, `authErrors.js`                                        |
| **Routes**     | Control de acceso según autenticación y rol     | `ProtectedRoute.jsx`, `RoleRoute.jsx`                                                      |

### 3.1 Principio de responsabilidad única

- **`chatbotEngine.js`:** motor de reglas del bot (sin dependencia de React ni Supabase).
- **`chatbotService.js`:** persistencia de conversaciones, mensajes y handoff.
- **`AuthPageLayout.jsx`:** lógica común de redirección en login/registro, evitando duplicación entre páginas.

### 3.2 Inversión de dependencias en pruebas

Los servicios se **mockean** en Vitest (`authService.test.js`, `productService.test.js`), de modo que las pruebas no requieren red ni base de datos real.

---

## 4. Componentes reutilizables

Se definió una **biblioteca interna de UI** en `components/common/`:

- `Button`, `Input`, `Card`, `Loading`, `ErrorMessage`, `Navbar`, `Footer`, `Layout`

Beneficios:

- Consistencia visual (tema oscuro, tokens en `variables.css`).
- Un solo lugar para cambiar estilos o comportamiento de controles.
- Menor duplicación en formularios (`AuthFormField` envuelve `Input`).

Los layouts de panel (`AdminLayout`, `SellerLayout`) encapsulan cabecera, estadísticas y zona de feedback, dejando las páginas centradas en el dominio (productos, handoff, etc.).

---

## 5. Servicios

Los archivos en `services/` concentran la **integración con Supabase**:

| Servicio                 | Tablas Supabase principales                          |
| ------------------------ | ---------------------------------------------------- |
| `authService.js`         | `profiles`, `roles`                                  |
| `productService.js`      | `products`, `product_categories`, `product_images`   |
| `chatbotService.js`      | `conversations`, `messages`, `handoff_requests`, …   |
| `chatbotRulesService.js` | `chatbot_rules`, `chatbot_intents`                   |
| `chatbotEngine.js`       | Motor local + reglas de `chatbot_rules`              |
| `orderService.js`        | `orders`, `order_details`, `order_statuses`          |
| `socialService.js`       | `social_posts`, `social_platforms`, `ai_generated_contents` |
| `settingsService.js`     | `system_settings`                                    |
| `notificationService.js` | `notifications`                                      |
| `supabaseClient.js`      | Cliente singleton                                    |

**Manejo de errores:** `authService` traduce errores de Supabase Auth mediante `mapAuthError()` en `utils/authErrors.js`, exponiendo mensajes claros al usuario en español.

**Sin `console.log` de depuración:** solo se permite `console.warn` / `console.error` en el cliente de Supabase cuando faltan variables de entorno (desarrollo), regla avalada por ESLint (`no-console`).

---

## 6. Hooks personalizados

| Hook                     | Rol                                                    |
| ------------------------ | ------------------------------------------------------ |
| `useAuth`                | Contexto global de sesión, login, registro, logout     |
| `useProducts`            | Carga y filtrado del catálogo (y listado admin)        |
| `useAdminProductActions` | CRUD de productos en panel admin                       |
| `useChatbot`             | Conversación del cliente, handoff, polling de mensajes |
| `useSellerConversations` | Cola de handoff, atención y respuestas del vendedor    |
| `useChatbotRules`        | CRUD de reglas en panel admin                          |
| `useSocialPosts`         | Publicaciones y generación IA (plantilla)              |
| `useOrders`              | Pedidos (admin, vendedor, cliente)                   |
| `useNotifications`       | Bandeja de notificaciones del usuario                  |
| `useSettings`            | Configuración pública y admin (`system_settings`)    |

Los hooks **orquestan** servicios y estado; los componentes permanecen principalmente declarativos.

---

## 7. Validaciones centralizadas

Toda validación de formularios reside en `utils/validators.js`:

- Correo y contraseña (`isValidEmail`, `isValidPassword`)
- Login y registro (`validateLoginForm`, `validateRegisterForm`)
- Productos (`validateProductForm`, `validatePriceStockUpdate`)

Los formularios (`LoginForm`, `RegisterForm`, `ProductForm`) invocan estas funciones antes de llamar a servicios, garantizando **una sola fuente de verdad** para mensajes de error.

---

## 8. Pruebas implementadas

### 8.1 Pruebas unitarias (`src/tests/unit/`)

| Archivo | Alcance |
| ------- | ------- |
| `validators.test.js` | Email, contraseña, producto, precio, stock |
| `aiContentService.test.js` | Facebook, Instagram, TikTok, WhatsApp, tono, objetivo |
| `chatbotService.test.js` | Compra, handoff, objetivos, fallback, recomendaciones (`chatbotEngine`) |
| `productService.test.js` | Activos, crear, editar, desactivar, stock (mock Supabase) |
| `authService.test.js` | Login, logout, usuario y perfil actual |
| `supabaseClient.test.js` | Exportación del cliente |

### 8.2 Pruebas de componentes (`src/tests/components/`)

| Archivo | Alcance |
| ------- | ------- |
| `AdminDashboardPage.test.jsx` | Menú admin, KPIs, accesos productos/chatbot/redes |
| `AdminProductsPanel.test.jsx` | Listado, formulario, validación, crear producto |
| `AdminSocialPostsPanel.test.jsx` | Manual, IA, editar texto generado |
| `AdminChatbotPanel.test.jsx` | Reglas, crear regla, preview |
| `ProductCard.test.jsx` | Datos, stock bajo, agotado |
| `ChatWidget.test.jsx` | Abrir chat, enviar, respuesta, detección compra/handoff |

### 8.3 Pruebas de integración (`src/tests/integration/`)

| Archivo | Alcance |
| ------- | ------- |
| `servicesLayer.test.js` | Capa de servicios con mock compartido de Supabase |

**Configuración:** `vite.config.js` (Vitest + jsdom + cobertura v8), `src/tests/setup.js`, mocks en `src/tests/helpers/supabaseMock.js`.

**Resultado actual:** 197 pruebas, 36 archivos, 100 % aprobadas (`npm run test`). Cobertura con umbrales en `vite.config.js` (≥ 60 % líneas en módulos priorizados).

### 8.3 Cómo ejecutar las pruebas

Desde la raíz de `suplementos-app`:

```bash
# Ejecutar toda la suite una vez
npm run test

# Modo observación (desarrollo)
npm run test:watch

# Informe de cobertura (carpeta coverage/)
npm run test:coverage
```

### 8.4 Compilación de producción

```bash
npm run build
```

---

## 9. Herramientas de calidad de código

### 9.1 ESLint (React y buenas prácticas)

Archivo: `eslint.config.js` (formato flat config, ESLint 10).

- Reglas recomendadas de JavaScript.
- **React:** JSX válido, variables usadas en JSX, sin prop-types obligatorios (proyecto JS).
- **React Hooks:** dependencias y reglas de hooks.
- **React Refresh:** compatibilidad con Vite.
- **Integración Prettier:** sin conflictos de estilo.
- Entorno **Vitest** en archivos `*.test.js(x)`.

### 9.2 Prettier

Archivo: `.prettierrc` — comillas simples, punto y coma, ancho 90, final de línea LF.

### 9.3 Scripts en `package.json`

| Script                  | Descripción                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run lint`          | Analiza el código; falla si hay errores o advertencias (`--max-warnings 0`) |
| `npm run lint:fix`      | Corrige automáticamente lo que ESLint permita                               |
| `npm run format`        | Formatea con Prettier                                                       |
| `npm run format:check`  | Verifica formato sin escribir archivos                                      |
| `npm run test`          | Ejecuta Vitest                                                              |
| `npm run test:coverage` | Pruebas + cobertura V8                                                      |
| `npm run build`         | Build de producción Vite                                                    |

### 9.4 Cómo verificar calidad con lint y formato

```bash
# Calidad estática (debe terminar sin errores)
npm run lint

# Formato consistente
npm run format:check

# Aplicar formato automáticamente
npm run format

# Calidad + pruebas + compilación (recomendado antes de entregar)
npm run lint && npm run test && npm run build
```

---

## 10. Evidencia de aplicación de principios de código limpio

| Principio                      | Implementación en el proyecto                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nombres claros**             | Funciones con verbos (`fetchPendingConversations`, `detectPurchaseIntent`); componentes con sustantivos (`ConversationList`, `SellerReplyBox`) |
| **Funciones pequeñas**         | Validadores y formateadores aislados; motor del chatbot separado del servicio de persistencia                                                  |
| **Componentes reutilizables**  | `components/common/*`, `AuthPageLayout`, layouts de dashboard                                                                                  |
| **Separación lógica / vista**  | Hooks + services vs JSX en components/pages                                                                                                    |
| **Servicios separados**        | Capa `services/` sin JSX                                                                                                                       |
| **Sin duplicación**            | Layout de auth unificado; constantes en `utils/constants.js`; eliminación de componentes obsoletos no referenciados                            |
| **Sin logs innecesarios**      | Regla ESLint `no-console` (solo warn/error permitidos)                                                                                         |
| **Manejo de errores**          | `mapAuthError`, `ErrorMessage`, try/catch en hooks con feedback al usuario                                                                     |
| **Validaciones centralizadas** | `validators.js` usado por todos los formularios                                                                                                |

---

## 11. Conclusión

El proyecto NutriStore demuestra una implementación **modular, probada y verificable**, adecuada para un entorno académico y profesional. La combinación de arquitectura en capas, pruebas automatizadas (unitarias y de componentes), lint estricto y formateo uniforme constituye evidencia tangible de **código limpio** y de procesos de aseguramiento de calidad aplicados de forma sistemática durante el desarrollo de la tesis.

---

## 12. Despliegue

- Configuración SPA en `vercel.json` (rewrite a `index.html`).
- Variables `VITE_SUPABASE_*` documentadas en `.env.example` y `README.md`.
- Verificación previa: `npm run lint && npm run test && npm run build`.

---

_Documento generado como evidencia técnica del repositorio `suplementos-app`. Última revisión: 197 pruebas Vitest (36 archivos), cobertura ≥ 60 % (alcance priorizado), ESLint sin advertencias, build Vite en `dist/`._
