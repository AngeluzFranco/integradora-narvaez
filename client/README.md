# 🚀 Inicio Rápido - Frontend Sistema Hotelero

## ⚡ Setup en 3 Pasos

### 1️⃣ Backend (Spring Boot)

```powershell
cd server
./mvnw spring-boot:run
```

✅ Backend corriendo en: `http://localhost:8080`  
✅ H2 Console: `http://localhost:8080/h2-console`

### 2️⃣ Frontend (Servidor Local)

**Opción A - VS Code Live Server (Recomendado)**
1. Instalar extensión "Live Server" en VS Code
2. Click derecho en `client/index.html`
3. "Open with Live Server"

**Opción B - http-server (Node.js)**
```powershell
cd client
npx http-server -p 5173 -c-1
```

**Opción C - Python Simple Server**
```powershell
cd client
python -m http.server 5173
```

✅ Frontend corriendo en: `http://localhost:5173`

### 3️⃣ Login y Prueba

**Usuarios precargados:**

| Usuario | Password | Rol | Vista |
|---------|----------|-----|-------|
| `mucama1` | `password` | Mucama | Móvil 📱 |
| `mucama2` | `password` | Mucama | Móvil 📱 |
| `recepcion1` | `password` | Recepción | Desktop 💻 |
| `admin` | `password` | Admin | Desktop 💻 |

---

## 📱 Flujo Mucama (Mobile)

1. Login con `mucama1` / `password`
2. Ver habitaciones asignadas (inicialmente vacío)
3. **Asignar habitación desde recepción primero** ⚠️
4. Cambiar estado: Tap habitación → Limpia/Sucia/Ocupada
5. Crear incidencia: Tab "Incidencias" → + Nueva → Subir fotos
6. Escanear QR: Tab "Escanear" → Permitir cámara

## 💻 Flujo Recepción (Desktop)

1. Login con `recepcion1` / `password`
2. Dashboard → Ver KPIs y gráficas
3. **Asignar habitaciones a mucamas:**
   - Habitaciones → Click "Editar" en habitación
   - (Actualmente no hay selector de mucama en modal, necesitas editar directamente)
   - **Workaround:** Usar POST directo con fetch en consola:
   ```javascript
   // En consola del navegador:
   fetch('http://localhost:8080/api/rooms/1', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('hotel_auth_token')
     },
     body: JSON.stringify({
       id: 1,
       number: "101",
       floor: 1,
       status: "DIRTY",
       building: { id: 1 },
       assignedTo: { id: 3 }, // ID de mucama1
       assignedAt: new Date().toISOString(),
       active: true
     })
   })
   ```
4. Generar QR: Códigos QR → Generar Todos → Imprimir
5. Ver incidencias: Incidencias → Resolver con notas

---

## 🔧 Configuración

### Cambiar Puerto del Frontend

**En `client/js/config.js`:**
```javascript
export const API_URL = 'http://localhost:8080/api';
```

### CORS Backend

**En `server/src/main/resources/application.properties`:**
```properties
# Ya configurado para localhost:5173 y localhost:3000
```

---

## 🎯 Endpoints Clave

| Función | Endpoint | Método |
|---------|----------|--------|
| Login | `/api/auth/login` | POST |
| Habitaciones todas | `/api/rooms` | GET |
| Habitaciones mucama | `/api/rooms/maid/{id}` | GET |
| Cambiar estado | `/api/rooms/{id}/status` | PATCH |
| Crear incidencia | `/api/incidents` | POST |
| Resolver incidencia | `/api/incidents/{id}/resolve` | PATCH |

---

## 🐛 Problemas Comunes

### ❌ "CORS policy" error
**Causa:** Frontend no en puerto permitido  
**Solución:** Usar `localhost:5173` o añadir puerto en `SecurityConfig.java`

### ❌ "401 Unauthorized"
**Causa:** Token JWT expirado  
**Solución:** Re-login (el sistema redirige automáticamente)

### ❌ "Mucama sin habitaciones"
**Causa:** No hay asignaciones  
**Solución:** Desde recepción, editar habitaciones y asignar mucama

### ❌ "Cámara no funciona"
**Causa:** HTTPS requerido (o localhost)  
**Solución:** Usar `localhost`, no `127.0.0.1` o IP

---

## 📂 Estructura Rápida

```
client/
├── index.html              ← Inicio aquí (login)
├── mucama/
│   ├── index.html          ← Dashboard mucama
│   ├── incidents.html      ← Incidencias
│   ├── qr-scan.html        ← Escanear QR
│   └── team.html           ← Ver equipo
└── recepcion/
    ├── index.html          ← Dashboard recepción
    ├── rooms.html          ← CRUD habitaciones
    ├── incidents.html      ← Gestión incidencias
    └── qr-codes.html       ← Generar QR
```

---

## 🎨 Screenshots

### Mucama (Mobile)
- ✅ Bottom navigation táctil
- ✅ Cards grandes con tap feedback
- ✅ Modals fullscreen
- ✅ Compresión automática de fotos

### Recepción (Desktop)
- ✅ Sidebar fijo con navegación
- ✅ KPIs con iconos y hover
- ✅ Gráficas Chart.js
- ✅ Tablas responsivas

---

## 📖 Documentación Completa

Ver: `client/FRONTEND-DOCS.md`

---

**¡Listo para probar! 🎉**
