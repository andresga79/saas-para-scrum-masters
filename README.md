# SaaS para Scrum Masters

Guía de estudio para Scrum Masters que quieren conversar de igual a igual con su equipo técnico, detectar riesgos temprano y ayudar a priorizar deuda técnica frente a funcionalidades. Todo el contenido está en español.

**Sitio publicado:** https://andresga79.github.io/saas-para-scrum-masters/

## Módulos

Cada módulo es un archivo Markdown en [`content/`](content/) y se puede leer directamente en GitHub, con sus diagramas.

| # | Módulo | Temas |
|---|---|---|
| 00 | [Inicio y mapa general](content/00-inicio.md) | Mapa del SaaS, prioridad de estudio |
| 01 | [APIs](content/01-apis.md) | HTTP, códigos de estado, REST/GraphQL/gRPC, webhooks, idempotencia |
| 02 | [Monolito y microservicios](content/02-monolito-microservicios.md) | Monolito modular, *strangler fig*, ley de Conway |
| 03 | [Bases de datos](content/03-bases-de-datos.md) | Modelo con `tenant_id`, migraciones, índices, respaldos, RPO/RTO |
| 04 | [Colas y asincronía](content/04-colas-asincronia.md) | Workers, reintentos, DLQ, idempotencia |
| 05 | [Multi-tenancy](content/05-multi-tenancy.md) | Modelos de aislamiento, fuga de datos, vecino ruidoso |
| 06 | [Autenticación y autorización](content/06-autenticacion-autorizacion.md) | SSO, OIDC, SAML, SCIM, MFA, RBAC |
| 07 | [Facturación y métricas SaaS](content/07-facturacion-metricas.md) | Estados de suscripción, *dunning*, MRR, churn, NRR |
| 08 | [Entrega: Git, CI/CD y testing](content/08-entrega-ci-cd.md) | Pipeline, pirámide de pruebas, feature flags, DORA |
| 09 | [Nube y observabilidad](content/09-nube-observabilidad.md) | Arquitectura en la nube, IaC, logs, métricas, trazas |
| 10 | [Confiabilidad e incidentes](content/10-confiabilidad-incidentes.md) | SLI/SLO/SLA, error budget, postmortems |
| 11 | [Seguridad y cumplimiento](content/11-seguridad-cumplimiento.md) | OWASP Top 10, SOC 2, ISO 27001, datos personales |
| 12 | [Diseño y deuda técnica](content/12-diseno-deuda-tecnica.md) | SOLID, DDD, ADR, priorización de deuda |
| 13 | [Plan de 30 días y glosario](content/13-plan-y-glosario.md) | Gantt, ejercicios, glosario, lecturas |

## Verlo en local

El sitio carga los módulos con `fetch`, así que no funciona abriendo `index.html` directamente desde el disco. Levanta un servidor estático:

```bash
cd saas-para-scrum-masters
python3 -m http.server 8000
```

y abre http://localhost:8000.

No hay build ni dependencias que instalar: `marked` y `mermaid` se cargan desde jsDelivr con versiones fijas (ver `index.html`).

## Estructura

```text
index.html                 Shell de la aplicación
assets/style.css           Estilos (claro/oscuro, móvil, impresión)
assets/app.js              Navegación por hash, render de Markdown y Mermaid, progreso
content/modules.json       Orden y títulos de los módulos
content/NN-nombre.md       Un archivo por módulo
.github/workflows/pages.yml  Despliegue a GitHub Pages
.nojekyll                  Evita que Pages procese el sitio con Jekyll
```

## Publicar

El workflow [`pages.yml`](.github/workflows/pages.yml) despliega el sitio en GitHub Pages en cada push a `main`. Para un repositorio nuevo:

1. En GitHub, ve a **Settings → Pages** y elige **Source: GitHub Actions** (o ejecuta `gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow`).
2. Haz push a `main` y sigue el despliegue en la pestaña **Actions**.

## Agregar o editar un módulo

1. Crea `content/NN-nombre.md` siguiendo la estructura de los demás:
   1. `# Título`
   2. `## Idea clave` (el primer párrafo se destaca)
   3. `## Diagramas` con bloques ` ```mermaid `
   4. `## Lo que debes entender`
   5. `## Preguntas para tu equipo` (lista numerada)
   6. `## Errores comunes`
   7. Una llamada `> **Tu rol como Scrum Master**` cuando aporte. Las que empiezan con `> **Atención**` u `> **Ojo**` se muestran como advertencia.
2. Agrégalo a `content/modules.json` en el orden que corresponda.
3. Para enlazar otro módulo, usa la ruta del archivo (`[texto](05-multi-tenancy.md)`): funciona en GitHub y el sitio la convierte en navegación interna.
4. Revisa en local que los diagramas se dibujen. Si alguno falla, el sitio muestra el error y el código del diagrama en su lugar.

## Sobre el contenido

Las cifras de la guía son definiciones, cálculos verificables (como la tabla de disponibilidad del módulo 10) o ejemplos marcados como ilustrativos. Las lecturas recomendadas y las referencias a normas y leyes deben verificarse en sus fuentes oficiales antes de usarse.
