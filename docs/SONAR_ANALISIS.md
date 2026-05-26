# Análisis de calidad con SonarQube / SonarCloud

**Proyecto:** Desarrollo de un Sistema Híbrido con IA y Handoff Humano para la Gestión de Redes Sociales y Ventas en una Tienda de Suplementos Nutricionales  
**Aplicación:** NutriStore (`suplementos-app`)  
**Stack:** React 19, Vite, JavaScript, Supabase, Vitest, ESLint, Prettier, SonarScanner

---

## 1. Objetivo del análisis Sonar

SonarQube y SonarCloud realizan un **análisis estático continuo** del código fuente. En el marco de esta tesis, el objetivo es **demostrar código limpio y mantenible** mediante métricas objetivas, reproducibles y alineadas con la industria:

- Detectar defectos potenciales antes de producción.
- Medir cobertura de pruebas automatizadas (Vitest + LCOV).
- Evaluar deuda técnica, duplicación y riesgos de seguridad.
- Complementar ESLint y Prettier con reglas de calidad a nivel de proyecto.

El análisis **no sustituye** las pruebas unitarias ni la revisión humana; las **complementa** con un panel centralizado de calidad.

---

## 2. Métricas evaluadas

Sonar agrupa los hallazgos y las métricas en varias dimensiones. Las más relevantes para este frontend son:

| Dimensión | Descripción breve |
| --------- | ----------------- |
| **Reliability** | Riesgo de fallos en tiempo de ejecución (bugs). |
| **Security** | Vulnerabilidades y vectores de ataque. |
| **Maintainability** | Deuda técnica y code smells. |
| **Coverage** | Líneas cubiertas por pruebas (importadas desde `coverage/lcov.info`). |
| **Duplications** | Bloques de código duplicado. |

Cada dimensión contribuye a la **calificación de la puerta de calidad (Quality Gate)** y al estado global del proyecto (Passed / Failed).

---

## 3. Tipos de hallazgos

### 3.1 Bugs

Problemas que **probablemente provoquen un comportamiento incorrecto** en ejecución (acceso a propiedades indefinidas, condiciones siempre falsas, uso incorrecto de APIs, etc.).

- **Impacto académico:** evidencian que el análisis estático detecta errores lógicos que ESLint puede no marcar.
- **Acción recomendada:** corregir o documentar la excepción si el falso positivo está justificado.

### 3.2 Vulnerabilities

Patrones asociados a **riesgos de seguridad** (inyección, exposición de datos sensibles, uso inseguro de DOM, dependencias vulnerables en escaneos avanzados, etc.).

- **Impacto académico:** demuestra preocupación por seguridad en una app con autenticación y Supabase.
- **Acción recomendada:** priorizar severidad Alta y Media; no almacenar secretos en el repositorio.

### 3.3 Code smells

Indicios de **diseño o estilo deficiente** que dificultan el mantenimiento (funciones muy largas, complejidad cognitiva alta, parámetros excesivos, código muerto).

- No siempre son errores inmediatos, pero **aumentan la deuda técnica**.
- Son coherentes con los principios de código limpio descritos en `docs/CODIGO_LIMPIO.md`.

### 3.4 Duplications

Fragmentos de código **repetidos** entre archivos. La duplicación eleva el costo de cambios y el riesgo de inconsistencias.

- Sonar reporta porcentaje de líneas duplicadas.
- Refactorizar hacia utilidades o componentes reutilizables reduce este indicador.

### 3.5 Coverage (cobertura)

Porcentaje de líneas (y ramas, según configuración) ejecutadas durante las pruebas. En este proyecto:

- Vitest genera `coverage/lcov.info` con el proveedor **v8**.
- Sonar importa ese informe vía `sonar.javascript.lcov.reportPaths`.

La cobertura actual del proyecto supera el **70%** en el alcance definido en `vitest.config.js` (servicios, utils, hooks y componentes priorizados).

### 3.6 Maintainability

Resume la **deuda técnica** estimada (tiempo para corregir code smells) y la calificación de mantenibilidad (rating A–E).

### 3.7 Reliability

Resume los **bugs** abiertos y la calificación de fiabilidad del código analizado.

### 3.8 Security

Resume **vulnerabilities** y la calificación de seguridad; en SonarCloud puede integrarse con análisis de dependencias según el plan.

---

## 4. Configuración del proyecto

| Archivo | Función |
| ------- | ------- |
| `sonar-project.properties` | Clave del proyecto, fuentes, exclusiones, ruta LCOV |
| `vitest.config.js` | Cobertura con `reporter: ['text', 'html', 'lcov']` → `./coverage` |
| `package.json` | Scripts `quality` y `sonar` |

**Importante:** no subir al repositorio tokens, contraseñas ni claves de SonarCloud. Usar variables de entorno en la máquina local o en CI.

---

## 5. Requisitos previos

1. **Node.js** y dependencias del proyecto (`npm install`).
2. **SonarScanner CLI** instalado y disponible en el `PATH` como `sonar-scanner`.  
   - Descarga: [SonarScanner](https://docs.sonarsource.com/sonarqube-server/latest/analyzing-source-code/scanners/sonarscanner/)  
   - SonarCloud: [Analyze with SonarScanner](https://docs.sonarsource.com/sonarcloud/advanced-setup/ci-based-analysis/sonarscanner-cli/)
3. Para **SonarCloud**: cuenta, organización y proyecto creados con la misma `sonar.projectKey` que en `sonar-project.properties`.
4. Token de análisis generado en SonarCloud (o token de usuario en SonarQube local), **solo en variables de entorno**.

### Variables de entorno (no commitear)

En PowerShell (sesión actual):

```powershell
$env:SONAR_TOKEN = "tu-token-generado-en-sonarcloud"
$env:SONAR_HOST_URL = "https://sonarcloud.io"
```

Para SonarQube local:

```powershell
$env:SONAR_TOKEN = "tu-token-local"
$env:SONAR_HOST_URL = "http://localhost:9000"
```

Opcional en SonarCloud (si no está en `sonar-project.properties`):

```powershell
# Pasar organización por CLI al ejecutar el scanner:
# sonar-scanner -Dsonar.organization=tu-organizacion
```

Puedes crear un archivo local `.env.sonar` (ignorado por git) solo en tu máquina; **no** lo subas al repositorio.

---

## 6. Pasos para ejecutar el análisis

### 6.1 Pipeline de calidad local (sin Sonar)

Ejecuta lint, cobertura y build en un solo comando:

```powershell
npm.cmd run quality
```

Equivale a:

1. `npm.cmd run lint` — ESLint sin advertencias.
2. `npm.cmd run test:coverage` — Vitest + informe LCOV en `coverage/lcov.info`.
3. `npm.cmd run build` — compilación de producción con Vite.

### 6.2 Generar solo cobertura LCOV

```powershell
npm.cmd run test:coverage
```

Verificar que exista el archivo:

```text
coverage/lcov.info
```

### 6.3 Ejecutar SonarScanner

Tras `quality` (o al menos `test:coverage`):

```powershell
npm.cmd run sonar
```

Con SonarCloud y organización por parámetro:

```powershell
sonar-scanner -Dsonar.organization=tu-organizacion
```

El scanner lee `sonar-project.properties` en la raíz del proyecto.

### 6.4 Orden recomendado para la tesis

```text
npm.cmd run quality  →  npm.cmd run sonar  →  revisar dashboard en SonarCloud
```

Capturas del dashboard (Overview, Measures, Issues) sirven como **evidencia gráfica** en el documento de tesis.

---

## 7. Interpretación académica de resultados

Para la memoria o informe de tesis, se sugiere interpretar los resultados así:

1. **Quality Gate en verde (Passed)**  
   Indica que el proyecto cumple los umbrales configurados (cobertura mínima, cero bugs bloqueantes, etc.). Es la evidencia principal de “código apto para mantenimiento”.

2. **Cobertura ≥ 70%**  
   Demuestra que las pruebas automatizadas (Vitest + React Testing Library) ejercitan la mayor parte del código de negocio priorizado. Relacionar con `docs/REPORTE_PRUEBAS.md` si existe un reporte detallado.

3. **Bugs y vulnerabilities en cero (o mitigados)**  
   Refuerza la **confiabilidad** y la **seguridad** del sistema frente a usuarios y datos de Supabase.

4. **Code smells acotados**  
   Un número bajo o deuda técnica en horas reducidas muestra aplicación de **código limpio**; los smells restantes pueden citarse como “trabajo futuro”.

5. **Duplicaciones bajas**  
   Apoya la decisión de extraer utilidades (`src/utils/`) y componentes comunes (`src/components/common/`).

6. **Comparación con ESLint/Prettier**  
   Sonar no reemplaza el formateo ni las reglas de estilo del IDE; las **amplía** con análisis semántico y métricas históricas. Mencionar esta complementariedad en la discusión del capítulo de calidad de software.

7. **Limitaciones**  
   - El análisis estático no garantiza ausencia de errores en integración con Supabase en producción.  
   - La cobertura mide líneas ejecutadas, no calidad de los asserts.  
   - Algunas exclusiones en `sonar-project.properties` y `vitest.config.js` acotan el alcance a módulos críticos; debe explicarse en metodología.

---

## 8. Integración continua (opcional)

En GitHub Actions u otro CI, definir secretos `SONAR_TOKEN` y `SONAR_HOST_URL` en la configuración del repositorio (Settings → Secrets), nunca en el código. Ejecutar `npm run quality` y luego `sonar-scanner` en el job de análisis.

---

## 9. Referencias

- [SonarQube — JavaScript/TypeScript](https://docs.sonarsource.com/sonarqube-server/latest/analyzing-source-code/languages/javascript-typescript-css/)
- [SonarCloud — NPM / JavaScript](https://docs.sonarsource.com/sonarcloud/advanced-setup/languages/javascript/)
- [Vitest — Coverage](https://vitest.dev/guide/coverage.html)
- Documentación interna: `docs/CODIGO_LIMPIO.md`, `docs/REPORTE_PRUEBAS.md`
