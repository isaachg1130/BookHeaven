# 📖 BookHeaven - Plataforma de Lectura Digital

**BookHeaven** es una solución integral y premium para la gestión y consumo de contenido literario digital (Libros, Mangas, Cómics y Audiolibros). Construida con un stack moderno, ofrece una experiencia de usuario fluida y un panel administrativo potente con analíticas avanzadas.

---

## 🚀 Tecnologías Principales

### Backend
- **Framework:** Laravel 12.x (PHP 8.2+)
- **Autenticación:** Laravel Sanctum (Basada en Tokens)
- **Base de Datos:** MySQL / MariaDB con optimización de índices.
- **Gestión de Roles:** Sistema personalizado de roles (Admin, Premium, Standard).
- **Reportes:** Generación de PDFs integrada.

### Frontend
- **Framework:** React 19.x
- **Build Tool:** Vite 7.x
- **Estado Global:** Context API
- **Gráficos/Analíticas:** Recharts
- **Estilos:** CSS Vanilla (Diseños premium y dinámicos)
- **Iconos:** Emojis y Micro-interacciones personalizadas.

---

## ✨ Características Principales

### Para Usuarios
- **Catálogo Multiformato:** Exploración de libros, mangas, cómics y audiolibros.
- **Perfil Premium:** Flujo de suscripción y pagos integrado.
- **Mi Lista:** Sistema de favoritos para organizar lecturas futuras.
- **Reseñas:** Interacción social mediante valoraciones y comentarios.
- **Lector Integrado:** Visor de PDFs y reproductor de audio nativo.
- **Perfil Personalizado:** Foto de perfil, biografía y preferencias de lectura.
- **Registro Detallado:** Captura de datos demográficos (país, género, fecha de nacimiento) para una experiencia personalizada.

### Para Administradores (Dashboard Analytics)
- **Analíticas Demográficas:** Comparativas de lectura por:
  - Género (Hombres vs Mujeres vs Otros).
  - Rango de edad (13-18, 19-25, etc.).
  - Ubicación geográfica (Top países).
  - Tipo de usuario (Suscritos vs Estándar).
- **Gestión de Usuarios:** CRUD completo de usuarios y asignación de roles.
- **Estadísticas de Contenido:** Rendimiento de títulos populares y contenido premium.
- **Logs de Actividad:** Historial detallado de acciones en la plataforma.
- **Reportes:** Exportación de datos críticos.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/bookheaven.git
```

### 2. Configurar el Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Configurar el Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Scripts de Optimización (Raíz)
El proyecto incluye herramientas para mantenimiento y rendimiento:
- `optimize-project.sh`: Optimización completa de assets y base de datos.
- `validate-fixes.php`: Validador de consistencia de datos.
- `verify-dashboard-setup.php`: Verifica que los endpoints de analíticas funcionen correctamente.

---

## 📈 Próximas Mejoras (Roadmap)
- [ ] **Lector PDF Pro:** Integración con PDF.js para modo nocturno y marcadores.
- [ ] **Modo Offline (PWA):** Lectura sin conexión mediante Service Workers.
- [ ] **Gamificación:** Sistema de logros y rachas de lectura.
- [ ] **Internacionalización:** Soporte completo para Inglés (en proceso).
- [ ] **Notificaciones Push:** Alertas de nuevos lanzamientos y promociones.

---

## 📝 Notas Recientes
- Se corrigió la lógica de validación de edad y el formato de fecha de nacimiento (Día/Mes/Año) en los formularios de registro para mejorar la UX y la precisión de los datos demográficos.
