# Mockups visuales del sistema NutriStore

**Proyecto de tesis:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Aplicación:** `suplementos-app` (React + Vite)  
**Ruta de la galería:** `/mockups`  
**Fecha de referencia:** Mayo 2026

---

## 1. Objetivo de los mockups

Los mockups son **diseños visuales estáticos** de las pantallas principales de NutriStore. Su apariencia es similar a **capturas de Figma** o **wireframes de alta fidelidad**: representan la propuesta de interfaz como **imágenes de pantalla**, no como páginas funcionales.

En el marco de la tesis cumplen tres funciones:

1. **Documentar la propuesta de diseño** antes y durante la implementación.
2. **Servir como evidencia académica** de usabilidad, coherencia visual y cobertura de casos de uso.
3. **Permitir exportación** (PNG o PDF) para anexos, presentaciones y defensa.

**Importante:** los mockups **no** ejecutan lógica, **no** consultan Supabase, **no** contienen formularios funcionales ni botones interactivos. Todo el contenido usa elementos visuales simulados (`span`, `div`) con `pointer-events: none`.

---

## 2. Pantallas diseñadas

| # | Pantalla | Componente | Marco |
| - | -------- | ---------- | ----- |
| 1 | Login | `LoginMockup.jsx` | Desktop (navegador) |
| 2 | Registro | `RegisterMockup.jsx` | Desktop |
| 3 | Home | `HomeMockup.jsx` | Desktop |
| 4 | Catálogo | `CatalogMockup.jsx` | Desktop |
| 5 | Chatbot flotante | `CatalogMockup.jsx` (overlay) | Desktop |
| 6 | Dashboard admin | `AdminDashboardMockup.jsx` | Desktop |
| 7 | Gestión de productos | `ProductManagementMockup.jsx` | Desktop |
| 8 | Inventario | `InventoryMockup.jsx` | Desktop |
| 9 | Publicaciones IA | `SocialAIMockup.jsx` | Desktop |
| 10 | Config. chatbot | `ChatbotConfigMockup.jsx` | Desktop |
| 11 | Panel vendedor | `SellerPanelMockup.jsx` | Desktop |
| 12 | Handoff humano | `HandoffMockup.jsx` | Desktop |
| 13 | Vista móvil | `MobileMockup.jsx` | **Dispositivo móvil** |
| 14 | Evidencia calidad | `QualityEvidenceMockup.jsx` | Desktop |

**Infraestructura visual:**

| Archivo | Función |
| ------- | ------- |
| `MockupFrame.jsx` | Marco tipo navegador o teléfono |
| `MockupCard.jsx` | Tarjeta de galería con título y exportación PNG |
| `mockupUi.jsx` | Componentes visuales simulados (tablas, botones, gráficos) |
| `mockupData.js` | Datos estáticos de ejemplo |
| `MockupsPage.jsx` | Galería en `/mockups` |
| `mockups.css` | Estilos de galería y diseño Figma-like |

---

## 3. Relación con requisitos funcionales

| Requisito | Mockups | Módulo implementado |
| --------- | ------- | --------------------- |
| **RF-01** Autenticación | Login, Registro | `authService`, `useAuth` |
| **RF-02** Navegación | Home, Catálogo | `HomePage`, `CatalogPage` |
| **RF-03** Productos | Catálogo, Gestión productos | `productService`, `AdminProductsPanel` |
| **RF-04** Chatbot híbrido | Chatbot flotante, Config. chatbot | `chatbotEngine`, `chatbotService` |
| **RF-05** Panel admin | Dashboard admin | `AdminDashboardPage` |
| **RF-06** Inventario | Inventario | `inventoryService`, `AdminInventoryPanel` |
| **RF-07** Redes e IA | Publicaciones IA | `socialService`, `aiContentService` |
| **RF-08** Handoff | Panel vendedor, Handoff | `handoffService`, `SellerDashboardPage` |
| **RF-09** Calidad | Evidencia pruebas/código limpio | Vitest, ESLint, Sonar, docs |
| **RF-10** Responsive | Vista móvil | CSS responsive del sistema real |

---

## 4. Criterios de usabilidad

Los mockups aplican criterios alineados con **ISO/IEC 25010 (usabilidad)**:

| Criterio | Aplicación |
| -------- | ---------- |
| **Reconocibilidad** | Iconografía fitness, categorías de suplementos, marca NutriStore |
| **Consistencia** | Paleta verde / naranja / negro / blanco en todos los marcos |
| **Jerarquía visual** | Títulos, subtítulos, badges de estado, KPIs |
| **Feedback simulado** | Estados de chatbot, stock bajo, handoff pendiente |
| **Eficiencia percibida** | Sidebar admin, toolbar de catálogo, cola de vendedor |
| **Prevención de errores** | Etiquetas visibles en campos simulados de login/registro |

---

## 5. Diseño responsive

- **Desktop:** marco de navegador con barra de URL, puntos de control (rojo/amarillo/verde) y pantalla ancha (hasta 920 px).
- **Móvil:** marco de dispositivo con notch, barra de estado y botón home simulado; ancho ~320 px.

El mockup móvil (`MobileMockup.jsx`) evidencia la **intención responsive** del home. La implementación real utiliza CSS fluido en `HomePage.css`, `CatalogPage.css` y componentes comunes.

---

## 6. Cómo tomar capturas para el informe

### Acceso

```powershell
npm.cmd run dev
```

Abrir: `http://localhost:5173/mockups`

### Botones de la galería

| Botón | Acción |
| ----- | ------ |
| **Ver mockups** | Desplaza a la galería de diseños |
| **Capturar evidencia** | Abre diálogo de impresión → guardar como PDF |
| **Volver al sistema** | Regresa al home funcional (`/`) |

### Por cada mockup

1. Clic en **Descargar PNG** (sobre el marco del diseño) → exporta con `html-to-image`.
2. Archivos con nombre descriptivo, por ejemplo: `mockup-login.png`, `mockup-admin-dashboard.png`.
3. Nombrar capturas para anexos: `Figura-01-login.png`, `Figura-02-catalogo.png`, etc.
4. Incluir leyenda con requisito funcional (RF-01, RF-04, …).

### Recomendación para la memoria

- Adjuntar **14 capturas** (una por pantalla obligatoria).
- Incluir al menos **1 captura desktop** y **1 móvil** en el cuerpo del documento.
- Citar la ruta `/mockups` y este documento como fuente de diseño.

---

## 7. Conclusión académica

La galería de mockups de NutriStore constituye **evidencia de diseño de interfaz** alineada con los requisitos funcionales de la tesis. Al presentarse como **imágenes visuales estáticas** — con marcos tipo Figma, datos simulados y ausencia total de dependencias de backend — garantizan **reproducibilidad** y **claridad conceptual** para el jurado.

Las catorce pantallas cubren el ciclo del usuario: autenticación, catálogo, chatbot, administración, inventario, redes sociales con IA, handoff humano, responsive móvil y evidencia de calidad de software. Su coherencia cromática (verde nutricional, acentos naranja, fondo oscuro profesional) refleja la identidad de una **tienda de suplementos nutricionales** y la coherencia con la implementación real del prototipo.

La posibilidad de exportar PNG o PDF refuerza la **trazabilidad** entre diseño, implementación y documentación (`docs/CODIGO_LIMPIO.md`, `docs/EVIDENCIAS_CALIDAD_DESPLIEGUE.md`), integrando la dimensión visual en el conjunto de artefactos de calidad del proyecto de tesis.

---

## Referencias internas

- [`docs/ARQUITECTURA.md`](ARQUITECTURA.md)
- [`docs/MODULOS_IMPLEMENTADOS.md`](MODULOS_IMPLEMENTADOS.md)
- [`docs/EVIDENCIAS_CALIDAD_DESPLIEGUE.md`](EVIDENCIAS_CALIDAD_DESPLIEGUE.md)
- `src/pages/MockupsPage.jsx`
