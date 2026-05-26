# Modelo de datos — 50 tablas (NutriStore)

Archivo único: **`schema.sql`** (orden de dependencias corregido)

## Orden de ejecución en `schema.sql`

1. Extensiones  
2. Funciones sin tablas (`set_updated_at`)  
3. 50 tablas (`CREATE TABLE IF NOT EXISTS`)  
4. Índices  
5. Inserts base (roles, categorías, reglas chatbot, etc.)  
6. Funciones con tablas (`is_admin`, `handle_new_user`, …)  
7. Triggers  
8. RLS  
9. Policies (`DROP POLICY IF EXISTS` + `CREATE`)  
10. Datos de prueba  

## Las 50 tablas (orden de creación)

| # | Tabla | Módulo |
|---|-------|--------|
| 1 | roles | Roles |
| 2 | permissions | Permisos |
| 3 | product_categories | Catálogo |
| 4 | order_statuses | Ventas |
| 5 | payment_methods | Pagos |
| 6 | social_platforms | Redes |
| 7 | system_settings | Config |
| 8 | profiles | Auth |
| 9 | role_permissions | Permisos |
| 10 | customers | Clientes |
| 11 | sellers | Vendedores |
| 12 | customer_addresses | Clientes |
| 13 | customer_goals | Clientes |
| 14 | customer_segments | Segmentación |
| 15 | products | Catálogo |
| 16 | product_images | Catálogo |
| 17 | product_variants | Catálogo |
| 18 | product_reviews | Reseñas |
| 19 | product_recommendations | IA / ventas |
| 20 | suppliers | Inventario |
| 21 | purchases | Compras |
| 22 | purchase_details | Compras |
| 23 | inventory_movements | Inventario |
| 24 | stock_entries | Inventario |
| 25 | stock_outputs | Inventario |
| 26 | carts | E-commerce |
| 27 | cart_items | E-commerce |
| 28 | orders | Ventas |
| 29 | order_details | Ventas |
| 30 | sales | Ventas |
| 31 | sale_details | Ventas |
| 32 | payments | Pagos |
| 33 | promotions | Promociones |
| 34 | coupons | Promociones |
| 35 | conversations | Chatbot |
| 36 | messages | Chatbot |
| 37 | chatbot_rules | Chatbot |
| 38 | chatbot_intents | Chatbot |
| 39 | handoff_requests | Handoff |
| 40 | seller_assignments | Handoff |
| 41 | support_tickets | Soporte |
| 42 | ticket_assignments | Soporte |
| 43 | social_campaigns | Marketing |
| 44 | social_posts | Redes |
| 45 | social_metrics | Métricas |
| 46 | ai_generated_contents | IA contenido |
| 47 | notifications | Notificaciones |
| 48 | audit_logs | Auditoría |
| 49 | error_logs | Errores |
| 50 | user_sessions | Sesiones |

**Nota FK:** `promotions` va antes que `coupons`; `social_campaigns` va antes que `social_posts`.

## MVP en frontend

- profiles, product_categories, products  
- conversations, messages, handoff_requests, seller_assignments  
- customers, sellers  

## Usuarios de prueba

- `admin@nutristore.test` / `NutriStore2025!`  
- `vendedor@nutristore.test` / `NutriStore2025!`  
