# 🚀 BookHeaven - Backend (Laravel 12 API)

Este es el núcleo de **BookHeaven**, una API robusta y escalable construida con **Laravel 12**. Gestiona la lógica de negocio, autenticación, procesamiento de archivos y analíticas avanzadas.

---

## 🛠️ Stack Tecnológico
- **Framework:** Laravel 12.x
- **PHP:** 8.2+
- **Database:** MySQL / MariaDB
- **Auth:** Laravel Sanctum (Tokens persistentes)
- **Filesystem:** Local Storage (Optimizado para PDFs y Audio)
- **PDF Engine:** Barryvdh Laravel-DomPDF

## 🌟 Arquitectura y Características

### 1. Sistema de Autenticación y Roles
- Registro completo con captura de datos demográficos (país, género, edad).
- Middleware de roles: `admin`, `premium` y `standard`.
- Gestión de sesiones y tokens mediante Sanctum.

### 2. Gestión de Contenido Multiformato
- **Libros, Mangas y Cómics:** Soporte para archivos PDF con streaming optimizado.
- **Audiolibros:** Servicio de streaming de audio.
- **Unified Endpoints:** Acceso simplificado a todo el catálogo mediante `/api/content/unified`.

### 3. Engine de Analíticas (Admin)
- Endpoints especializados para comparativas demográficas:
  - `ReadingAnalyticsController`: Analiza tendencias por edad, país y género.
  - `AdminDashboardService`: Agregación de datos optimizada para evitar problemas de rendimiento (N+1).
- **Activity Logs:** Registro de acciones administrativas para auditoría.

### 4. Sistema de Pagos y Suscripciones
- Integración lógica para suscripciones Premium.
- Historial de transacciones y estados de pago.

## 🚀 Instalación
```bash
# Instalar dependencias
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Migraciones y Seeders (Datos iniciales y roles)
php artisan migrate --seed

# Ejecutar servidor
php artisan serve
```

---

## 📁 Estructura del Proyecto
- `app/Http/Controllers/API`: Controladores que exponen la API.
- `app/Services`: Lógica de negocio compleja (Analíticas, Dashboard).
- `app/Models`: Definiciones de Eloquent para Libros, Usuarios, Lecturas, etc.
- `database/migrations`: Historial de esquema (incluyendo optimizaciones de índices).

Para una visión global de la plataforma, consulta el [README principal en la raíz](../README.md).
