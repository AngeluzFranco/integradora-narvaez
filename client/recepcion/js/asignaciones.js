// RECEPCIÓN - ASIGNACIONES MODULE
const Asignaciones = {
    currentDate: new Date(),

    init() {
        document.getElementById('assignmentDate').value = this.formatDateInput(this.currentDate);
        document.getElementById('btnPrevDay').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('btnNextDay').addEventListener('click', () => this.changeDate(1));
        document.getElementById('btnBulkAssign').addEventListener('click', () => this.showBulkAssignModal());
    },

    formatDateInput(date) {
        return date.toISOString().split('T')[0];
    },

    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        document.getElementById('assignmentDate').value = this.formatDateInput(this.currentDate);
        this.refresh();
    },

    refresh() {
        this.render();
    },

    render() {
        const rooms = Utils.getStorage('rooms') || [];
        const maids = Utils.getStorage('maids') || [];
        const container = document.getElementById('assignmentsGrid');

        if (rooms.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="bi bi-calendar-x"></i><p>No hay asignaciones</p></div>';
            return;
        }

        container.innerHTML = rooms.map(room => {
            const maid = maids.find(m => m.id === room.maidId);
            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Habitación ${room.number}</h3>
                        <span class="badge badge-${room.status}">${Utils.getStatusLabel(room.status)}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-row">
                            <span class="card-label">Edificio</span>
                            <span class="card-value">${room.building}</span>
                        </div>
                        <div class="card-row">
                            <span class="card-label">Asignado a</span>
                            <span class="card-value">${maid ? maid.name : 'Sin asignar'}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-card-action edit" onclick="Asignaciones.reassign(${room.id})">
                            <i class="bi bi-person-check"></i> Reasignar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showBulkAssignModal() {
        const maids = Utils.getStorage('maids') || [];
        const html = `
            <div class="modal fade" id="modalBulkAssign" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Asignación Masiva</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Seleccione una mucama para asignar todas las habitaciones pendientes:</p>
                            <select class="form-select" id="bulkMaidSelect">
                                ${maids.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn-primary" onclick="Asignaciones.performBulkAssign()">Asignar Todas</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
        const modal = new bootstrap.Modal(document.getElementById('modalBulkAssign'));
        modal.show();
    },

    performBulkAssign() {
        const maidId = parseInt(document.getElementById('bulkMaidSelect').value);
        const maids = Utils.getStorage('maids') || [];
        const maid = maids.find(m => m.id === maidId);

        const rooms = Utils.getStorage('rooms') || [];
        rooms.forEach(room => {
            if (room.status === 'pending') {
                room.maidId = maidId;
                room.maidName = maid.name;
            }
        });

        Utils.setStorage('rooms', rooms);
        bootstrap.Modal.getInstance(document.getElementById('modalBulkAssign')).hide();
        this.render();
        Utils.showToast('Asignación masiva completada');
    },

    reassign(roomId) {
        Utils.showToast('Función de reasignación - implementar según necesidades');
    }
};

// RECEPCIÓN - QR MODULE
const QRManager = {
    init() {
        document.getElementById('btnGenerateAllQR').addEventListener('click', () => this.generateAll());
        document.getElementById('btnDownloadAllQR').addEventListener('click', () => this.downloadAll());
    },

    refresh() {
        this.render();
    },

    render() {
        const rooms = Utils.getStorage('rooms') || [];
        const container = document.getElementById('qrGrid');

        container.innerHTML = rooms.map(room => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Habitación ${room.number}</h3>
                </div>
                <div class="card-body">
                    <div style="width: 100%; aspect-ratio: 1; background: var(--light); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                        <i class="bi bi-qr-code" style="font-size: 4rem; color: var(--gray);"></i>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Código</span>
                        <span class="card-value">ROOM-${room.number}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-card-action edit" onclick="QRManager.download(${room.id})">
                        <i class="bi bi-download"></i> Descargar
                    </button>
                    <button class="btn-card-action edit" onclick="QRManager.print(${room.id})">
                        <i class="bi bi-printer"></i> Imprimir
                    </button>
                </div>
            </div>
        `).join('');
    },

    generateAll() {
        Utils.showToast('Generando códigos QR para todas las habitaciones...');
        // In production: Use qrcodejs2 or similar library
    },

    downloadAll() {
        Utils.showToast('Descargando todos los códigos QR...');
    },

    download(roomId) {
        Utils.showToast('Descargando código QR...');
    },

    print(roomId) {
        Utils.showToast('Imprimiendo código QR...');
    }
};

// RECEPCIÓN - INCIDENCIAS MODULE
const Incidencias = {
    init() {
        document.getElementById('filterIncidentStatus').addEventListener('change', () => this.refresh());
        document.getElementById('filterIncidentType').addEventListener('change', () => this.refresh());
    },

    refresh() {
        this.render();
    },

    render() {
        const incidents = Utils.getStorage('incidents') || [];
        const statusFilter = document.getElementById('filterIncidentStatus').value;
        const typeFilter = document.getElementById('filterIncidentType').value;

        const filtered = incidents.filter(inc => {
            if (statusFilter && inc.status !== statusFilter) return false;
            if (typeFilter && inc.type !== typeFilter) return false;
            return true;
        });

        const container = document.getElementById('incidentsTable');

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="bi bi-check-circle"></i><p>No hay incidencias</p></div>';
            return;
        }

        container.innerHTML = filtered.map(incident => `
            <div class="incident-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>Habitación ${incident.roomNumber}</strong>
                    <span class="badge badge-${incident.status}">${incident.status === 'pending' ? 'Pendiente' : 'Resuelta'}</span>
                </div>
                <div style="color: var(--gray); margin-bottom: 0.5rem;">
                    <i class="bi bi-tag"></i> ${Utils.getIncidentTypeLabel(incident.type)}
                </div>
                <div style="margin-bottom: 0.5rem;">${incident.description}</div>
                <div style="font-size: 0.85rem; color: var(--gray);">
                    Reportado por ${incident.maidName} - ${Utils.formatDateTime(new Date(incident.reportedAt))}
                </div>
                ${incident.status === 'pending' ? `
                    <div style="margin-top: 1rem;">
                        <button class="btn-primary btn-sm" onclick="Incidencias.resolve(${incident.id})">
                            <i class="bi bi-check-circle"></i> Marcar como Resuelta
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    resolve(incidentId) {
        const incidents = Utils.getStorage('incidents') || [];
        const incident = incidents.find(i => i.id === incidentId);
        if (incident) {
            incident.status = 'resolved';
            incident.resolvedAt = new Date().toISOString();
            Utils.setStorage('incidents', incidents);
            this.render();
            Utils.showToast('Incidencia marcada como resuelta');
        }
    }
};

// RECEPCIÓN - BLOQUEOS MODULE
const Bloqueos = {
    init() {
        document.getElementById('btnBlockRoom').addEventListener('click', () => this.showBlockModal());
    },

    refresh() {
        this.render();
    },

    render() {
        const rooms = Utils.getStorage('rooms') || [];
        const blocked = rooms.filter(r => r.status === 'blocked');
        const container = document.getElementById('blockedRoomsGrid');

        if (blocked.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="bi bi-unlock"></i><p>No hay habitaciones bloqueadas</p></div>';
            return;
        }

        container.innerHTML = blocked.map(room => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Habitación ${room.number}</h3>
                    <span class="badge badge-blocked">Bloqueada</span>
                </div>
                <div class="card-body">
                    <div class="card-row">
                        <span class="card-label">Edificio</span>
                        <span class="card-value">${room.building}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Razón</span>
                        <span class="card-value">${room.blockReason || 'No especificada'}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-card-action edit" onclick="Bloqueos.unblock(${room.id})">
                        <i class="bi bi-unlock"></i> Desbloquear
                    </button>
                </div>
            </div>
        `).join('');
    },

    showBlockModal() {
        const rooms = Utils.getStorage('rooms') || [];
        const available = rooms.filter(r => r.status !== 'blocked');

        const html = `
            <div class="modal fade" id="modalBlock" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Bloquear Habitación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Habitación</label>
                                <select class="form-select" id="blockRoomId">
                                    ${available.map(r => `<option value="${r.id}">${r.number} - ${r.building}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Razón del Bloqueo</label>
                                <textarea class="form-control" id="blockReason" rows="3" placeholder="Describe el motivo del bloqueo..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn-primary" onclick="Bloqueos.block()">Bloquear</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
        const modal = new bootstrap.Modal(document.getElementById('modalBlock'));
        modal.show();
    },

    block() {
        const roomId = parseInt(document.getElementById('blockRoomId').value);
        const reason = document.getElementById('blockReason').value;

        const rooms = Utils.getStorage('rooms') || [];
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            room.status = 'blocked';
            room.blockReason = reason;
            room.blockedAt = new Date().toISOString();
            Utils.setStorage('rooms', rooms);
        }

        bootstrap.Modal.getInstance(document.getElementById('modalBlock')).hide();
        this.render();
        Utils.showToast('Habitación bloqueada');
    },

    unblock(roomId) {
        if (confirm('¿Desbloquear esta habitación?')) {
            const rooms = Utils.getStorage('rooms') || [];
            const room = rooms.find(r => r.id === roomId);
            if (room) {
                room.status = 'pending';
                delete room.blockReason;
                delete room.blockedAt;
                Utils.setStorage('rooms', rooms);
                this.render();
                Utils.showToast('Habitación desbloqueada');
            }
        }
    }
};

// RECEPCIÓN - NOTIFICACIONES MODULE
const Notificaciones = {
    currentFilter: 'all',

    init() {
        const filterButtons = document.querySelectorAll('.btn-filter');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.refresh();
            });
        });
    },

    refresh() {
        this.render();
    },

    render() {
        const notifications = this.getNotifications();
        const container = document.getElementById('notificationsTimeline');

        if (notifications.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="bi bi-bell"></i><p>No hay notificaciones</p></div>';
            return;
        }

        container.innerHTML = notifications.map(notif => `
            <div class="notification-item">
                <div class="notification-icon" style="background: ${this.getIconColor(notif.type)};">
                    <i class="bi bi-${this.getIcon(notif.type)}" style="color: white;"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-text">${notif.text}</div>
                    <div class="notification-time">${Utils.formatDateTime(new Date(notif.timestamp))}</div>
                </div>
            </div>
        `).join('');
    },

    getNotifications() {
        // Generate notifications from incidents and room status changes
        const incidents = Utils.getStorage('incidents') || [];
        const notifications = incidents.map(inc => ({
            type: 'incident',
            title: `Incidencia en Habitación ${inc.roomNumber}`,
            text: inc.description,
            timestamp: inc.reportedAt
        }));

        return notifications.filter(n => {
            if (this.currentFilter === 'all') return true;
            return n.type === this.currentFilter;
        });
    },

    getIcon(type) {
        const icons = {
            incident: 'exclamation-triangle-fill',
            task: 'check-circle-fill',
            alert: 'bell-fill'
        };
        return icons[type] || 'info-circle-fill';
    },

    getIconColor(type) {
        const colors = {
            incident: 'var(--danger)',
            task: 'var(--success)',
            alert: 'var(--warning)'
        };
        return colors[type] || 'var(--info)';
    }
};
