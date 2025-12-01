// RECEPCIÓN - HABITACIONES MODULE
const Habitaciones = {
    init() {
        document.getElementById('btnNewRoom').addEventListener('click', () => this.showCreateModal());
        document.getElementById('searchRooms').addEventListener('input', (e) => this.search(e.target.value));
    },

    refresh() {
        this.render();
    },

    render() {
        const rooms = Utils.getStorage('rooms') || [];
        const container = document.getElementById('roomsTable');

        if (rooms.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="bi bi-inbox"></i><p>No hay habitaciones registradas</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="table-header" style="grid-template-columns: 100px 1fr 1fr 1fr 150px 150px;">
                <div>Número</div>
                <div>Edificio</div>
                <div>Tipo</div>
                <div>Mucama</div>
                <div>Estado</div>
                <div>Acciones</div>
            </div>
            ${rooms.map(room => `
                <div class="table-row" style="grid-template-columns: 100px 1fr 1fr 1fr 150px 150px;">
                    <div><strong>${room.number}</strong></div>
                    <div>${room.building}</div>
                    <div>${room.type}</div>
                    <div>${room.maidName || 'Sin asignar'}</div>
                    <div><span class="badge badge-${room.status}">${Utils.getStatusLabel(room.status)}</span></div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-icon" onclick="Habitaciones.edit(${room.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn-icon" onclick="Habitaciones.delete(${room.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    },

    search(query) {
        const rooms = Utils.getStorage('rooms') || [];
        const filtered = rooms.filter(r => 
            r.number.includes(query) || 
            r.building.toLowerCase().includes(query.toLowerCase())
        );
        // Re-render with filtered results
        this.render();
    },

    showCreateModal() {
        const buildings = Utils.getStorage('buildings') || [];
        const maids = Utils.getStorage('maids') || [];

        const html = `
            <div class="modal fade" id="modalRoom" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Nueva Habitación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Número</label>
                                <input type="text" class="form-control" id="roomNumber" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Edificio</label>
                                <select class="form-select" id="roomBuilding">
                                    ${buildings.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Tipo</label>
                                <select class="form-select" id="roomType">
                                    <option value="Estándar">Estándar</option>
                                    <option value="Suite">Suite</option>
                                    <option value="Deluxe">Deluxe</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn-primary" onclick="Habitaciones.create()">Crear</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
        const modal = new bootstrap.Modal(document.getElementById('modalRoom'));
        modal.show();
    },

    create() {
        const rooms = Utils.getStorage('rooms') || [];
        const newRoom = {
            id: rooms.length + 1,
            number: document.getElementById('roomNumber').value,
            building: document.getElementById('roomBuilding').value,
            floor: parseInt(document.getElementById('roomNumber').value[0]) || 1,
            type: document.getElementById('roomType').value,
            status: 'pending',
            maidId: null,
            maidName: null,
            priority: 'normal',
            notes: '',
            assignedAt: new Date().toISOString()
        };

        rooms.push(newRoom);
        Utils.setStorage('rooms', rooms);
        bootstrap.Modal.getInstance(document.getElementById('modalRoom')).hide();
        this.render();
        Utils.showToast('Habitación creada exitosamente');
    },

    edit(id) {
        Utils.showToast('Función de edición - implementar según necesidades');
    },

    delete(id) {
        if (confirm('¿Eliminar esta habitación?')) {
            const rooms = Utils.getStorage('rooms') || [];
            const filtered = rooms.filter(r => r.id !== id);
            Utils.setStorage('rooms', filtered);
            this.render();
            Utils.showToast('Habitación eliminada');
        }
    }
};
