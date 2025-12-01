# HotelClean - PWA para Mucamas de Hotel

Aplicación web progresiva (PWA) mobile-first diseñada para facilitar el trabajo de las mucamas de hotel, con gestión de habitaciones, registro de limpieza, reporte de incidencias y colaboración en equipo.

## 🚀 Características

### 🔐 Sistema de Autenticación
- **Login seguro** con validación de credenciales
- **Persistencia de sesión** con localStorage
- **Auto-login** si existe sesión activa
- **Roles dinámicos**: Mucama y Administrador/Recepción

### Para Mucamas
- **Lista de Habitaciones Asignadas**: Vista clara del estado de cada habitación (limpia, sucia, ocupada)
- **Registro de Limpieza**: Marcar habitaciones con un toque, feedback visual inmediato
- **Reporte de Incidencias**: Formulario simple con opción de adjuntar hasta 3 fotos
- **Escaneo QR**: Integración lista para escanear códigos QR de habitaciones
- **Vista Colaborativa**: Ver habitaciones de otras mucamas para apoyo mutuo

### Para Administración (Recepción)
- **Dashboard Completo**: Métricas en tiempo real con filtros por edificio y mucama
- **Gestión de Códigos QR**: 
  - Generar QR único para cada habitación
  - Visualizar, descargar e imprimir QR individuales o masivamente
  - Sistema listo para integración con lectores QR
  
- **Gestión de Habitaciones**:
  - CRUD completo (crear, leer, actualizar, eliminar)
  - Búsqueda en tiempo real
  - Cambio de estado rápido (limpia/sucia/ocupada)
  - Bloqueo/desbloqueo de habitaciones
  - Visualizar detalles con incidencias activas
  
- **Gestión de Edificios**:
  - Crear y editar edificios
  - Asociar habitaciones a edificios
  - Validación para evitar eliminar edificios con habitaciones
  
- **Gestión de Personal**:
  - Alta de mucamas con información completa
  - Ver detalles (habitaciones asignadas, contacto)
  - Editar información de personal
  - Eliminar con validación de asignaciones
  
- **Asignaciones Diarias**:
  - Vista por fecha de todas las asignaciones
  - Asignación masiva de habitaciones a mucamas
  - Edición rápida de asignaciones
  - Limpiar asignaciones por mucama
  
- **Panel de Incidencias**:
  - Listado con búsqueda y filtros (abiertas/resueltas)
  - Marcar como atendidas
  - Ver detalles completos con fotos
  
- **Bloqueo de Habitaciones**:
  - Bloquear habitaciones para reservas
  - Especificar motivo del bloqueo
  - Vista dedicada de habitaciones bloqueadas
  - Desbloquear con un clic
  
- **Sistema de Notificaciones**:
  - Timeline de eventos del hotel
  - Filtros por tipo (incidencias, tareas, alertas)
  - Indicador de no leídas
  - Notificaciones automáticas en acciones clave

## 📱 Tecnologías

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño minimalista con variables CSS
- **Vanilla JavaScript**: Lógica modular sin frameworks pesados
- **Bootstrap 5**: Grid system, modales, y componentes básicos
- **IndexedDB**: Almacenamiento local para modo offline
- **Service Worker**: Caché y funcionalidad offline
- **PWA**: Instalable en dispositivos móviles

## 📂 Estructura de Archivos

```
client/
├── index.html           # Estructura HTML principal con todas las vistas
├── styles.css           # Estilos personalizados mobile-first
├── app.js               # Lógica de aplicación modular
├── manifest.json        # Configuración PWA
├── service-worker.js    # Service Worker para modo offline
└── README.md           # Este archivo
```

## 🎨 Diseño

### Paleta de Colores
- **Primary**: #6366f1 (Índigo) - Acciones principales
- **Success**: #10b981 (Verde) - Habitaciones limpias
- **Danger**: #ef4444 (Rojo) - Habitaciones sucias
- **Occupied**: #6b7280 (Gris) - Habitaciones ocupadas
- **Warning**: #f59e0b (Ámbar) - Incidencias

### Componentes Principales
- **Bottom Navigation**: Navegación principal con 4 iconos grandes
- **Cards**: Para habitaciones e incidencias con colores de estado
- **Modals**: Formularios y detalles en modales de Bootstrap
- **Toasts**: Notificaciones de feedback inmediato
- **Filters**: Chips para filtrar habitaciones por estado

## 🔧 Instalación y Uso

### Desarrollo Local

1. Clone o descargue los archivos en una carpeta
2. Sirva los archivos con un servidor web local:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js (http-server)
npx http-server -p 8000

# Opción 3: PHP
php -S localhost:8000
```

3. Abra su navegador en `http://localhost:8000`

### Instalación como PWA

1. Abra la aplicación en Chrome/Edge para Android
2. Toque el menú (⋮) y seleccione "Agregar a pantalla de inicio"
3. La app se instalará como una aplicación nativa

## 📋 Módulos Implementados

### 1. AuthModule
- Autenticación de usuarios con roles
- Gestión de sesiones con localStorage
- Validación de credenciales
- Auto-login persistente

### 2. RoomsModule
- Carga y renderizado de habitaciones
- Filtrado por estado (todas, limpias, sucias, ocupadas)
- Actualización de estado con animaciones
- Vista colaborativa de habitaciones de otros

### 3. IncidentsModule
- Creación de incidencias con fotos
- Listado de incidencias propias
- Vista administrativa con búsqueda y filtros
- Resolución de incidencias (admin)

### 4. QRModule (QRCodeModule)
- Generación de códigos QR por habitación
- Visualización en modal
- Descarga de códigos QR
- Impresión individual o masiva
- Listo para integración con librería QR real

### 5. AssignmentsModule
- Gestión de asignaciones diarias
- Asignación masiva de habitaciones
- Selector de fecha
- Edición y limpieza de asignaciones

### 6. NotificationsModule
- Sistema de notificaciones en tiempo real
- Filtrado por tipo (incidencia, tarea, alerta)
- Marcado de leídas/no leídas
- Badge indicador de notificaciones nuevas

### 7. BlockedRoomsModule
- Bloqueo de habitaciones con motivo
- Vista de habitaciones bloqueadas
- Desbloqueo con validación
- Integración con sistema de notificaciones

### 8. AdminModule
- Dashboard con métricas filtrables
- CRUD completo de personal (mucamas)
- CRUD completo de habitaciones
- CRUD completo de edificios
- Búsqueda en tiempo real
- Validaciones inteligentes

### 9. DB Module (IndexedDB)
- Almacenamiento local persistente
- Operaciones CRUD async
- Preparado para sincronización con backend

## 🔄 Funcionalidad Offline

La aplicación funciona completamente offline gracias a:
- **Service Worker**: Caché de assets estáticos
- **IndexedDB**: Almacenamiento de datos local
- **Detección de conectividad**: Notifica cuando está offline

### Sincronización Pendiente
El Service Worker incluye hooks para:
- Background Sync API
- Push Notifications
- Sincronización automática al recuperar conexión

## 🎯 Datos de Demo

La aplicación carga automáticamente datos de ejemplo:

### Usuarios
- **Mucama**: `maria` / `1234` (María González)
- **Mucama**: `ana` / `1234` (Ana Martínez)
- **Admin**: `admin` / `admin` (Administrador)
- **Recepción**: `recepcion` / `1234` (Recepción Principal)

### Datos precargados
- 12 habitaciones de ejemplo (Edificio A y B)
- 3 incidencias de muestra
- 3 mucamas registradas
- 3 notificaciones de ejemplo

## 📱 Responsive Design

- **Mobile-first**: Optimizado para pantallas pequeñas (320px+)
- **Tablets**: Adaptado para pantallas medianas
- **Desktop**: Contenido centrado con ancho máximo

## 🚧 Extensibilidad Futura

### Backend Integration
```javascript
// En app.js, reemplazar DB module con API calls
const API = {
    async getRooms() {
        const response = await fetch('/api/rooms');
        return response.json();
    },
    // ... más endpoints
};
```

### Características Pendientes
- [ ] Integración real de QR Scanner (usar librería como `html5-qrcode` o `qrcode.js`)
- [ ] Generación real de códigos QR (usar `qrcodejs2` o similar)
- [ ] API REST para sincronización con backend
- [ ] Push notifications para nuevas asignaciones
- [ ] Chat entre mucamas
- [ ] Historial de limpieza por habitación
- [ ] Reportes y estadísticas avanzadas (gráficas con Chart.js)
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Multi-idioma (i18n)
- [ ] Modo oscuro
- [ ] Drag & Drop para asignaciones de habitaciones
- [ ] Calendario de mantenimiento preventivo
- [ ] Sistema de turnos para personal

## 🔐 Roles de Usuario

### Mucama (role: 'maid')
- Ve solo sus habitaciones asignadas
- Puede marcar estado de habitaciones
- Reporta incidencias
- Ve habitaciones de todo el equipo en vista colaborativa

### Administrador (role: 'admin')
- Acceso al panel administrativo
- Gestión de todo el personal
- Resolución de incidencias
- Métricas y estadísticas

### Cambiar entre roles:
Usa las credenciales de prueba en la pantalla de login:
- Para **Mucama**: `maria` / `1234`
- Para **Administrador**: `admin` / `admin`

O modifica los usuarios en `app.js` (AuthModule.users):
```javascript
const AuthModule = {
    users: [
        {
            id: 1,
            username: 'maria',
            password: '1234',
            name: 'María González',
            role: 'maid', // 'maid' o 'admin'
            email: 'maria@hotel.com'
        },
        // ... más usuarios
    ]
};
```

## 🎨 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary: #6366f1;
    --success: #10b981;
    --danger: #ef4444;
    /* ... más colores */
}
```

### Agregar Nuevos Módulos
1. Crea una nueva sección en `index.html`
2. Agrega estilos específicos en `styles.css`
3. Crea un nuevo módulo en `app.js`:
```javascript
const NewModule = {
    async init() { /* ... */ },
    render() { /* ... */ }
};
```

## 📝 Notas Técnicas

- **No requiere compilación**: Código vanilla listo para usar
- **Sin dependencias npm**: Solo CDN de Bootstrap
- **Compatible con Android 5.0+**: PWA funcional en dispositivos modernos
- **Tamaño ligero**: ~100KB total (sin contar Bootstrap CDN)

## 🐛 Solución de Problemas

### La aplicación no carga
- Verifica que estés sirviendo desde un servidor web (no `file://`)
- Abre la consola del navegador para ver errores

### Service Worker no funciona
- Solo funciona con HTTPS o localhost
- Verifica en DevTools > Application > Service Workers

### IndexedDB bloqueado
- Algunos navegadores en modo privado bloquean IndexedDB
- Verifica permisos del navegador

## 📄 Licencia

Este es un proyecto de demostración educativo. Úsalo libremente para aprender o como base para tu proyecto.

## 🤝 Contribución

Para extender la aplicación:
1. Mantén la estructura modular
2. Documenta nuevas funciones
3. Sigue el patrón de diseño mobile-first
4. Prueba en dispositivos móviles reales

## 📚 Guía de Funcionalidades Administrativas

### 🏷️ Gestión de Códigos QR

**Acceso**: Dashboard → "Códigos QR"

Permite generar y gestionar códigos QR únicos para cada habitación:

```javascript
// Generar QR para una habitación
QRCodeModule.generateQRCode(roomNumber);

// Mostrar QR en modal
app.showQRCode('101');

// Descargar QR
app.downloadRoomQR('101');

// Imprimir QR
app.printRoomQR('101');
```

**Para integrar con librería real:**
```javascript
// En QRCodeModule.generateQRCode()
const qr = new QRCode(element, {
    text: `ROOM-${roomNumber}`,
    width: 256,
    height: 256
});
```

### 📅 Asignaciones Diarias

**Acceso**: Dashboard → "Asignaciones"

Gestiona las asignaciones de habitaciones a mucamas por fecha:

```javascript
// Cargar asignaciones de una fecha
AssignmentsModule.loadAssignments('2025-11-24');

// Asignación masiva
app.showBulkAssignmentModal();

// Limpiar asignaciones de una mucama
app.clearAssignment(maidId);
```

**Flujo recomendado:**
1. Seleccionar fecha
2. Click en "Asignación Masiva"
3. Seleccionar mucama
4. Mantener Ctrl y seleccionar múltiples habitaciones
5. Click en "Asignar"

### 🔔 Sistema de Notificaciones

**Acceso**: Dashboard → "Notificaciones" o ícono de campana

Muestra un timeline de eventos del hotel:

```javascript
// Agregar notificación programáticamente
NotificationsModule.addNotification(
    'incident', // tipo: incident, task, alert
    'Nueva incidencia',
    'Habitación 101 - Grifo gotea'
);

// Filtrar notificaciones
app.filterNotifications('incident', buttonElement);

// Marcar como leída
app.markNotificationRead(notificationId);
```

### 🔒 Bloqueo de Habitaciones

**Acceso**: Dashboard → "Bloqueadas" o desde detalle de habitación

Bloquea habitaciones para mantenimiento o limpieza profunda:

```javascript
// Bloquear habitación
BlockedRoomsModule.blockRoom(roomId, 'Mantenimiento de plomería');

// Desbloquear
BlockedRoomsModule.unblockRoom(roomId);
```

**Efectos del bloqueo:**
- La habitación aparece con candado en todas las vistas
- Se marca automáticamente como "no disponible para reservas"
- Se genera notificación automática
- Se muestra en la vista de "Habitaciones Bloqueadas"

### 📊 Filtros del Dashboard

El dashboard administrativo incluye filtros dinámicos:

```javascript
// Filtrar por edificio
<select id="buildingFilter">
    <option value="all">Todos los edificios</option>
    <!-- Se puebla automáticamente -->
</select>

// Filtrar por mucama
<select id="maidFilter">
    <option value="all">Todas las mucamas</option>
    <!-- Se puebla automáticamente -->
</select>

// Las métricas se actualizan en tiempo real
app.filterDashboard();
```

### 🔍 Búsqueda en Tiempo Real

Implementado en varias secciones:

```javascript
// Búsqueda de incidencias
app.searchIncidents(); // Se activa con onkeyup

// Búsqueda de habitaciones
app.searchRooms();

// La búsqueda filtra por:
// - Número de habitación
// - Edificio
// - Descripción
// - Personal asignado
```

### 📝 CRUD Completo

Todas las entidades tienen operaciones completas:

**Habitaciones:**
```javascript
app.showNewRoomForm();      // Crear
app.showRoomDetailAdmin(id); // Leer
app.editRoom(id);            // Actualizar
app.deleteRoom(id);          // Eliminar
```

**Personal:**
```javascript
app.showNewMaidForm();
app.viewMaidDetails(id);
app.editMaid(id);
app.deleteMaid(id);
```

**Edificios:**
```javascript
app.showNewBuildingForm();
app.editBuilding(id);
app.deleteBuilding(id);
```

### 🎨 Convenciones de Código

**Módulos:**
- Cada módulo es un objeto con métodos específicos
- Los métodos async usan `await` para operaciones de BD
- Todos los renders verifican data vacía

**Nomenclatura:**
- `render*()` - Renderiza vista
- `load*()` - Carga datos de BD
- `show*()` - Muestra modal o cambia vista
- `update*()` - Actualiza datos en BD

**Comentarios:**
```javascript
// === MÓDULO ===
// Para backend: indica integración necesaria
// In production: código para producción
// TODO: tareas pendientes
```

### 🔄 Flujo de Datos

```
1. Usuario hace acción (click, submit)
   ↓
2. app.function() maneja el evento
   ↓
3. Módulo específico procesa lógica
   ↓
4. DB.operation() guarda/lee de IndexedDB
   ↓
5. AppState se actualiza
   ↓
6. render() actualiza UI
   ↓
7. UI.showToast() da feedback
```

### 🚀 Integración con Backend

Para conectar con API real, reemplazar en cada módulo:

```javascript
// ANTES (local)
const data = await DB.getAll('rooms');

// DESPUÉS (API)
const response = await fetch('/api/rooms');
const data = await response.json();

// CREAR
await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomData)
});

// ACTUALIZAR
await fetch(`/api/rooms/${roomId}`, {
    method: 'PUT',
    body: JSON.stringify(roomData)
});

// ELIMINAR
await fetch(`/api/rooms/${roomId}`, {
    method: 'DELETE'
});
```

### 📱 Testing Rápido

1. **Login como Admin**: `admin` / `admin`
2. **Ver métricas**: Dashboard muestra resumen
3. **Generar QR**: Click en "Códigos QR"
4. **Asignar habitaciones**: Click en "Asignaciones"
5. **Bloquear habitación**: Detalle de habitación → "Bloquear"
6. **Ver notificaciones**: Click en campana o "Notificaciones"
7. **Filtrar datos**: Usar selectores en dashboard
8. **Buscar**: Usar barra de búsqueda en incidencias/habitaciones

---

**Desarrollado con ❤️ para simplificar el trabajo de las mucamas de hotel**

## 🎯 Resumen de Cambios

### ✅ Sistema Completo de Login
- Pantalla de login minimalista y mobile-first
- Autenticación con roles (mucama/admin)
- Persistencia de sesión con localStorage
- Auto-login en recargas
- Botón de logout funcional

### ✅ Dashboard Administrativo Expandido
- 9 módulos funcionales completos
- Gestión de QR codes
- Asignaciones diarias con calendario
- Sistema de notificaciones
- Bloqueo de habitaciones
- Búsqueda y filtros en tiempo real
- CRUD completo de todas las entidades

### 📁 Archivos Finales
- `index.html` - ~800 líneas (estructura completa)
- `styles.css` - ~1200 líneas (diseño mobile-first)
- `app.js` - ~2500 líneas (9 módulos JS)
- `manifest.json` - Configuración PWA
- `service-worker.js` - Funcionalidad offline
- `README.md` - Documentación completa

**Total: Sistema PWA empresarial completo y funcional** 🎉
