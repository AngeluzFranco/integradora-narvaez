/* ======================================
   MUCAMA-HOME.JS - Dashboard Mucama
   Backend: GET /api/rooms/maid/{maidId}
            PATCH /api/rooms/{id}/status
   ====================================== */

import api from '../../js/api.js';
import { ENDPOINTS, ROOM_STATUS, USER_ROLES } from '../../js/config.js';

let currentRooms = [];
let currentRoomId = null;

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

    // Cargar habitaciones asignadas
    await loadMyRooms();

    // Event listeners para cambiar estado
    setupStatusButtons();

    // Actualizar cada 30 segundos
    setInterval(loadMyRooms, 30000);
});

// Cargar habitaciones asignadas a esta mucama
// Backend: RoomController.getRoomsByMaid() - GET /api/rooms/maid/{maidId}
async function loadMyRooms() {
    try {
        const userData = api.getUserData();
        const rooms = await api.get(ENDPOINTS.ROOMS_BY_MAID(userData.userId));
        
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
async function updateRoomStatus(roomId, status) {
    try {
        // Cerrar modal
        const modalEl = document.getElementById('roomModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        // Actualizar en backend
        await api.patch(ENDPOINTS.ROOM_STATUS(roomId), status);

        showToast('Estado actualizado correctamente', 'success');

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
