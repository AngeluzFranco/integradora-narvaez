// ============================================
// MUCAMAS - INCIDENTS MODULE
// Report and view incidents in rooms
// ============================================

const Incidents = {
    currentMaidId: null,
    incidents: [],

    /**
     * Initialize incidents module
     */
    init() {
        const session = Auth.getSession();
        this.currentMaidId = session.id;

        // Load incidents
        this.loadIncidents();

        // Setup event listeners
        this.setupEventListeners();
    },

    /**
     * Load incidents from storage
     */
    loadIncidents() {
        let incidents = Utils.getStorage('incidents');

        // If no data, create empty array
        if (!incidents) {
            incidents = [];
            Utils.setStorage('incidents', incidents);
        }

        // Filter incidents reported by current maid
        this.incidents = incidents.filter(i => i.maidId === this.currentMaidId);
    },

    /**
     * Refresh incidents view
     */
    refresh() {
        this.loadIncidents();
        this.render();
    },

    /**
     * Render incidents list
     */
    render() {
        const container = document.getElementById('incidentsList');

        if (this.incidents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-check-circle"></i>
                    <p>No has reportado incidencias</p>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        const sortedIncidents = [...this.incidents].sort((a, b) => {
            return new Date(b.reportedAt) - new Date(a.reportedAt);
        });

        container.innerHTML = sortedIncidents.map(incident => `
            <div class="incident-card type-${incident.type}">
                <div class="incident-header">
                    <div class="incident-room">Habitación ${incident.roomNumber}</div>
                    <div class="incident-status status-${incident.status}">
                        ${incident.status === 'pending' ? 'Pendiente' : 'Resuelta'}
                    </div>
                </div>
                <div class="incident-type">
                    <i class="bi bi-tag"></i>
                    ${Utils.getIncidentTypeLabel(incident.type)}
                </div>
                <div class="incident-description">
                    ${incident.description}
                </div>
                <div class="incident-date">
                    <i class="bi bi-clock"></i>
                    ${Utils.formatDateTime(new Date(incident.reportedAt))}
                </div>
            </div>
        `).join('');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // New incident button
        document.getElementById('btnNewIncident').addEventListener('click', () => {
            this.showIncidentForm();
        });

        // Incident form submit
        document.getElementById('formIncident').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitIncident();
        });
    },

    /**
     * Show incident form modal
     */
    showIncidentForm() {
        // Populate room selector with assigned rooms
        const session = Auth.getSession();
        const allRooms = Utils.getStorage('rooms') || [];
        const assignedRooms = allRooms.filter(r => r.maidId === session.id);

        const roomSelect = document.getElementById('incidentRoom');
        roomSelect.innerHTML = '<option value="">Selecciona habitación</option>' +
            assignedRooms.map(room => `
                <option value="${room.number}">${room.number} - ${room.building}</option>
            `).join('');

        // Reset form
        document.getElementById('formIncident').reset();

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('modalIncidentForm'));
        modal.show();
    },

    /**
     * Submit incident report
     */
    async submitIncident() {
        const roomNumber = document.getElementById('incidentRoom').value;
        const type = document.getElementById('incidentType').value;
        const description = document.getElementById('incidentDescription').value;
        const photoInput = document.getElementById('incidentPhoto');

        if (!roomNumber || !type || !description) {
            Notifications.notifyError('Por favor completa todos los campos');
            return;
        }

        // Get room info
        const allRooms = Utils.getStorage('rooms') || [];
        const room = allRooms.find(r => r.number === roomNumber);

        if (!room) {
            Notifications.notifyError('Habitación no encontrada');
            return;
        }

        const session = Auth.getSession();

        // Create incident object
        const incident = {
            id: Utils.generateId(),
            roomId: room.id,
            roomNumber: room.number,
            building: room.building,
            type: type,
            description: description,
            status: 'pending',
            maidId: session.id,
            maidName: session.name,
            reportedAt: new Date().toISOString(),
            photos: [], // Máximo 3 fotos comprimidas en base64
            synced: false
        };

        // Handle photos if provided (máximo 3)
        if (photoInput.files && photoInput.files.length > 0) {
            const maxPhotos = Math.min(photoInput.files.length, 3);
            
            if (photoInput.files.length > 3) {
                Notifications.notifyError('Máximo 3 fotos permitidas. Se tomarán las primeras 3.');
            }

            try {
                // Comprimir y convertir cada foto a base64
                for (let i = 0; i < maxPhotos; i++) {
                    const compressedPhoto = await Utils.compressImage(photoInput.files[i], 0.7, 1024);
                    incident.photos.push(compressedPhoto);
                }
                this.saveIncident(incident);
            } catch (error) {
                console.error('Error compressing photos:', error);
                Notifications.notifyError('Error al procesar las fotos');
            }
        } else {
            this.saveIncident(incident);
        }
    },

    /**
     * Save incident to storage
     * @param {Object} incident 
     */
    saveIncident(incident) {
        // Add to storage
        const allIncidents = Utils.getStorage('incidents') || [];
        allIncidents.push(incident);
        Utils.setStorage('incidents', allIncidents);

        // Add to local incidents
        this.incidents.push(incident);

        // In production: Send to backend API
        // fetch('/api/incidents', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(incident)
        // });

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('modalIncidentForm')).hide();

        // Refresh view
        this.render();

        // Notify
        Notifications.notifyIncidentReported(incident.roomNumber);
    }
};
