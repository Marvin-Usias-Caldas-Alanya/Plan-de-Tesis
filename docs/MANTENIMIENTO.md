# Plan de mantenimiento — NutriStore

**Proyecto:** Sistema híbrido con IA y handoff humano — tienda de suplementos nutricionales  
**Aplicación:** `suplementos-app`  
**Objetivo del documento:** Mantener la aplicación **operativa, segura y evolutiva** después de la tesis y durante demostraciones en producción.

---

## 1. Introducción

Un prototipo de tesis deja de ser útil si no se **mantiene**: dependencias obsoletas, cambios en Supabase/Vercel o regresiones sin pruebas pueden dejar la app fuera de servicio. Este plan define rutinas, herramientas y responsabilidades para que NutriStore siga **“on fire”** — estable, demostrable y listo para mejoras incrementales.

---

## 2. Principios de mantenimiento

| Principio | Descripción |
| --------- | ----------- |
| **Automatizar antes de manual** | Ejecutar `npm run quality` antes de cada entrega. |
| **No romper producción** | Probar en local y Preview de Vercel antes de merge a `main`. |
| **Secretos fuera del repo** | Solo `.env` local y variables en Vercel/Supabase. |
| **Documentar cada cambio relevante** | Actualizar `docs/` cuando se agreguen módulos o APIs. |
| **Medir calidad** | Lint, cobertura y Sonar como termómetro periódico. |

---

## 3. Inventario de componentes a mantener

| Capa | Tecnología | Dónde se administra |
| ---- | ---------- | ------------------- |
| Frontend | React + Vite | GitHub, Vercel |
| Backend | Supabase (PostgreSQL, Auth, RLS) | [supabase.com](https://supabase.com) dashboard |
| DNS / HTTPS | Vercel | Proyecto Vercel |
| Calidad | ESLint, Vitest, SonarCloud | Local + SonarCloud |
| Diseño evidencia | Mockups `/mockups` | Repo `src/components/mockups/` |
| Documentación | Markdown en `docs/` | Repositorio Git |

---

## 4. Rutina de mantenimiento

### 4.1 Antes de cada cambio (desarrollador)

```powershell
npm.cmd run quality
```

Equivale a: **lint** → **test:coverage** → **build**.

Si falla algún paso, **no desplegar** hasta corregir.

### 4.2 Semanal (15–30 min)

| Tarea | Acción |
| ----- | ------ |
| Verificar app en producción | Abrir URL Vercel, login, catálogo, chatbot |
| Revisar Supabase | Proyecto activo (no pausado), sin errores críticos en logs |
| Ejecutar pruebas | `npm.cmd run test` |
| Revisar dependencias | `npm outdated` (sin actualizar a ciegas) |

### 4.3 Mensual (1–2 h)

| Tarea | Acción |
| ----- | ------ |
| Actualizar dependencias menores | `npm update` + `npm run quality` |
| SonarCloud | `npm.cmd run sonar` (con `SONAR_TOKEN` local) |
| Backup lógico BD | Export SQL o backup Supabase |
| Revisar usuarios de prueba | Rotar contraseñas si se expusieron en demos |
| Documentación | Actualizar `MODULOS_IMPLEMENTADOS.md` si hubo cambios |

### 4.4 Trimestral

| Tarea | Acción |
| ----- | ------ |
| Actualización mayor Node/npm | Probar en rama aparte |
| Auditoría RLS Supabase | Revisar políticas en tablas nuevas |
| Revisar costos Vercel/Supabase | Plan free vs. límites de uso |
| Retrospectiva calidad | Comparar cobertura y deuda Sonar |

### 4.5 Antes de defensa de tesis

- [ ] `npm.cmd run quality` OK  
- [ ] URL Vercel operativa  
- [ ] Supabase Auth URLs configuradas  
- [ ] Capturas mockups PNG actualizadas  
- [ ] `docs/EVIDENCIAS_CALIDAD_DESPLIEGUE.md` revisado  
- [ ] Usuarios demo (admin/vendedor/cliente) verificados  

---

## 5. Mantenimiento del código frontend

### 5.1 Estructura a respetar

No romper la arquitectura por capas documentada en `docs/CODIGO_LIMPIO.md`:

```
pages → hooks → services → Supabase
components (solo UI)
utils (funciones puras)
```

### 5.2 Agregar un módulo nuevo

1. Servicio en `src/services/`.
2. Hook si hay estado compartido.
3. Componentes/página.
4. Pruebas en `src/tests/`.
5. Entrada en `docs/MODULOS_IMPLEMENTADOS.md`.
6. Mockup opcional en `/mockups`.

### 5.3 Refactor seguro

1. Crear rama Git: `refactor/nombre-modulo`.
2. Mantener tests verdes en cada commit.
3. PR o revisión manual antes de merge a `main`.

---

## 6. Mantenimiento de Supabase

### 6.1 Migraciones

- Cambios de esquema **solo** vía `supabase/migrations/` (no editar producción a mano sin script).
- Orden: desarrollo local → prueba → aplicar en proyecto cloud.

### 6.2 Row Level Security

Al crear tablas nuevas:

1. `ENABLE ROW LEVEL SECURITY`.
2. Políticas por rol (`admin`, `seller`, `customer`).
3. Probar con usuarios de cada rol.

### 6.3 Auth y URLs

Tras cambiar dominio Vercel:

1. Supabase → **Authentication** → **URL Configuration**.
2. Actualizar **Site URL** y **Redirect URLs**.
3. Redeploy frontend.

### 6.4 Backups

| Método | Frecuencia |
| ------ | ---------- |
| Export SQL manual (SQL Editor) | Antes de migraciones grandes |
| Backups automáticos Supabase (plan Pro) | Según plan contratado |
| Copia de `schema.sql` en Git | Cada cambio versionado |

---

## 7. Mantenimiento del despliegue (Vercel)

### 7.1 Flujo recomendado

```
Git push → Vercel build → Preview (rama) → merge main → Production
```

### 7.2 Variables de entorno

| Variable | Cuándo revisar |
| -------- | -------------- |
| `VITE_SUPABASE_URL` | Si cambia proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Si se rota la anon key |

Tras cambiar variables: **Redeploy** obligatorio.

### 7.3 Problemas frecuentes

| Síntoma | Solución |
| ------- | -------- |
| 404 al recargar ruta | Verificar `vercel.json` rewrites |
| Pantalla blanca | Consola navegador; revisar `VITE_*` |
| Login falla | Supabase Auth URLs + claves Vercel |
| Build falla | Reproducir con `npm.cmd run build` local |

Detalle: [`DESPLIEGUE.md`](DESPLIEGUE.md).

---

## 8. Mantenimiento de calidad

### 8.1 Pipeline mínimo

```powershell
npm.cmd run lint
npm.cmd run test:coverage
npm.cmd run build
npm.cmd run sonar
```

### 8.2 Umbrales recomendados

| Métrica | Umbral mínimo |
| ------- | ------------- |
| ESLint | 0 warnings |
| Pruebas | 100% aprobadas |
| Cobertura líneas | ≥ 70% |
| Sonar Quality Gate | Passed |

### 8.3 Cuando baja la cobertura

1. Identificar archivos sin cubrir en `coverage/index.html`.
2. Agregar tests en `src/tests/unit/` o `components/`.
3. No excluir código de negocio crítico del informe sin justificación.

---

## 9. Mantenimiento de dependencias npm

### 9.1 Comandos útiles

```powershell
npm outdated
npm update
npm audit
```

### 9.2 Política de actualización

| Tipo | Acción |
| ---- | ------ |
| Parche (patch) | Actualizar con `npm update` + quality |
| Minor | Probar en rama aparte |
| Major (React, Vite, Supabase) | Leer changelog, rama dedicada, suite completa |

### 9.3 Dependencias críticas

- `react`, `react-dom`, `react-router-dom`
- `@supabase/supabase-js`
- `vite`, `vitest`
- `eslint`, `prettier`

---

## 10. Mantenimiento de documentación

| Evento | Documento a actualizar |
| ------ | ---------------------- |
| Nuevo módulo | `MODULOS_IMPLEMENTADOS.md` |
| Cambio arquitectura | `ARQUITECTURA.md` |
| Nuevas pruebas | `REPORTE_PRUEBAS.md` |
| Nuevo despliegue | `DESPLIEGUE.md` |
| Nueva pantalla UI | `MOCKUPS.md` + mockup en `/mockups` |
| Nueva fuente estado del arte | `ESTADO_DEL_ARTE.md` § Anexo Drive |
| Evidencias tesis | `EVIDENCIAS_CALIDAD_DESPLIEGUE.md` |

---

## 11. Seguridad operativa

| Práctica | Detalle |
| -------- | ------- |
| No commitear `.env` | Ver `.gitignore` |
| Rotar claves si filtradas | Supabase → regenerate anon key |
| No usar `service_role` en frontend | Solo anon key en `VITE_*` |
| Revisar accesos GitHub/Vercel | 2FA activado |
| Usuarios demo | Contraseñas fuertes; no usar en producción real |

---

## 12. Roadmap post-tesis (evolución)

Prioridades sugeridas para mantener el producto **vivo y demostrable**:

| Prioridad | Mejora | Impacto |
| --------- | ------ | ------- |
| Alta | Edge Function IA real para chatbot | Estado del arte LLM |
| Alta | Integración pasarela de pago | Cierre de venta end-to-end |
| Media | Publicación real en APIs sociales | Redes sociales completas |
| Media | CI GitHub Actions (`quality` en PR) | Mantenimiento automático |
| Media | PWA / notificaciones push | Experiencia móvil |
| Baja | Internacionalización (i18n) | Mercados adicionales |
| Baja | Dark/light theme toggle | UX avanzada |

---

## 13. Checklist “app on fire”

Use esta lista rápida antes de demos, clases o defensa:

- [ ] Producción responde (HTTP 200 en `/`)
- [ ] Login admin y vendedor funcionan
- [ ] Catálogo carga productos
- [ ] Chatbot responde y deriva handoff
- [ ] Panel admin abre secciones principales
- [ ] `npm.cmd run quality` pasa en local
- [ ] Supabase no está pausado
- [ ] Documentación `docs/` coherente con el código
- [ ] Mockups PNG exportables en `/mockups`

---

## 14. Contactos y recursos

| Recurso | Enlace |
| ------- | ------ |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |
| Vitest | [vitest.dev](https://vitest.dev) |
| SonarCloud | [sonarcloud.io](https://sonarcloud.io) |
| Estado del arte (Drive) | [Carpeta investigación](https://drive.google.com/drive/folders/1UyonMaHiZEMG-1GNKbQQwYkV8sCmF9OR?usp=sharing) |

---

## 15. Conclusión

El mantenimiento de NutriStore no termina con la entrega de la tesis. Con una rutina clara — **quality pipeline**, revisión de Supabase/Vercel, actualización controlada de dependencias, documentación viva y análisis Sonar periódico — la aplicación permanece **demostrable**, **segura** y **preparada para evolucionar**.

Este plan convierte el prototipo académico en un activo software sostenible, alineado con el estado del arte aplicado (`docs/ESTADO_DEL_ARTE.md`) y con las evidencias de calidad ya documentadas en el repositorio.
