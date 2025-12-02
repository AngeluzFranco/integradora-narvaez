/* ======================================
   MUCAMA-INCIDENTS.JS - Gestión Incidencias con Offline
   Backend: GET /api/incidents/maid/{maidId}
            POST /api/incidents
            GET /api/rooms/maid/{maidId}
   ====================================== */

import api from '../../js/api.js';
import { ENDPOINTS, INCIDENT_STATUS, USER_ROLES } from '../../js/config.js';
import dbService from './db-service.js';

let allIncidents = [];
let currentFilter = 'all';
let selectedPhotos = [];
let myRooms = [];

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

    // Connectivity indicator
    updateConnectivityIndicator();
    window.addEventListener('online', () => {
        updateConnectivityIndicator();
        loadIncidents();
    });
    window.addEventListener('offline', updateConnectivityIndicator);

    // Cargar habitaciones asignadas (para el selector)
    await loadMyRooms();

    // Cargar incidencias
    await loadIncidents();

    // Setup listeners
    setupFilterButtons();
    setupNewIncidentButton();
    setupIncidentForm();
    setupPhotoUpload();

    // Auto-refresh cada 30 segundos (solo online)
    setInterval(() => {
        if (navigator.onLine) loadIncidents();
    }, 30000);
});

// Cargar habitaciones asignadas para el selector (con offline)
async function loadMyRooms() {
    try {
        const userData = api.getUserData();
        
        if (navigator.onLine) {
            myRooms = await api.get(ENDPOINTS.ROOMS_BY_MAID(userData.userId));
            // Guardar en local
            await dbService.saveRoomsLocal(myRooms);
        } else {
            // Usar cache local
            myRooms = await dbService.getRoomsLocal();
            showToast('📴 Modo offline - usando datos guardados', 'warning');
        }
        
        populateRoomSelector();
    } catch (error) {
        console.error('Error loading rooms:', error);
        // Intentar cargar desde cache local
        try {
            myRooms = await dbService.getRoomsLocal();
            populateRoomSelector();
        } catch (e) {
            showToast('Error al cargar habitaciones', 'danger');
        }
    }
}

function populateRoomSelector() {
    const select = document.getElementById('incidentRoom');
    select.innerHTML = '<option value="">Seleccione una habitación</option>' +
        myRooms.map(room => `
            <option value="${room.id}">Hab. ${room.number} - ${room.building?.name || ''}</option>
        `).join('');
}

// Cargar incidencias de esta mucama (con offline)
// Backend: IncidentController.getIncidentsByMaid() - GET /api/incidents/maid/{maidId}
async function loadIncidents() {
    try {
        const userData = api.getUserData();
        
        if (navigator.onLine) {
            const incidents = await api.get(ENDPOINTS.INCIDENTS_BY_MAID(userData.userId));
            allIncidents = incidents;
            
            // Guardar en local
            await dbService.saveIncidentsLocal(incidents);
        } else {
            // Usar cache local
            allIncidents = await dbService.getIncidentsLocal();
        }
        
        renderIncidents(filterIncidents(allIncidents));

    } catch (error) {
        console.error('Error loading incidents:', error);
        // Intentar cargar desde cache
        try {
            allIncidents = await dbService.getIncidentsLocal();
            renderIncidents(filterIncidents(allIncidents));
            showToast('📴 Usando datos guardados', 'info');
        } catch (e) {
            showToast('Error al cargar incidencias', 'danger');
        }
    }
}

function filterIncidents(incidents) {
    if (currentFilter === 'all') return incidents;
    return incidents.filter(inc => inc.status === currentFilter);
}

function renderIncidents(incidents) {
    const container = document.getElementById('incidentsList');
    const emptyState = document.getElementById('emptyState');

    if (incidents.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    container.innerHTML = incidents.map(incident => `
        <div class="incident-card incident-severity-${incident.severity}" 
             onclick="viewIncidentDetail(${incident.id})">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <strong>Hab. ${incident.room?.number || 'N/A'}</strong>
                    <span class="badge ms-2 ${incident.status === 'OPEN' ? 'badge-open' : 'badge-resolved'}">
                        ${incident.status === 'OPEN' ? 'Abierta' : 'Resuelta'}
                    </span>
                </div>
                <span class="badge bg-secondary">${getSeverityText(incident.severity)}</span>
            </div>
            
            <p class="mb-2">${truncateText(incident.description, 100)}</p>
            
            ${incident.photos ? `
                <div class="incident-photos">
                    ${parsePhotos(incident.photos).map(photo => `
                        <img src="${photo}" class="incident-photo" alt="Foto incidencia">
                    `).join('')}
                </div>
            ` : ''}
            
            <small class="text-muted">
                ${formatDate(incident.createdAt)}
            </small>
        </div>
    `).join('');
}

// Setup filtros
function setupFilterButtons() {
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            renderIncidents(filterIncidents(allIncidents));
        });
    });
}

// Setup botón nueva incidencia
function setupNewIncidentButton() {
    document.getElementById('newIncidentBtn').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('newIncidentModal'));
        modal.show();
    });
}

// Setup formulario de nueva incidencia
function setupIncidentForm() {
    document.getElementById('incidentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createIncident();
    });
}

// Crear nueva incidencia (con offline sync)
// Backend: IncidentController.createIncident() - POST /api/incidents
async function createIncident() {
    try {
        const userData = api.getUserData();
        const roomId = document.getElementById('incidentRoom').value;
        const description = document.getElementById('incidentDescription').value;
        const severity = document.getElementById('incidentSeverity').value;

        if (!roomId) {
            showToast('Seleccione una habitación', 'warning');
            return;
        }

        // Preparar fotos en base64 (comprimidas)
        const photosBase64 = await Promise.all(
            selectedPhotos.map(photo => compressAndConvertToBase64(photo))
        );

        const incidentData = {
            room: { id: parseInt(roomId) },
            reportedBy: { id: userData.userId },
            description: description,
            severity: severity,
            status: INCIDENT_STATUS.OPEN,
            photos: JSON.stringify(photosBase64)
        };

        if (navigator.onLine) {
            // Enviar directamente
            await api.post(ENDPOINTS.INCIDENTS, incidentData);
            showToast('Incidencia registrada correctamente', 'success');
        } else {
            // Guardar en local para sync posterior
            await dbService.createIncidentLocal(incidentData);
            showToast('📴 Incidencia guardada. Se sincronizará cuando haya conexión', 'warning');
        }

        // Cerrar modal y resetear
        const modal = bootstrap.Modal.getInstance(document.getElementById('newIncidentModal'));
        modal.hide();
        resetIncidentForm();

        // Recargar lista
        await loadIncidents();

    } catch (error) {
        console.error('Error creating incident:', error);
        showToast('Error al registrar incidencia', 'danger');
    }
}

// Setup carga de fotos
function setupPhotoUpload() {
    const input = document.getElementById('incidentPhotos');
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + selectedPhotos.length > 3) {
            showToast('Máximo 3 fotos permitidas', 'warning');
            return;
        }

        selectedPhotos.push(...files);
        renderPhotoPreview();
    });
}

function renderPhotoPreview() {
    const container = document.getElementById('photoPreviewContainer');
    container.innerHTML = selectedPhotos.map((photo, index) => `
        <div class="photo-preview">
            <img src="${URL.createObjectURL(photo)}" alt="Preview">
            <div class="photo-preview-remove" onclick="removePhoto(${index})">×</div>
        </div>
    `).join('');
}

window.removePhoto = (index) => {
    selectedPhotos.splice(index, 1);
    renderPhotoPreview();
};

// Comprimir imagen a base64 (máx 0.5MB por foto según README)
async function compressAndConvertToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize si es muy grande
                const maxDimension = 1024;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Comprimir a JPEG 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function resetIncidentForm() {
    document.getElementById('incidentForm').reset();
    selectedPhotos = [];
    renderPhotoPreview();
}

// Ver detalle de incidencia
window.viewIncidentDetail = async (incidentId) => {
    try {
        const incident = await api.get(ENDPOINTS.INCIDENT_BY_ID(incidentId));
        
        const content = `
            <div class="p-3">
                <div class="mb-3">
                    <h6>Habitación</h6>
                    <p>${incident.room?.number || 'N/A'} - ${incident.room?.building?.name || ''}</p>
                </div>
                
                <div class="mb-3">
                    <h6>Estado</h6>
                    <span class="badge ${incident.status === 'OPEN' ? 'badge-open' : 'badge-resolved'}">
                        ${incident.status === 'OPEN' ? 'Abierta' : 'Resuelta'}
                    </span>
                </div>
                
                <div class="mb-3">
                    <h6>Severidad</h6>
                    <span class="badge bg-secondary">${getSeverityText(incident.severity)}</span>
                </div>
                
                <div class="mb-3">
                    <h6>Descripción</h6>
                    <p>${incident.description}</p>
                </div>
                
                ${incident.photos ? `
                    <div class="mb-3">
                        <h6>Fotos</h6>
                        <div class="d-flex gap-2 flex-wrap">
                            ${parsePhotos(incident.photos).map(photo => `
                                <img src="${photo}" class="img-fluid" style="max-width: 150px; border-radius: 8px;">
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${incident.status === 'RESOLVED' && incident.resolutionNotes ? `
                    <div class="mb-3">
                        <h6>Notas de Resolución</h6>
                        <p>${incident.resolutionNotes}</p>
                    </div>
                ` : ''}
                
                <div class="mb-3">
                    <small class="text-muted">Creada: ${formatDate(incident.createdAt)}</small><br>
                    ${incident.resolvedAt ? `<small class="text-muted">Resuelta: ${formatDate(incident.resolvedAt)}</small>` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('incidentDetailContent').innerHTML = content;
        const modal = new bootstrap.Modal(document.getElementById('incidentDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading incident detail:', error);
        showToast('Error al cargar detalle', 'danger');
    }
};

// Helpers
function parsePhotos(photosJson) {
    try {
        return JSON.parse(photosJson);
    } catch {
        return [];
    }
}

function getSeverityText(severity) {
    const map = {
        'LOW': 'Baja',
        'MEDIUM': 'Media',
        'HIGH': 'Alta'
    };
    return map[severity] || severity;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

function updateConnectivityIndicator() {
    const header = document.querySelector('.top-bar h3');
    if (!header) return;
    
    const existingBadge = header.querySelector('.connectivity-badge');
    if (existingBadge) existingBadge.remove();
    
    if (!navigator.onLine) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning text-dark ms-2 connectivity-badge';
        badge.textContent = '📴 Offline';
        header.appendChild(badge);
    }
}
