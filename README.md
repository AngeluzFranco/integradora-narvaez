# 🏨 Hotel Management PWA - Sistema de Gestión Hotelera

Sistema web progresivo (PWA) mobile-first para la gestión de limpieza y mantenimiento en hoteles, diseñado para mucamas/camareras y personal de recepción.

## 🚀 Características Principales

### 📱 Aplicación Móvil (Mucamas)
- ✅ **Modo Offline Robusto**: Funciona sin conexión usando PouchDB para almacenamiento local
- 🏠 **Gestión de Habitaciones**: Ver, actualizar estado (limpia/sucia/ocupada)
- 📸 **Reportes de Incidencias**: Con hasta 3 fotos comprimidas en base64
- 📷 **Escaneo QR**: Auto-asignación de habitaciones mediante código QR
- 🔔 **Notificaciones Push**: Alertas de nuevas tareas y cambios
- 👥 **Colaboración**: Trabajo en equipo entre mucamas
- 🔄 **Sincronización Automática**: Datos sincronizados al recuperar conexión

### 💼 Dashboard Web (Recepción)
- 📊 **KPIs en Tiempo Real**: Habitaciones limpias/sucias/ocupadas, incidencias
- 👤 **Gestión de Personal**: Alta, baja, edición de mucamas
- 🏢 **Multi-Hotel**: Soporte para cadenas hoteleras con múltiples edificios
- 📋 **Gestión de Incidencias**: Ver, atender y resolver reportes
- 🎯 **Asignaciones Diarias**: Distribución de habitaciones por mucama
- 🖨️ **Generación de QR**: Códigos imprimibles para habitaciones
- ⚡ **Actualizaciones en Tiempo Real**: WebSocket para notificaciones instantáneas

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos responsive (mobile-first y desktop-first)
- **JavaScript ES6+ Modules** - Lógica de negocio
- **Bootstrap 5.3** - Framework CSS (grid, cards, modals)
- **Chart.js 4.4** - Gráficas en dashboard de recepción
- **html5-qrcode 2.3.8** - Escaneo de códigos QR (módulo mucama)
- **QRCode.js 1.0.0** - Generación de códigos QR (módulo recepción)
- **Canvas API** - Compresión de imágenes base64

### Backend
- **Spring Boot 4.0.0** - Framework backend
- **Spring Security** - Autenticación y autorización
- **JWT (jjwt 0.12.5)** - Tokens de autenticación
- **Spring Data JPA** - Persistencia de datos
- **H2 Database** - Base de datos en memoria (desarrollo)
- **MySQL** - Base de datos (producción)
- **WebSocket** - Comunicación en tiempo real
- **Lombok** - Reducción de boilerplate

## 📦 Instalación y Configuración

### Prerrequisitos
- **Backend**: Java 21+ y Maven 3.8+
- **Frontend**: Servidor web estático (Live Server, http-server, Python, etc.)
- Navegador moderno (Chrome, Firefox, Edge) con soporte para ES6 modules

### Frontend (HTML/JS/CSS Vanilla)

```powershell
# Navegar al directorio del cliente
cd client

# Opción 1: Usar Live Server de VS Code (recomendado)
# - Instalar extensión "Live Server" en VS Code
# - Click derecho en index.html → "Open with Live Server"
# - Se abrirá en http://127.0.0.1:5500

# Opción 2: Usar http-server de Node.js
npx http-server -p 5500 -c-1

# Opción 3: Usar Python
python -m http.server 5500
```

El frontend estará disponible en `http://127.0.0.1:5500` o `http://localhost:5500`

### Backend

```powershell
# Navegar al directorio del servidor
cd server

# Compilar el proyecto
./mvnw clean install

# Ejecutar la aplicación
./mvnw spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### Variables de Entorno

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

#### Backend (application.properties)
Ya configurado con H2 para desarrollo. Para producción con MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hoteldb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

## 👥 Usuarios de Prueba

El sistema inicializa automáticamente con los siguientes usuarios:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | password | Administrador |
| recepcion1 | password | Recepción |
| mucama1 | password | Mucama |
| mucama2 | password | Mucama |

## 📱 Instalación como PWA

### Android
1. Abre la aplicación en Chrome
2. Menú (⋮) → "Instalar aplicación" o "Añadir a pantalla de inicio"
3. La app se instalará como aplicación nativa

### iOS
1. Abre la aplicación en Safari
2. Botón compartir → "Añadir a pantalla de inicio"
3. Confirma la instalación

## 🗂️ Estructura del Proyecto

```
integradora/
├── client/                     # Frontend React
│   ├── public/
│   │   └── manifest.json      # Manifest PWA
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/            # Páginas por rol
│   │   │   ├── maid/         # Módulo mucamas
│   │   │   └── reception/    # Módulo recepción
│   │   ├── services/         # Servicios (DB, Auth, QR, etc.)
│   │   ├── stores/           # Estado global (Zustand)
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Punto de entrada
│   ├── package.json
│   └── vite.config.js       # Configuración PWA
│
├── server/                    # Backend Spring Boot
│   ├── src/main/java/utex/edu/mx/server/
│   │   ├── config/          # Configuración (Security, CORS)
│   │   ├── controller/      # Controladores REST
│   │   ├── model/           # Entidades JPA
│   │   ├── repository/      # Repositorios Spring Data
│   │   ├── security/        # JWT y autenticación
│   │   ├── dto/            # Data Transfer Objects
│   │   └── ServerApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── docker-compose.yml        # Orquestación de servicios
```

## 🔧 Funcionalidades Detalladas

### Modo Offline
- **PouchDB** almacena localmente: habitaciones, incidencias, asignaciones
- Sincronización bidireccional automática al recuperar conexión
- Compresión de imágenes antes de almacenar (máx 0.5MB por foto)
- Cola de sincronización para garantizar integridad de datos

### Sistema de QR
- Generación de códigos únicos por habitación
- Datos embebidos: ID habitación, número, hotel, edificio, timestamp
- Validación de códigos con caducidad (30 días)
- Impresión en lotes para distribución

### Notificaciones
- **Push Notifications**: Nuevas asignaciones, incidencias urgentes
- **Local Notifications**: Recordatorios diarios
- **WebSocket**: Actualizaciones en tiempo real para recepción

### Seguridad
- Autenticación JWT con expiración de 24 horas
- Passwords encriptados con BCrypt
- CORS configurado para dominios específicos
- Roles y permisos por endpoint

## 🚀 Despliegue

### Docker

```powershell
# Construir y ejecutar todos los servicios
docker-compose up --build

# Detener servicios
docker-compose down
```

### Producción

#### Frontend
```powershell
npm run build
# Servir la carpeta dist/ con nginx, apache, etc.
```

#### Backend
```powershell
./mvnw clean package
java -jar target/server-0.0.1-SNAPSHOT.jar
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro de usuario
- `GET /api/auth/verify` - Verificar token

### Habitaciones
- `GET /api/rooms` - Listar todas
- `GET /api/rooms/{id}` - Obtener por ID
- `GET /api/rooms/maid/{maidId}` - Por mucama
- `GET /api/rooms/status/{status}` - Por estado
- `POST /api/rooms` - Crear
- `PUT /api/rooms/{id}` - Actualizar
- `PATCH /api/rooms/{id}/status` - Cambiar estado
- `DELETE /api/rooms/{id}` - Eliminar

### Incidencias
- `GET /api/incidents` - Listar todas
- `GET /api/incidents/{id}` - Obtener por ID
- `GET /api/incidents/room/{roomId}` - Por habitación
- `GET /api/incidents/maid/{maidId}` - Por mucama
- `POST /api/incidents` - Crear
- `PUT /api/incidents/{id}` - Actualizar
- `PATCH /api/incidents/{id}/resolve` - Marcar resuelta
- `DELETE /api/incidents/{id}` - Eliminar

## 🧪 Testing

```powershell
# Frontend
cd client
npm run test

# Backend
cd server
./mvnw test
```

## 📝 Próximas Mejoras

- [ ] Reportes PDF de KPIs
- [ ] Dashboard avanzado con gráficas
- [ ] Chat en tiempo real entre personal
- [ ] Integración con sistemas PMS hoteleros
- [ ] App móvil nativa (React Native)
- [ ] Soporte multiidioma (i18n)
- [ ] Analytics y métricas de rendimiento

## 👨‍💻 Desarrollo

### Convenciones de Código
- ESLint configurado para React
- Prettier para formateo consistente
- Commits semánticos (feat, fix, docs, etc.)

### Contribuir
1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está destinado solo para uso interno de la organización.

## 📧 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para la industria hotelera**
