/* ======================================
   MUCAMA-QR.JS - Escaneo QR y Auto-asignación
   Backend: PUT /api/rooms/{id} - RoomController.updateRoom()
   ====================================== */

import api from '../../js/api.js';
import { ENDPOINTS, USER_ROLES } from '../../js/config.js';

let qrScanner = null;
let scannedRoomData = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!api.isAuthenticated()) {
        window.location.href = '/index.html';
        return;
    }

    const userData = api.getUserData();
    if (userData.role !== USER_ROLES.MAID) {
        window.location.href = '/index.html';
        return;
    }

    // Iniciar escáner QR
    await initQRScanner();

    // Setup botón de asignación
    document.getElementById('assignRoomBtn').addEventListener('click', assignRoom);
});

// Inicializar escáner QR con html5-qrcode
async function initQRScanner() {
    try {
        qrScanner = new Html5Qrcode("qr-reader");
        
        await qrScanner.start(
            { facingMode: "environment" }, // Cámara trasera
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            onScanSuccess,
            onScanError
        );

    } catch (error) {
        console.error('Error starting QR scanner:', error);
        showError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
}

// Callback cuando se escanea exitosamente
function onScanSuccess(decodedText, decodedResult) {
    // Detener escáner
    qrScanner.stop();

    try {
        // Parsear datos del QR (formato: JSON con id, number, hotel, building, timestamp)
        // Nota: El backend NO genera QRs actualmente, esta es funcionalidad solo frontend
        // según README.md. En producción, recepción genera y mucama escanea.
        const roomData = JSON.parse(decodedText);
        
        // Validar estructura
        if (!roomData.id || !roomData.number) {
            throw new Error('QR inválido');
        }

        // Validar caducidad (30 días según README)
        const qrDate = new Date(roomData.timestamp);
        const now = new Date();
        const daysDiff = (now - qrDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 30) {
            showError('Este código QR ha caducado (>30 días)');
            return;
        }

        scannedRoomData = roomData;
        showRoomResult(roomData);

    } catch (error) {
        console.error('Error parsing QR:', error);
        showError('Código QR inválido o formato incorrecto');
        
        // Reiniciar escáner después de error
        setTimeout(() => {
            document.getElementById('qr-error').classList.add('d-none');
            qrScanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                onScanError
            );
        }, 3000);
    }
}

function onScanError(error) {
    // No hacer nada, errores de escaneo son normales
}

// Mostrar resultado del QR escaneado
function showRoomResult(roomData) {
    document.getElementById('qr-result').classList.remove('d-none');
    document.getElementById('qr-room-info').innerHTML = `
        <strong>Habitación:</strong> ${roomData.number}<br>
        <strong>Edificio:</strong> ${roomData.building || 'N/A'}<br>
        <strong>Hotel:</strong> ${roomData.hotel || 'N/A'}
    `;
}

// Asignar habitación al usuario actual
// Backend: RoomController.updateRoom() - PUT /api/rooms/{id}
async function assignRoom() {
    try {
        const btn = document.getElementById('assignRoomBtn');
        btn.disabled = true;
        btn.textContent = 'Asignando...';

        const userData = api.getUserData();
        
        // Obtener habitación actual del backend para preservar otros datos
        const room = await api.get(ENDPOINTS.ROOM_BY_ID(scannedRoomData.id));
        
        // Actualizar con la asignación
        room.assignedTo = { id: userData.userId };
        room.assignedAt = new Date().toISOString();
        
        await api.put(ENDPOINTS.ROOM_BY_ID(scannedRoomData.id), room);

        showSuccess('¡Habitación asignada correctamente!');
        
        // Redirigir al inicio después de 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Error assigning room:', error);
        showError('Error al asignar habitación');
        
        const btn = document.getElementById('assignRoomBtn');
        btn.disabled = false;
        btn.textContent = 'Auto-asignarme esta Habitación';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('qr-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    if (qrScanner) {
        qrScanner.stop();
    }
});
