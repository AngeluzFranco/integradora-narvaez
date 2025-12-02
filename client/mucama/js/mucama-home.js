/* ======================================
   MUCAMA-HOME.JS - Dashboard Mucama CON OFFLINE + WEBSOCKET
   Backend: GET /api/rooms/maid/{maidId}
            PATCH /api/rooms/{id}/status
   Offline: PouchDB local storage + sync queue
   WebSocket: Notificaciones en tiempo real
   ====================================== */

import api from '../../js/api.js';
import { ENDPOINTS, ROOM_STATUS, USER_ROLES } from '../../js/config.js';
import dbService from './db-service.js';
import wsClient from '../../js/websocket-client.js';

let currentRooms = [];
let currentRoomId = null;
let isOfflineMode = !navigator.onLine;
let wsSubscriptions = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación y rol
    if (!api.isAuthenticated()) {
        window.location.href = '/index.html';
        return;
    }

    const userData = api.getUserData();
    if (userData.role !== USER_ROLES.MAID) {
        window.location.href = '/index.html';
        return;
    }

    // Mostrar nombre de usuario
    document.getElementById('userNameBadge').textContent = userData.name;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        api.logout();
        window.location.href = '/index.html';
    });

    // Mostrar indicador de conectividad
    updateConnectivityIndicator();
    window.addEventListener('online', () => {
        isOfflineMode = false;
        updateConnectivityIndicator();
        loadMyRooms();
    });
    window.addEventListener('offline', () => {
        isOfflineMode = true;
        updateConnectivityIndicator();
    });

    // Cargar habitaciones asignadas
    await loadMyRooms();

    // Event listeners para cambiar estado
    setupStatusButtons();

    // Conectar WebSocket para notificaciones en tiempo real
    if (navigator.onLine) {
        setupWebSocket();
    }

    // Actualizar cada 30 segundos (solo si no hay WebSocket)
    setInterval(() => {
        if (navigator.onLine && !wsClient.isConnected()) {
            loadMyRooms();
        }
    }, 30000);
});

// Cargar habitaciones asignadas a esta mucama (con soporte offline)
// Backend: RoomController.getRoomsByMaid() - GET /api/rooms/maid/{maidId}
// Offline: Lee desde PouchDB local
async function loadMyRooms() {
    try {
        const userData = api.getUserData();
        let rooms;

        if (navigator.onLine) {
            // ONLINE: Obtener del backend
            try {
                rooms = await api.get(ENDPOINTS.ROOMS_BY_MAID(userData.userId));
                // Guardar en PouchDB para uso offline
                await dbService.saveRoomsLocal(rooms);
            } catch (error) {
                console.warn('Error cargando del backend, usando datos locales:', error);
                rooms = await dbService.getRoomsLocal(userData.userId);
            }
        } else {
            // OFFLINE: Obtener de PouchDB
            console.log('📵 Modo offline: Cargando datos locales');
            rooms = await dbService.getRoomsLocal(userData.userId);
        }
        
        currentRooms = rooms;
        renderRooms(rooms);
        updateStats(rooms);

        // Ocultar/mostrar empty state
        if (rooms.length === 0) {
            document.getElementById('emptyState').classList.remove('d-none');
            document.getElementById('roomsList').classList.add('d-none');
        } else {
            document.getElementById('emptyState').classList.add('d-none');
            document.getElementById('roomsList').classList.remove('d-none');
        }

    } catch (error) {
        console.error('Error loading rooms:', error);
        showToast('Error al cargar habitaciones', 'danger');
    }
}

// Renderizar lista de habitaciones
function renderRooms(rooms) {
    const container = document.getElementById('roomsList');
    
    if (rooms.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = rooms.map(room => `
        <div class="room-card" onclick="openRoomModal(${room.id}, '${room.number}')">
            <span class="room-status-badge status-${room.status}">
                ${getStatusText(room.status)}
            </span>
            <div class="room-number">Hab. ${room.number}</div>
            <div class="room-building text-muted">
                ${room.building?.name || 'Sin edificio'} - Piso ${room.floor}
            </div>
            <div class="mt-2">
                <small class="text-muted">
                    Actualizado: ${formatDate(room.updatedAt)}
                </small>
            </div>
        </div>
    `).join('');
}

// Actualizar estadísticas
function updateStats(rooms) {
    const clean = rooms.filter(r => r.status === ROOM_STATUS.CLEAN).length;
    const dirty = rooms.filter(r => r.status === ROOM_STATUS.DIRTY).length;
    const occupied = rooms.filter(r => r.status === ROOM_STATUS.OCCUPIED).length;

    document.getElementById('cleanCount').textContent = clean;
    document.getElementById('dirtyCount').textContent = dirty;
    document.getElementById('occupiedCount').textContent = occupied;
}

// Abrir modal para cambiar estado
window.openRoomModal = (roomId, roomNumber) => {
    currentRoomId = roomId;
    document.getElementById('modalRoomNumber').textContent = roomNumber;
    
    const modal = new bootstrap.Modal(document.getElementById('roomModal'));
    modal.show();
};

// Setup event listeners para botones de estado
function setupStatusButtons() {
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newStatus = btn.dataset.status;
            await updateRoomStatus(currentRoomId, newStatus);
        });
    });
}

// Actualizar estado de habitación
// Backend: RoomController.updateRoomStatus() - PATCH /api/rooms/{id}/status
// Offline: Guarda en PouchDB y cola de sincronización
async function updateRoomStatus(roomId, status) {
    try {
        // Cerrar modal
        const modalEl = document.getElementById('roomModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        if (navigator.onLine) {
            // ONLINE: Actualizar en backend
            await api.patch(ENDPOINTS.ROOM_STATUS(roomId), status);
            showToast('Estado actualizado correctamente', 'success');
        } else {
            // OFFLINE: Guardar localmente para sincronizar después
            await dbService.updateRoomStatusLocal(roomId, status);
            showToast('💾 Estado guardado localmente. Se sincronizará al conectar.', 'warning');
        }

        // Recargar habitaciones
        await loadMyRooms();

    } catch (error) {
        console.error('Error updating room status:', error);
        showToast('Error al actualizar estado', 'danger');
    }
}

// Helpers
function getStatusText(status) {
    const statusMap = {
        [ROOM_STATUS.CLEAN]: 'Limpia',
        [ROOM_STATUS.DIRTY]: 'Sucia',
        [ROOM_STATUS.OCCUPIED]: 'Ocupada'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} hrs`;
    return date.toLocaleDateString();
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Indicador de conectividad en el header
function updateConnectivityIndicator() {
    const header = document.querySelector('.mobile-header .d-flex');
    if (!header) return;

    // Remover indicador anterior si existe
    const existing = header.querySelector('.connectivity-indicator');
    if (existing) existing.remove();

    // Crear nuevo indicador
    const indicator = document.createElement('div');
    indicator.className = 'connectivity-indicator d-flex align-items-center gap-2';
    
    if (navigator.onLine) {
        indicator.innerHTML = '<span class="badge bg-success">🌐 En línea</span>';
    } else {
        indicator.innerHTML = '<span class="badge bg-warning">📵 Offline</span>';
    }

    header.appendChild(indicator);
}

// ============ WEBSOCKET REAL-TIME UPDATES ============
function setupWebSocket() {
    wsClient.connect(() => {
        console.log('🔌 WebSocket conectado - Suscribiendo a notificaciones...');
        
        // Suscribirse a actualizaciones de habitaciones
        const roomsSub = wsClient.subscribe('/topic/rooms', (notification) => {
            console.log('📨 Notificación de habitación:', notification);
            handleRoomNotification(notification);
        });
        
        // Suscribirse a nuevas incidencias
        const incidentsSub = wsClient.subscribe('/topic/incidents', (notification) => {
            console.log('📨 Notificación de incidencia:', notification);
            handleIncidentNotification(notification);
        });
        
        // Suscribirse a notificaciones generales
        const notificationsSub = wsClient.subscribe('/topic/notifications', (notification) => {
            console.log('📨 Notificación general:', notification);
            showNotificationToast(notification);
        });
        
        wsSubscriptions.push(roomsSub, incidentsSub, notificationsSub);
    });
}

function handleRoomNotification(notification) {
    const { type, data } = notification;
    
    // Si es una actualización de habitación que nos afecta, recargar
    const userData = api.getUserData();
    if (data.assignedTo && data.assignedTo.id === userData.userId) {
        loadMyRooms();
        showToast(`Habitación ${data.number} actualizada`, 'info');
    }
}

function handleIncidentNotification(notification) {
    const { type, message } = notification;
    
    if (type === 'INCIDENT_CREATED') {
        // Reproducir sonido o mostrar notificación
        showToast('⚠️ ' + message, 'warning');
        
        // Mostrar notificación del navegador si está permitido
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nueva Incidencia', {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-72.png'
            });
        }
    }
}

function showNotificationToast(notification) {
    const { message, type } = notification;
    const alertType = type.includes('ERROR') ? 'danger' : 
                      type.includes('WARNING') ? 'warning' : 
                      type.includes('SUCCESS') ? 'success' : 'info';
    
    showToast(message, alertType);
}

// Limpiar WebSocket al salir
window.addEventListener('beforeunload', () => {
    wsSubscriptions.forEach(sub => wsClient.unsubscribe(sub));
    wsClient.disconnect();
});
