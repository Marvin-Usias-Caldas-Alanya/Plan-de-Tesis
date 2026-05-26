# Reporte de pruebas de software

**Proyecto de tesis:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Sistema evaluado:** NutriStore — aplicación web (`suplementos-app`)  
**Fecha de referencia:** Mayo 2026  
**Resultado global:** 197 pruebas ejecutadas — **197 aprobadas** (36 archivos de prueba)

---

## 1. Introducción

El presente reporte documenta las actividades de **pruebas de software** aplicadas al sistema web NutriStore, desarrollado como soporte tecnológico del proyecto de tesis. Las pruebas tienen como finalidad **validar la funcionalidad**, la **confiabilidad** y la **mantenibilidad** del producto antes de su uso en escenarios académicos y de demostración.

Se verificaron, entre otros aspectos:

- Flujos de autenticación y control de acceso por rol.
- Validación de formularios y reglas de negocio del catálogo.
- Motor del chatbot (intenciones, recomendaciones y handoff humano).
- Componentes de interfaz críticos para el usuario final.
- Integración con Supabase mediante mocks, sin dependencia de red en la suite automatizada.

La ejecución repetible de la suite — junto con herramientas de análisis estático y formateo — constituye evidencia de que el código cumple criterios de calidad definidos en `docs/CODIGO_LIMPIO.md`.

---

## 2. Herramientas utilizadas

| Herramienta                     | Propósito en el proyecto                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Vitest**                      | Framework de pruebas unitarias y de integración ligera; ejecutor compatible con Vite y ESM.                          |
| **React Testing Library**       | Pruebas de componentes orientadas al comportamiento visible para el usuario (accesibilidad, eventos, renderizado).   |
| **@testing-library/user-event** | Simulación realista de interacción (clic, escritura en formularios).                                                 |
| **@testing-library/jest-dom**   | Aserciones semánticas (`toBeInTheDocument`, `toBeDisabled`, etc.).                                                   |
| **jsdom**                       | Entorno de navegador simulado para pruebas de componentes React.                                                     |
| **ESLint**                      | Análisis estático: JavaScript, JSX, React Hooks y reglas de calidad (`npm run lint`).                                |
| **Prettier**                    | Formato uniforme del código fuente (`npm run format`).                                                               |
| **Mocks de Supabase**           | Sustitución del cliente `supabase` en pruebas de `authService` y `productService` (`tests/helpers/supabaseMock.js`). |
| **@vitest/coverage-v8**         | Medición de cobertura de código (`npm run test:coverage`).                                                           |

**Configuración:** `vite.config.js` (bloque `test`), `eslint.config.js`, `.prettierrc`, `src/tests/setup.js`.

---

## 3. Tipos de pruebas implementadas

### 3.1 Pruebas unitarias (`src/tests/unit/`)

| Archivo | Casos obligatorios cubiertos |
| ------- | ---------------------------- |
| `validators.test.js` | Email, contraseña, producto, precio, stock |
| `aiContentService.test.js` | Facebook, Instagram, TikTok, WhatsApp, tono, objetivo |
| `chatbotService.test.js` | Compra, handoff, objetivos, fallback, recomendación |
| `productService.test.js` | Activos, crear, editar, desactivar, stock |
| `authService.test.js` | Login, logout, usuario actual, perfil |
| `supabaseClient.test.js` | Configuración del cliente |

### 3.2 Pruebas de componentes (`src/tests/components/`)

| Archivo | Casos obligatorios cubiertos |
| ------- | ---------------------------- |
| `AdminDashboardPage.test.jsx` | Menú, KPIs, acceso productos/chatbot/redes |
| `AdminProductsPanel.test.jsx` | Listado, formulario, validación, crear |
| `AdminSocialPostsPanel.test.jsx` | Manual, IA, editar texto |
| `AdminChatbotPanel.test.jsx` | Reglas, crear regla, preview |
| `ProductCard.test.jsx` | Datos, stock bajo, agotado |
| `ChatWidget.test.jsx` | Abrir, enviar, respuesta, compra/handoff |

### 3.3 Pruebas de integración (`src/tests/integration/`)

- `servicesLayer.test.js`: capa de servicios con mock Supabase compartido (`supabaseMock.js`).

### 3.4 Mocks de Supabase

El archivo `src/tests/helpers/supabaseMock.js` implementa un cliente encadenable (`from().select().eq()…`) para que **auth** y **productos** no dependan de la base real durante la CI local o académica.

---

## 4. Casos de prueba

**Leyenda de estado:** _Aprobado_ = la prueba se ejecutó correctamente en la última corrida de `npm run test`.

### 4.1 Autenticación e interfaz de acceso

| Código | Módulo        | Caso probado                                  | Resultado esperado                                                | Estado   |
| ------ | ------------- | --------------------------------------------- | ----------------------------------------------------------------- | -------- |
| CP-01  | Autenticación | Login con credenciales válidas                | Se invoca `login` con correo y contraseña; acceso permitido       | Aprobado |
| CP-02  | Autenticación | Login con campos vacíos                       | Mensajes de error en correo y contraseña; no se llama al servicio | Aprobado |
| CP-03  | Autenticación | Renderizado de campos en LoginPage            | Visibles correo, contraseña y botón de envío                      | Aprobado |
| CP-04  | Autenticación | LoginPage en estado loading                   | Muestra indicador de carga                                        | Aprobado |
| CP-05  | Autenticación | Registro con datos válidos                    | Se invoca `register` con nombre, correo y contraseña              | Aprobado |
| CP-06  | Autenticación | Registro con contraseñas distintas            | Error «Las contraseñas no coinciden»                              | Aprobado |
| CP-07  | Autenticación | Registro con correo inválido                  | Error de formato de correo electrónico                            | Aprobado |
| CP-08  | Autenticación | Renderizado de campos en RegisterPage         | Visibles nombre, correo, contraseña y confirmación                | Aprobado |
| CP-09  | Servicio auth | Login con correo recortado                    | `signInWithPassword` recibe correo sin espacios                   | Aprobado |
| CP-10  | Servicio auth | Credenciales inválidas                        | Mensaje «Correo o contraseña incorrectos»                         | Aprobado |
| CP-11  | Servicio auth | Error de red en login                         | Mensaje de conexión al servidor                                   | Aprobado |
| CP-12  | Servicio auth | Correo ya registrado                          | Mensaje indicando inicio de sesión                                | Aprobado |
| CP-13  | Servicio auth | Contraseña débil en registro                  | Mensaje de requisitos de seguridad                                | Aprobado |
| CP-14  | Servicio auth | Logout exitoso                                | `signOut` sin error                                               | Aprobado |
| CP-15  | Rutas         | Redirección por rol (admin, seller, customer) | Ruta por defecto correcta según rol                               | Aprobado |
| CP-16  | Rutas         | Control de acceso por rol                     | `canAccessRoute` coherente con permisos                           | Aprobado |

### 4.2 Rutas protegidas y seguridad de navegación

| Código | Módulo         | Caso probado                    | Resultado esperado             | Estado   |
| ------ | -------------- | ------------------------------- | ------------------------------ | -------- |
| CP-17  | ProtectedRoute | Usuario no autenticado          | Redirección a página de login  | Aprobado |
| CP-18  | ProtectedRoute | Usuario autenticado             | Renderizado del contenido hijo | Aprobado |
| CP-19  | ProtectedRoute | Verificación de sesión en curso | Mensaje «Verificando sesión…»  | Aprobado |

### 4.3 Validación de datos

| Código | Módulo     | Caso probado                        | Resultado esperado                     | Estado   |
| ------ | ---------- | ----------------------------------- | -------------------------------------- | -------- |
| CP-20  | Validación | Correo electrónico válido           | `isValidEmail` retorna verdadero       | Aprobado |
| CP-21  | Validación | Correo electrónico inválido         | `isValidEmail` retorna falso           | Aprobado |
| CP-22  | Validación | Contraseña con longitud mínima      | Acepta ≥ 6 caracteres                  | Aprobado |
| CP-23  | Validación | Nombre con mínimo 2 caracteres      | `isValidName` tras recorte de espacios | Aprobado |
| CP-24  | Validación | Producto con precio y stock válidos | Formulario válido sin errores          | Aprobado |
| CP-25  | Validación | Precio ≤ 0 o no numérico            | Error en campo precio                  | Aprobado |
| CP-26  | Validación | Stock negativo                      | Error en campo stock                   | Aprobado |
| CP-27  | Validación | Categoría obligatoria en producto   | Error si `category_id` vacío           | Aprobado |
| CP-28  | Validación | Actualización rápida precio/stock   | Rechaza valores fuera de rango         | Aprobado |

### 4.4 Catálogo y productos

| Código | Módulo             | Caso probado                              | Resultado esperado                              | Estado   |
| ------ | ------------------ | ----------------------------------------- | ----------------------------------------------- | -------- |
| CP-29  | ProductCard        | Visualización de nombre, precio y stock   | Datos visibles en la tarjeta                    | Aprobado |
| CP-30  | ProductCard        | Stock igual a 0                           | Etiqueta «Agotado» y botón compra deshabilitado | Aprobado |
| CP-31  | ProductCard        | Stock menor o igual a 5                   | Etiqueta «Stock bajo»                           | Aprobado |
| CP-32  | ProductCard        | Botón «Consultar por chatbot»             | Ejecuta callback con el producto                | Aprobado |
| CP-33  | Stock              | Clasificación disponible / bajo / agotado | Estados coherentes con umbral                   | Aprobado |
| CP-34  | Servicio productos | `getActiveProducts` solo activos          | Filtro `is_active = true` y mapeo correcto      | Aprobado |
| CP-35  | Servicio productos | Filtros por categoría y búsqueda          | Parámetros `eq` e `ilike` aplicados             | Aprobado |
| CP-36  | Servicio productos | `createProduct`                           | Inserción y producto mapeado                    | Aprobado |
| CP-37  | Servicio productos | `updateProduct`                           | Actualización por id                            | Aprobado |
| CP-38  | Servicio productos | `deleteProduct`                           | Eliminación por id                              | Aprobado |
| CP-39  | Servicio productos | Error de Supabase en consulta             | Excepción propagada al llamador                 | Aprobado |

### 4.5 Chatbot e handoff humano

| Código | Módulo     | Caso probado                     | Resultado esperado                           | Estado   |
| ------ | ---------- | -------------------------------- | -------------------------------------------- | -------- |
| CP-40  | Chatbot    | Detección de intención de compra | Frases como «quiero comprar» detectadas      | Aprobado |
| CP-41  | Chatbot    | Detección de handoff humano      | Frases de vendedor o ayuda humana detectadas | Aprobado |
| CP-42  | Chatbot    | Saludo del usuario               | Respuesta con intent `greeting`              | Aprobado |
| CP-43  | Chatbot    | Recomendación por masa muscular  | Productos de proteína/creatina sugeridos     | Aprobado |
| CP-44  | Chatbot    | Recomendación por bajar de peso  | Productos relacionados sugeridos             | Aprobado |
| CP-45  | Chatbot    | Catálogo vacío para un objetivo  | Mensaje sin productos y oferta de vendedor   | Aprobado |
| CP-46  | Chatbot    | Consulta de precio de producto   | Listado con precios formateados              | Aprobado |
| CP-47  | Handoff    | Mensaje fijo al cliente          | Texto de derivación a vendedor humano        | Aprobado |
| CP-48  | Handoff    | Último mensaje por conversación  | Se selecciona el mensaje más reciente        | Aprobado |
| CP-49  | ChatWidget | Usuario no autenticado           | Widget no se renderiza                       | Aprobado |
| CP-50  | ChatWidget | Abrir y cerrar panel             | Toggle muestra/oculta ventana de chat        | Aprobado |
| CP-51  | ChatWidget | Enviar mensaje del usuario       | Invoca `sendUserMessage` con el texto        | Aprobado |
| CP-52  | ChatWidget | Mostrar respuesta del bot        | Mensajes del asistente visibles en el panel  | Aprobado |
| CP-53  | ChatWidget | Estado de carga                  | Indicador «Escribiendo…» visible             | Aprobado |
| CP-54  | ChatWidget | Inicialización al abrir          | Se llama `initConversation`                  | Aprobado |

### 4.6 Infraestructura y componentes base

| Código | Módulo          | Caso probado                          | Resultado esperado                          | Estado   |
| ------ | --------------- | ------------------------------------- | ------------------------------------------- | -------- |
| CP-55  | UI común        | Button renderiza y respeta `disabled` | Comportamiento de botón base                | Aprobado |
| CP-56  | Constantes      | Roles y rutas definidos               | Valores esperados en `constants.js`         | Aprobado |
| CP-57  | Constantes      | Estados de conversación               | `bot`, `pending_handoff`, `human`, `closed` | Aprobado |
| CP-58  | Supabase client | Exportación del cliente y helpers     | Módulo configurado correctamente            | Aprobado |
| CP-59  | Errores auth    | Traducción de credenciales inválidas  | Mensaje en español para el usuario          | Aprobado |

### 4.7 Resumen cuantitativo de la suite

| Métrica                                       | Valor                                           |
| --------------------------------------------- | ----------------------------------------------- |
| Archivos de prueba                            | 36                                              |
| Casos de prueba (Vitest)                      | 197                                             |
| Casos documentados en tablas (CP-01 a CP-59)  | 59 escenarios representativos + paneles admin   |
| Tasa de aprobación                            | 100 %                                           |
| Cobertura (alcance priorizado, `test:coverage`) | **Líneas 76,6 %** · Statements 73,4 % · Functions 72,3 % · Branches 62 % |
| Umbrales mínimos (`vite.config.js`)           | Líneas/Statements/Functions ≥ 60 % · Branches ≥ 50 % |
| Cobertura destacada                           | `chatbotEngine.js`, `productService.js`, `aiContentService.js`, hooks `useAuth`/`useChatbot` |

> El alcance de cobertura se centra en **servicios, utilidades, hooks, rutas y módulos UI priorizados** para la tesis (véase `include`/`exclude` en `vite.config.js`). Paneles admin secundarios sin prueba dedicada quedan fuera del umbral global.

---

## 5. Comandos utilizados

Los siguientes comandos se ejecutaron desde la raíz del proyecto `suplementos-app` para verificar calidad y funcionamiento:

```bash
# Análisis estático (cero errores y cero advertencias)
npm run lint

# Suite completa de pruebas automatizadas
npm run test

# Pruebas con informe de cobertura (carpeta coverage/)
npm run test:coverage

# Compilación de producción (verifica que el proyecto construye sin errores)
npm run build
```

**Comandos complementarios recomendados:**

```bash
npm run format:check   # Verificar formato Prettier
npm run lint:fix       # Corrección automática ESLint cuando aplique
npm run test:watch     # Desarrollo con re-ejecución de pruebas
```

**Resultado de la última verificación registrada:**

| Comando                 | Resultado                       |
| ----------------------- | ------------------------------- |
| `npm run lint`          | Exitoso (`--max-warnings 0`)    |
| `npm run test`          | 197/197 pruebas aprobadas       |
| `npm run test:coverage` | Informe generado en `coverage/` |
| `npm run build`         | Build de producción exitoso     |

---

## 6. Evidencia esperada

La **aprobación sistemática** de las pruebas automatizadas, combinada con el cumplimiento del lint y la compilación exitosa, demuestra que el sistema:

1. **Funciona según lo especificado** en los módulos probados (autenticación, catálogo, chatbot, handoff, rutas protegidas).
2. **Mantiene modularidad**: servicios desacoplados de la vista, validadores centralizados y hooks reutilizables.
3. **Facilita el mantenimiento**: cambios futuros pueden validarse reejecutando `npm run test` sin regresiones detectadas en los casos documentados.
4. **Sigue criterios de código limpio** documentados en `docs/CODIGO_LIMPIO.md` (nombres claros, separación de capas, ausencia de `console.log` innecesarios, manejo de errores traducidos).

**Evidencia tangible para la tesis:**

- Salida de consola de Vitest con 197 pruebas en verde.
- Umbrales de cobertura Vitest cumplidos (≥ 60 % líneas en alcance priorizado).
- Reporte HTML de cobertura en `coverage/index.html` (generado con `npm run test:coverage`).
- Casos de prueba trazables (tablas CP-01 a CP-59).
- Correspondencia entre requisitos del sistema híbrido (IA + handoff) y casos CP-40 a CP-54.

---

## 7. Conclusión

Las pruebas implementadas constituyen un mecanismo formal de **aseguramiento de calidad** para el sistema web NutriStore. Mediante Vitest y React Testing Library se validó el comportamiento esperado tanto en la lógica de negocio como en la interacción del usuario; mediante ESLint y Prettier se reforzó la consistencia y legibilidad del código fuente.

Los resultados obtenidos — **197 pruebas aprobadas**, cobertura ≥ 60 % en el alcance definido, análisis estático sin incidencias y build de producción correcto — indican que el prototipo cumple los criterios de funcionamiento definidos para un sistema **híbrido con inteligencia artificial y handoff humano**, en el que el chatbot automatiza la atención inicial y el vendedor interviene cuando el cliente desea comprar o requiere asistencia personalizada.

En términos académicos, la aplicación sistemática de pruebas contribuye a **reducir la probabilidad de defectos en producción**, aumenta la **confiabilidad** percibida por el usuario final y proporciona una base reproducible para futuras extensiones (integración de IA externa, pruebas end-to-end o ampliación de cobertura en paneles administrativos). Por tanto, el proceso de pruebas no solo valida el estado actual del software, sino que **sustenta la calidad y la sostenibilidad** del proyecto de tesis en Ingeniería de Sistemas e Informática.

---

## Referencias internas del repositorio

| Documento / ruta        | Contenido relacionado                                           |
| ----------------------- | --------------------------------------------------------------- |
| `docs/CODIGO_LIMPIO.md` | Principios de código limpio y comandos de calidad             |
| `docs/ARQUITECTURA.md`  | Frontend, Supabase, roles, chatbot, IA, 50 tablas             |
| `docs/MODULOS_IMPLEMENTADOS.md` | Inventario módulo → prueba                          |
| `src/tests/unit/`       | Pruebas unitarias obligatorias                                |
| `src/tests/components/` | Pruebas de componentes admin y catálogo                       |
| `src/tests/integration/`| Integración con mock Supabase                                |
| `vite.config.js`        | Configuración de Vitest y cobertura                             |
| `README.md`             | Guía de instalación y scripts del proyecto                      |

---

_Elaborado como evidencia de pruebas de software del proyecto NutriStore. Los códigos CP-XX pueden citarse en matrices de trazabilidad requisito–prueba de la tesis._
