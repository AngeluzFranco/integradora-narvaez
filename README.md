# 🏨 Sistema de Gestión Hotelera - Hotel Management System

Sistema web **PWA (Progressive Web App)** para la gestión de limpieza y mantenimiento en hoteles, con **modo offline completo**, **notificaciones en tiempo real** y interfaces diferenciadas para mucamas (mobile-first) y personal de recepción (desktop-first).

> **🎉 NUEVA VERSIÓN - Diciembre 2025**
> - ✅ Modo offline con PouchDB y sincronización automática
> - ✅ WebSocket para notificaciones en tiempo real
> - ✅ PWA instalable con Service Worker
> - ✅ Push notifications del navegador
> - ✅ Gestión completa de personal (UserController)

## 🚀 Características Principales

### 📱 Módulo Mucama (Mobile-First PWA - Optimizado para Android)
- ✅ **Dashboard Habitaciones**: Ver habitaciones asignadas con estado en tiempo real
- 🏠 **Gestión de Estado**: Actualizar estado (limpia/sucia/ocupada) con un tap
- 📸 **Reportes de Incidencias**: Crear incidencias con hasta 3 fotos comprimidas en base64
- 📷 **Escaneo QR**: Auto-asignación de habitaciones mediante código QR con html5-qrcode
- 👥 **Vista Colaborativa**: Ver habitaciones de otras mucamas para coordinar trabajo
- 📵 **Modo Offline**: PouchDB guarda cambios localmente y sincroniza al reconectar
- 🔔 **Notificaciones Push**: Alertas en tiempo real de nuevas incidencias
- 🌐 **WebSocket**: Actualizaciones instantáneas sin recargar página
- 📲 **Instalable**: Agregar a pantalla principal como app nativa
- 🔄 **Auto-refresh**: Actualización automática cada 30 segundos (cuando hay conexión)
- 📱 **UI Táctil**: Bottom navigation bar, tap targets 44x44px, gestos optimizados

### 💼 Módulo Recepción (Desktop-First - Orientado a laptop/PC)
- 📊 **Dashboard con KPIs**: Gráficas Chart.js de habitaciones y severidad de incidencias
- 🏢 **CRUD Habitaciones**: Alta, baja, edición con filtros por edificio/estado
- 📋 **Gestión Incidencias**: Ver, filtrar y resolver reportes con notas de resolución
- 🎯 **Asignaciones**: Distribución manual o automática de habitaciones a mucamas
- 👥 **Gestión de Personal**: CRUD completo de usuarios (crear, editar, activar/desactivar)
- 🖨️ **Generación QR**: Códigos QR imprimibles para todas las habitaciones
- 🔍 **Búsqueda y Filtros**: Filtrado avanzado por múltiples criterios
- 🌐 **Notificaciones en Tiempo Real**: WebSocket para actualizaciones instantáneas
- 🖥️ **Sidebar Navigation**: Navegación desktop con rutas organizadas

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica con manifest.json para PWA
- **CSS3** - Estilos responsive (mobile-first y desktop-first)
- **JavaScript ES6+ Modules** - Lógica de negocio modular
- **Service Worker** - Caching offline y push notifications
- **PouchDB 8.0.1** - Base de datos local IndexedDB con sincronización
- **Bootstrap 5.3** - Framework CSS (grid, cards, modals)
- **Chart.js 4.4** - Gráficas en dashboard de recepción
- **html5-qrcode 2.3.8** - Escaneo de códigos QR (módulo mucama)
- **QRCode.js 1.0.0** - Generación de códigos QR (módulo recepción)
- **SockJS 1.6.1 + STOMP 2.3.3** - Cliente WebSocket
- **Canvas API** - Compresión de imágenes base64
- **Web Notifications API** - Push notifications nativas

### Backend
- **Spring Boot 4.0.0** - Framework backend
- **Spring Security** - Autenticación y autorización
- **JWT (jjwt 0.12.5)** - Tokens de autenticación
- **Spring Data JPA** - Persistencia de datos
- **H2 Database** - Base de datos en memoria (desarrollo)
- **MySQL** - Base de datos (producción)
- **Spring WebSocket (STOMP)** - Comunicación bidireccional en tiempo real
- **SimpMessagingTemplate** - Broadcasting de notificaciones
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

### Configuración

#### Frontend
No requiere variables de entorno. La configuración está en `client/js/config.js`:

```javascript
const API_URL = 'http://localhost:8080/api';
```

Si despliegas en otro servidor, modifica esta constante.

#### Backend (application.properties)
Ya configurado con **H2 en memoria** para desarrollo:

```properties
# Servidor
server.port=8080

# H2 Database (desarrollo)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# H2 Console (solo desarrollo)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT Secret (cambiar en producción)
jwt.secret=your-secret-key-change-this-in-production-min-256-bits
jwt.expiration=86400000
```

**Para producción con MySQL**, cambiar a:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hoteldb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

## 👥 Usuarios de Prueba

El sistema inicializa automáticamente con los siguientes usuarios:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | password | Administrador |
| recepcion1 | password | Recepción |
| mucama1 | password | Mucama |
| mucama2 | password | Mucama |

## 📱 Uso en Dispositivos Móviles

### Android (Recomendado para Mucamas)
1. Abre Chrome en el móvil
2. Navega a `http://[IP-SERVIDOR]:5500/client/index.html`
3. Login con usuario `mucama1` / `password`
4. La interfaz es 100% mobile-first con:
   - Bottom navigation bar
   - Tap targets grandes (44x44px)
   - Gestos táctiles optimizados
   - Auto-refresh cada 30s

### Instalación como PWA (Futuro)
**Nota:** Actualmente no implementado. Requiere:
- Service Worker (`service-worker.js`)
- Manifest (`manifest.json`)
- HTTPS en producción

Para instalar en futuro:
1. Chrome → Menú (⋮) → "Instalar aplicación"
2. Se agregará ícono en pantalla de inicio

## 🗂️ Estructura del Proyecto

```
integradora/
├── client/                           # Frontend HTML/JS/CSS
│   ├── index.html                    # Login con detección de rol
│   ├── README.md                     # Guía de inicio rápido
│   ├── FRONTEND-DOCS.md              # Documentación técnica (564 líneas)
│   ├── RESUMEN-EJECUTIVO.md          # Resumen ejecutivo del proyecto
│   ├── ARQUITECTURA.md               # Diagramas de arquitectura
│   │
│   ├── css/
│   │   ├── common.css                # Estilos globales
│   │   └── login.css                 # Estilos login
│   │
│   ├── js/
│   │   ├── config.js                 # Configuración API + constantes
│   │   ├── api.js                    # Servicio HTTP con JWT
│   │   └── login.js                  # Lógica autenticación
│   │
│   ├── mucama/                       # 📱 MÓDULO MUCAMA (MOBILE-FIRST)
│   │   ├── index.html                # Dashboard habitaciones
│   │   ├── incidents.html            # Gestión incidencias + fotos
│   │   ├── qr-scan.html              # Escaneo QR auto-asignación
│   │   ├── team.html                 # Vista colaborativa equipo
│   │   ├── css/mucama.css            # Estilos táctiles mobile
│   │   └── js/
│   │       ├── mucama-home.js        # Dashboard + cambio estado
│   │       ├── mucama-incidents.js   # CRUD incidencias + compresión fotos
│   │       ├── mucama-qr.js          # html5-qrcode scanner
│   │       └── mucama-team.js        # Ver habitaciones compañeras
│   │
│   └── recepcion/                    # 💻 MÓDULO RECEPCIÓN (DESKTOP-FIRST)
│       ├── index.html                # Dashboard KPIs + gráficas Chart.js
│       ├── rooms.html                # CRUD habitaciones
│       ├── incidents.html            # Gestión incidencias + resolver
│       ├── qr-codes.html             # Generación QR imprimibles
│       ├── assignments.html          # Asignaciones manuales/automáticas
│       ├── staff.html                # Gestión personal (stub)
│       ├── css/recepcion.css         # Estilos desktop sidebar
│       └── js/
│           ├── recepcion-dashboard.js   # Dashboard + Chart.js
│           ├── recepcion-rooms.js       # CRUD completo habitaciones
│           ├── recepcion-incidents.js   # Tabla + resolver + detalle
│           └── recepcion-qr.js          # QRCode.js generator
│
├── server/                           # Backend Spring Boot
│   ├── src/main/java/utex/edu/mx/server/
│   │   ├── config/
│   │   │   └── SecurityConfig.java   # Spring Security + CORS + JWT
│   │   ├── controller/
│   │   │   ├── AuthController.java   # Login endpoint
│   │   │   ├── RoomController.java   # CRUD habitaciones
│   │   │   └── IncidentController.java # CRUD incidencias
│   │   ├── model/
│   │   │   ├── User.java             # Usuario con @JsonIgnore password
│   │   │   ├── Room.java             # Habitación con @JsonIgnoreProperties
│   │   │   ├── Incident.java         # Incidencia
│   │   │   ├── Building.java         # Edificio
│   │   │   └── Hotel.java            # Hotel
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── security/
│   │   │   ├── JwtService.java       # Generación/validación JWT
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── CustomUserDetailsService.java
│   │   ├── dto/
│   │   │   ├── AuthRequest.java
│   │   │   └── AuthResponse.java
│   │   ├── DataInitializer.java      # Datos de prueba (hotel, edificios, usuarios)
│   │   └── ServerApplication.java
│   ├── src/main/resources/
│   │   └── application.properties    # H2 database config
│   └── pom.xml                       # Maven dependencies
│
├── docker-compose.yml                # Docker orquestación
├── Jenkinsfile                       # CI/CD pipeline
└── README.md                         # Este archivo
```

**Total:** 31 archivos frontend + backend completo Spring Boot

## 🔧 Funcionalidades Detalladas

### 🔐 Sistema de Autenticación
- **JWT Tokens**: Expiración de 24 horas con renovación automática
- **Role-based Routing**: Detección automática de rol (MAID → mobile, RECEPTION/ADMIN → desktop)
- **Password Security**: Encriptación BCrypt, nunca expuesta en JSON con `@JsonIgnore`
- **CORS Configurado**: Soporta localhost:3000, 5173, 5500 y 127.0.0.1 equivalentes
- **Auto-logout**: Redirección a login en token expirado (401)

### 📷 Sistema de QR
- **Generación**: QRCode.js con datos embebidos (ID, número, hotel, edificio, timestamp)
- **Escaneo**: html5-qrcode con acceso a cámara nativa Android
- **Validación**: Verificación de caducidad (30 días) y formato JSON
- **Impresión**: Layouts optimizados con `@media print` para impresión en lote
- **Auto-asignación**: PUT `/api/rooms/{id}` actualiza `assignedTo` al escanear

### 📸 Compresión de Imágenes
- **Canvas API**: Resize automático a máximo 1024px de ancho/alto
- **JPEG Compression**: Quality 0.7 para balance calidad/tamaño
- **Base64 Encoding**: Almacenamiento como JSON array en columna TEXT
- **Límite**: Máximo 3 fotos por incidencia (~350KB c/u después de compresión)
- **Galería**: Modal fullscreen para visualizar fotos en recepción

### 🔄 Auto-refresh
- **Mucama Dashboard**: Refresco cada 30 segundos de habitaciones asignadas
- **Recepción Dashboard**: Refresco cada 60 segundos de KPIs y gráficas
- **Manual Refresh**: Botones de recarga en headers

### 📊 Analytics con Chart.js
- **Doughnut Chart**: Distribución de estados de habitaciones (Clean/Dirty/Occupied)
- **Bar Chart**: Severidad de incidencias (Low/Medium/High)
- **KPI Cards**: Contadores en tiempo real con animación
- **Responsive**: Gráficas adaptativas a viewport

### 🔒 Seguridad Backend
- **Spring Security**: FilterChain con JWT authentication
- **@JsonIgnoreProperties**: Prevención de referencias circulares en JPA
- **CSRF Disabled**: Solo para APIs stateless REST
- **H2 Console**: Habilitado solo en desarrollo (frameOptions disabled)

## 🚀 Despliegue

### Docker (Recomendado para Producción)

```powershell
# Construir y ejecutar todos los servicios
docker-compose up --build

# En background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

El `docker-compose.yml` incluido configura:
- Backend Spring Boot en puerto 8080
- Base de datos MySQL (en vez de H2)
- Volúmenes persistentes

---

### Despliegue Manual

#### Frontend
El frontend es **estático** (HTML/JS/CSS), solo necesita un servidor web:

**Opción 1: Nginx**
```nginx
server {
    listen 80;
    server_name hotel.example.com;
    root /var/www/hotel/client;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API al backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Opción 2: Apache**
```apache
<VirtualHost *:80>
    ServerName hotel.example.com
    DocumentRoot /var/www/hotel/client
    
    <Directory /var/www/hotel/client>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ProxyPass /api http://localhost:8080/api
    ProxyPassReverse /api http://localhost:8080/api
</VirtualHost>
```

**Opción 3: IIS (Windows Server)**
1. Copiar carpeta `client/` a `C:\inetpub\wwwroot\hotel`
2. Crear nuevo sitio web en IIS Manager
3. Configurar URL Rewrite para proxy a backend

#### Backend
```powershell
# Compilar JAR ejecutable
cd server
./mvnw clean package -DskipTests

# Ejecutar en producción
java -jar target/server-0.0.1-SNAPSHOT.jar

# O como servicio systemd (Linux)
sudo nano /etc/systemd/system/hotel-backend.service
```

**Ejemplo systemd service:**
```ini
[Unit]
Description=Hotel Management Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/hotel/server
ExecStart=/usr/bin/java -jar /opt/hotel/server/target/server-0.0.1-SNAPSHOT.jar
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

---

### Configuración de Producción

#### 1. Cambiar JWT Secret
En `application.properties`:
```properties
jwt.secret=GENERATE-SECURE-256-BIT-SECRET-KEY-HERE
```

Generar secret seguro:
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

#### 2. Configurar MySQL
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hoteldb?useSSL=true
spring.datasource.username=hotel_user
spring.datasource.password=SECURE_PASSWORD_HERE
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

#### 3. Actualizar API URL en Frontend
Editar `client/js/config.js`:
```javascript
const API_URL = 'https://api.hotel.example.com/api';
```

#### 4. Habilitar HTTPS
- Obtener certificado SSL (Let's Encrypt recomendado)
- Configurar en Nginx/Apache/IIS
- Actualizar CORS en backend para dominio HTTPS

## 📊 API Endpoints

### 🔐 Autenticación (`AuthController.java`)
| Método | Endpoint | Descripción | Archivos Frontend |
|--------|----------|-------------|-------------------|
| POST | `/api/auth/login` | Login con username/password | `login.js` |

**Request Body:**
```json
{
  "username": "mucama1",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 3,
  "username": "mucama1",
  "name": "Ana García",
  "role": "MAID"
}
```

---

### 🚪 Habitaciones (`RoomController.java`)
| Método | Endpoint | Descripción | Archivos Frontend |
|--------|----------|-------------|-------------------|
| GET | `/api/rooms` | Listar todas las habitaciones | `recepcion-dashboard.js`, `recepcion-rooms.js`, `mucama-team.js` |
| GET | `/api/rooms/{id}` | Obtener habitación por ID | `recepcion-rooms.js` (edit) |
| GET | `/api/rooms/maid/{maidId}` | Habitaciones asignadas a mucama | `mucama-home.js`, `mucama-incidents.js` |
| POST | `/api/rooms` | Crear nueva habitación | `recepcion-rooms.js` |
| PUT | `/api/rooms/{id}` | Actualizar habitación completa | `recepcion-rooms.js`, `mucama-qr.js` (assignedTo) |
| PATCH | `/api/rooms/{id}/status` | Cambiar solo el estado | `mucama-home.js` |
| DELETE | `/api/rooms/{id}` | Eliminar habitación | `recepcion-rooms.js` |

**Ejemplo Response GET /api/rooms:**
```json
[
  {
    "id": 1,
    "number": "101",
    "floor": 1,
    "status": "CLEAN",
    "building": {
      "id": 1,
      "name": "Edificio Principal",
      "floors": 3
    },
    "assignedTo": {
      "id": 3,
      "username": "mucama1",
      "name": "Ana García",
      "role": "MAID"
    },
    "assignedAt": "2024-12-01T08:00:00",
    "active": true
  }
]
```

---

### ⚠️ Incidencias (`IncidentController.java`)
| Método | Endpoint | Descripción | Archivos Frontend |
|--------|----------|-------------|-------------------|
| GET | `/api/incidents` | Listar todas las incidencias | `recepcion-dashboard.js`, `recepcion-incidents.js` |
| GET | `/api/incidents/{id}` | Obtener incidencia por ID | `recepcion-incidents.js` (detalle) |
| GET | `/api/incidents/maid/{maidId}` | Incidencias de una mucama | `mucama-incidents.js` |
| POST | `/api/incidents` | Crear nueva incidencia | `mucama-incidents.js` |
| PATCH | `/api/incidents/{id}/resolve` | Marcar como resuelta | `recepcion-incidents.js` |

**Ejemplo Request POST /api/incidents:**
```json
{
  "room": {"id": 1},
  "reportedBy": {"id": 3},
  "description": "Fuga de agua en el baño",
  "severity": "HIGH",
  "status": "OPEN",
  "photos": "[\"data:image/jpeg;base64,/9j/4AAQ...\",\"data:image/jpeg;base64,iVBORw0KG...\"]"
}
```

**Ejemplo Response GET /api/incidents:**
```json
[
  {
    "id": 1,
    "room": {
      "id": 1,
      "number": "101"
    },
    "reportedBy": {
      "id": 3,
      "username": "mucama1",
      "name": "Ana García",
      "role": "MAID"
    },
    "description": "Fuga de agua en el baño",
    "severity": "HIGH",
    "status": "OPEN",
    "photos": "[\"data:image/jpeg;base64,...\"]",
    "createdAt": "2024-12-01T09:30:00"
  }
]
```

---

### 🏢 Edificios y Hoteles
**Nota:** No hay endpoints dedicados. Los edificios se obtienen a través de las relaciones JPA en `/api/rooms`.

**Extraer edificios únicos en frontend:**
```javascript
const buildings = [...new Set(rooms.map(r => r.building.name))];
```

## 🧪 Testing

### Backend
```powershell
cd server
./mvnw test
```

### Frontend
No hay tests automatizados implementados. Para testing manual:

1. **Abrir H2 Console** (con backend corriendo):
   - URL: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:testdb`
   - User: `sa`
   - Password: (dejar vacío)

2. **Verificar datos iniciales**:
   ```sql
   SELECT * FROM users;
   SELECT * FROM rooms;
   SELECT * FROM incidents;
   ```

3. **Probar endpoints con curl**:
   ```powershell
   # Login
   curl -X POST http://localhost:8080/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{\"username\":\"mucama1\",\"password\":\"password\"}'
   
   # Listar habitaciones (requiere token)
   curl http://localhost:8080/api/rooms `
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## 📝 Funcionalidades Implementadas vs Pendientes

### ✅ Implementado
- [x] Autenticación JWT con Spring Security
- [x] CRUD completo de habitaciones
- [x] CRUD completo de incidencias
- [x] Dashboard mucama mobile-first
- [x] Dashboard recepción desktop-first con Chart.js
- [x] Escaneo QR con html5-qrcode
- [x] Generación QR con QRCode.js
- [x] Compresión de imágenes con Canvas API
- [x] Auto-refresh de datos
- [x] Filtros avanzados (estado, edificio, búsqueda)
- [x] Sistema de roles (ADMIN, RECEPTION, MAID)
- [x] Asignaciones manuales y automáticas
- [x] Vista colaborativa de equipo
- [x] Datos de prueba con DataInitializer
- [x] Documentación completa (README, FRONTEND-DOCS, RESUMEN-EJECUTIVO, ARQUITECTURA)

### ⚠️ Parcialmente Implementado
- [~] Gestión de personal (staff.html es stub, requiere UserController backend)
- [~] Modo offline (no implementado PouchDB, funciona solo online)
- [~] Notificaciones push (no implementado)

### ❌ No Implementado / Mejoras Futuras
- [ ] UserController para CRUD de usuarios desde frontend
- [ ] BuildingController y HotelController (actualmente solo lectura vía relaciones JPA)
- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Service Worker para PWA offline
- [ ] Reportes PDF de KPIs
- [ ] Chat en tiempo real entre personal
- [ ] Integración con sistemas PMS hoteleros
- [ ] Soporte multiidioma (i18n)
- [ ] Tests automatizados frontend
- [ ] Drag & Drop en asignaciones
- [ ] Dark mode
- [ ] Notificaciones push con VAPID

## 🛠️ Tecnologías y Versiones

### Frontend
- HTML5 con semántica moderna
- CSS3 con Flexbox y Grid
- JavaScript ES6+ Modules (import/export)
- Bootstrap 5.3.0 (CDN)
- Chart.js 4.4.0 (CDN)
- html5-qrcode 2.3.8 (CDN)
- QRCode.js 1.0.0 (CDN)

### Backend
- Java 21
- Spring Boot 3.2.0
- Spring Security 6.2.0
- Spring Data JPA
- JWT (io.jsonwebtoken:jjwt-api:0.12.5)
- H2 Database (desarrollo)
- Lombok
- Maven 3.8+

### DevOps
- Docker 20+
- Docker Compose 3.8
- Jenkins (Jenkinsfile incluido)

---

## 👨‍💻 Desarrollo y Contribución

### Estructura de Commits
Seguimos **Conventional Commits**:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato (sin cambios de código)
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Workflow de Git
1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'feat: Add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Debugging
**Backend:**
- Logs en consola con `spring.jpa.show-sql=true`
- H2 Console: http://localhost:8080/h2-console
- Breakpoints en IntelliJ IDEA con Debug mode

**Frontend:**
- Console del navegador (F12)
- Network tab para ver requests/responses
- Source maps con JS modules
- `console.log()` en archivos `.js`

## 🐛 Troubleshooting

### Frontend no carga (404 en archivos JS)
**Problema:** `GET http://127.0.0.1:5500/mucama/js/api.js net::ERR_ABORTED 404`

**Solución:** Verificar rutas de import. Deben ser:
```javascript
// ✅ Correcto (desde mucama/js/)
import api from '../../js/api.js';

// ❌ Incorrecto
import api from '../js/api.js';
```

---

### Error CORS al hacer login
**Problema:** `Access to fetch at 'http://localhost:8080/api/auth/login' has been blocked by CORS policy`

**Solución:** 
1. Verificar que backend esté corriendo en puerto 8080
2. Revisar `SecurityConfig.java` tenga tu origen:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5500",
    "http://127.0.0.1:5500"
));
```
3. Reiniciar backend después de cambios

---

### Error JSON "Unexpected token '}'"
**Problema:** `SyntaxError: Unexpected token '}', ..."hotel":}]}}]}}]}}"... is not valid JSON`

**Solución:** Referencia circular en modelos JPA. Verificar que todos tengan `@JsonIgnoreProperties`:
```java
@ManyToOne
@JsonIgnoreProperties({"rooms", "hotel"})
private Building building;
```

---

### Token expirado constantemente
**Problema:** Redirige a login cada pocos segundos

**Solución:** 
1. Verificar que `jwt.expiration` sea 86400000 (24 horas en ms)
2. Sincronizar reloj del servidor
3. Limpiar localStorage: `localStorage.clear()`

---

### Fotos no se cargan en incidencias
**Problema:** Modal muestra "Sin fotos" aunque se subieron

**Solución:**
1. Verificar que columna `photos` en DB sea tipo TEXT (no VARCHAR)
2. Comprobar compresión no exceda límite TEXT (~64KB por foto)
3. Ver consola del navegador para errores de parsing JSON

---

### H2 Console no abre
**Problema:** http://localhost:8080/h2-console da 404

**Solución:**
1. Verificar `spring.h2.console.enabled=true` en `application.properties`
2. URL correcta: `jdbc:h2:mem:testdb`
3. Solo funciona en perfil development

---

## 📚 Documentación Adicional

- **Frontend Técnico:** Ver `client/FRONTEND-DOCS.md` (564 líneas)
- **Resumen Ejecutivo:** Ver `client/RESUMEN-EJECUTIVO.md` (328 líneas)
- **Arquitectura:** Ver `client/ARQUITECTURA.md` (diagramas de flujo)
- **API Reference:** Ver sección "API Endpoints" arriba

---

## 📄 Licencia

Este proyecto es privado y está destinado solo para uso interno de la organización.

---

## 📧 Contacto y Soporte

Para soporte técnico o consultas:
- **Repository:** https://github.com/AngeluzFranco/integradora-narvaez
- **Issues:** https://github.com/AngeluzFranco/integradora-narvaez/issues

---

## 🙏 Agradecimientos

Desarrollado con ❤️ para la industria hotelera.

**Stack:** Spring Boot + HTML5 + CSS3 + JavaScript ES6+ Modules + Bootstrap 5 + Chart.js
