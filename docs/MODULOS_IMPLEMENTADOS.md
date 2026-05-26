# Módulos implementados — NutriStore

Inventario de módulos funcionales del prototipo, con tablas Supabase, componentes, servicios, estado y evidencia de prueba automatizada.

**Leyenda de estado:** ✅ Implementado y usable | 🟡 Parcial (UI o servicio base) | ⬜ Planificado en esquema

---

## Resumen

| Módulo | Estado | Archivo(s) de prueba |
| ------ | ------ | -------------------- |
| Autenticación | ✅ | `src/tests/unit/authService.test.js` |
| Validaciones | ✅ | `src/tests/unit/validators.test.js` |
| Productos / catálogo | ✅ | `src/tests/unit/productService.test.js`, `ProductCard.test.jsx`, `AdminProductsPanel.test.jsx` |
| Chatbot + motor | ✅ | `src/tests/unit/chatbotService.test.js`, `ChatWidget.test.jsx`, `AdminChatbotPanel.test.jsx` |
| Handoff humano | ✅ | Casos en `chatbotService.test.js` (detección) + panel admin |
| Redes sociales + IA | ✅ | `src/tests/unit/aiContentService.test.js`, `AdminSocialPostsPanel.test.jsx` |
| Dashboard admin | ✅ | `src/tests/components/AdminDashboardPage.test.jsx` |
| Integración servicios | ✅ | `src/tests/integration/servicesLayer.test.js` |
| Cliente Supabase | ✅ | `src/tests/unit/supabaseClient.test.js` |

---

## 1. Autenticación y perfiles

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `profiles`, `roles`, `user_sessions` |
| **Servicios** | `authService.js`, `profileService.js`, `roleService.js` |
| **Hooks** | `useAuth` |
| **Componentes** | `LoginForm`, `RegisterForm`, `AuthPageLayout`, rutas protegidas |
| **Estado** | ✅ Login, logout, registro, perfil actual |
| **Evidencia** | `authService.test.js`: login, logout, `getCurrentUser`, `getCurrentProfile`, registro con mock Supabase |

---

## 2. Validaciones centralizadas

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | — (lógica pura) |
| **Servicios** | — |
| **Utils** | `validators.js` |
| **Estado** | ✅ Email, contraseña, producto, precio, stock |
| **Evidencia** | `validators.test.js`: 5 grupos de casos obligatorios |

---

## 3. Productos y catálogo

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `products`, `product_categories`, `product_images`, `product_variants` |
| **Servicios** | `productService.js`, `categoryService.js`, `inventoryService.js` |
| **Hooks** | `useProducts`, `useAdminProductActions` |
| **Componentes** | `ProductCard`, `ProductForm`, `AdminProductsPanel`, `CatalogPage` |
| **Estado** | ✅ CRUD admin, listado activos, stock |
| **Evidencia** | `productService.test.js`: activos, crear, editar, desactivar, stock; `ProductCard.test.jsx`: datos, stock bajo, agotado; `AdminProductsPanel.test.jsx`: tabla, formulario, validación, crear |

---

## 4. Chatbot (motor + configuración)

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `conversations`, `messages`, `chatbot_rules`, `chatbot_intents`, `chatbot_intent_definitions`, `system_settings` |
| **Servicios** | `chatbotEngine.js`, `chatbotService.js`, `chatbotConfigService.js`, `chatbotRulesService.js` |
| **Utils** | `chatbotFallback.js`, `chatbotGoalRules.js` |
| **Hooks** | `useChatbot`, `useChatbotRules`, `useChatbotConfig` |
| **Componentes** | `ChatWidget`, `ChatWindow`, `AdminChatbotPanel`, `chatbot-config/*` |
| **Estado** | ✅ Motor, reglas BD, intenciones, preview admin, widget cliente |
| **Evidencia** | `chatbotService.test.js`: compra, handoff, objetivos, fallback, recomendaciones; `AdminChatbotPanel.test.jsx`: reglas, crear, preview; `ChatWidget.test.jsx`: abrir, enviar, respuesta, compra/handoff |

---

## 5. Handoff humano

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `handoff_requests`, `seller_assignments`, `conversations` |
| **Servicios** | `handoffService.js` (reexportado en `chatbotService.js`) |
| **Hooks** | `useSellerConversations` |
| **Componentes** | `AdminHandoffPanel`, panel vendedor |
| **Estado** | ✅ Detección automática + solicitud manual en chat |
| **Evidencia** | `chatbotService.test.js`: `detectHumanHandoffIntent`, respuestas con `shouldHandoff`; `ChatWidget.test.jsx`: badge «Handoff solicitado» |

---

## 6. Redes sociales e IA de contenido

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `social_platforms`, `social_posts`, `social_campaigns`, `ai_generated_contents`, `social_metrics` |
| **Servicios** | `socialService.js`, `aiContentService.js`, `socialMediaService.js` |
| **Hooks** | `useSocialPublications` |
| **Componentes** | `AdminSocialPostsPanel`, `AIGeneratorPanel`, `SocialPostForm`, `SocialPostTable` |
| **Estado** | ✅ Publicación manual, generación IA simulada, edición previa a guardar |
| **Evidencia** | `aiContentService.test.js`: Facebook, Instagram, TikTok, WhatsApp, tonos, objetivos; `AdminSocialPostsPanel.test.jsx`: manual, IA, editar texto |

---

## 7. Panel de administración

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | Varias (métricas agregadas vía servicios) |
| **Servicios** | `adminService.js`, `auditService.js`, `settingsService.js`, … |
| **Componentes** | `AdminDashboardPage`, `AdminOverviewPanel`, paneles por sección en `adminMenu.js` |
| **Estado** | ✅ Navegación modular; KPIs en resumen |
| **Evidencia** | `AdminDashboardPage.test.jsx`: menú, tarjetas, acceso productos/chatbot/redes |

---

## 8. Pedidos, ventas y pagos

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `orders`, `order_details`, `sales`, `payments`, `carts`, `cart_items` |
| **Servicios** | `orderService.js`, `salesService.js`, `paymentService.js`, `cartService.js` |
| **Hooks** | `useOrders` |
| **Estado** | 🟡 Servicios y paneles admin base; sin suite dedicada en esta entrega |
| **Evidencia** | Cobertura parcial vía integración; ampliación futura recomendada |

---

## 9. Proveedores, compras e inventario

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `suppliers`, `purchases`, `inventory_movements`, `stock_entries` |
| **Servicios** | `supplierService.js`, `purchaseService.js`, `inventoryService.js` |
| **Estado** | 🟡 Paneles genéricos admin |
| **Evidencia** | — |

---

## 10. Promociones, tickets, notificaciones, auditoría

| Aspecto | Detalle |
| ------- | ------- |
| **Tablas** | `promotions`, `coupons`, `support_tickets`, `notifications`, `audit_logs`, `error_logs` |
| **Servicios** | `ticketService.js`, `notificationService.js`, `auditService.js`, `errorLogService.js` |
| **Estado** | 🟡 Estructura en BD y servicios; UI admin parcial |
| **Evidencia** | — |

---

## Infraestructura de pruebas (transversal)

| Recurso | Ubicación |
| ------- | --------- |
| Setup Vitest + jest-dom | `src/tests/setup.js` |
| Mock Supabase encadenable | `src/tests/helpers/supabaseMock.js` |
| Datos de prueba | `src/tests/helpers/mockData.js` |
| Router en tests | `src/tests/helpers/testUtils.jsx` |
| Configuración | `vite.config.js` → `include`: unit, components, integration |

**Comandos de evidencia:** `npm run lint`, `npm run test`, `npm run test:coverage`, `npm run build` — todos deben finalizar sin error.

---

## Trazabilidad requisito → prueba (tesis)

| Requisito tesis | Módulo | Prueba representativa |
| --------------- | ------ | --------------------- |
| IA en atención al cliente | Chatbot | `chatbotService.test.js`, `ChatWidget.test.jsx` |
| Handoff a humano | Handoff | `detectHumanHandoffIntent`, `ChatWidget` handoff badge |
| IA en redes sociales | Redes + IA | `aiContentService.test.js` |
| Gestión de productos | Productos | `productService.test.js`, `AdminProductsPanel` |
| Panel administrativo | Admin | `AdminDashboardPage.test.jsx` |
| Calidad de software | Transversal | `REPORTE_PRUEBAS.md`, ESLint, cobertura |

---

_Documento alineado con la suite Vitest de 197 pruebas (36 archivos) y cobertura ≥ 60 % — mayo 2026._
