// RECEPCIÓN - EDIFICIOS MODULE
const Edificios = {
    init() {
        document.getElementById('btnNewBuilding').addEventListener('click', () => this.showCreateModal());
    },

    refresh() {
        this.render();
    },

    render() {
        const buildings = Utils.getStorage('buildings') || [];
        const container = document.getElementById('buildingsGrid');

        container.innerHTML = buildings.map(building => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${building.name}</h3>
                </div>
                <div class="card-body">
                    <div class="card-row">
                        <span class="card-label">Pisos</span>
                        <span class="card-value">${building.floors}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Habitaciones</span>
                        <span class="card-value">${building.totalRooms}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-card-action edit" onclick="Edificios.edit(${building.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn-card-action delete" onclick="Edificios.delete(${building.id})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    },

    showCreateModal() {
        const html = `
            <div class="modal fade" id="modalBuilding" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Nuevo Edificio</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Nombre</label>
                                <input type="text" class="form-control" id="buildingName" placeholder="Edificio C" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Número de Pisos</label>
                                <input type="number" class="form-control" id="buildingFloors" min="1" value="3" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Total de Habitaciones</label>
                                <input type="number" class="form-control" id="buildingRooms" min="1" value="15" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn-primary" onclick="Edificios.create()">Crear</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
        const modal = new bootstrap.Modal(document.getElementById('modalBuilding'));
        modal.show();
    },

    create() {
        const buildings = Utils.getStorage('buildings') || [];
        const newBuilding = {
            id: buildings.length + 1,
            name: document.getElementById('buildingName').value,
            floors: parseInt(document.getElementById('buildingFloors').value),
            totalRooms: parseInt(document.getElementById('buildingRooms').value)
        };

        buildings.push(newBuilding);
        Utils.setStorage('buildings', buildings);
        bootstrap.Modal.getInstance(document.getElementById('modalBuilding')).hide();
        this.render();
        Utils.showToast('Edificio creado exitosamente');
    },

    edit(id) {
        Utils.showToast('Función de edición - implementar según necesidades');
    },

    delete(id) {
        if (confirm('¿Eliminar este edificio?')) {
            const buildings = Utils.getStorage('buildings') || [];
            const filtered = buildings.filter(b => b.id !== id);
            Utils.setStorage('buildings', filtered);
            this.render();
            Utils.showToast('Edificio eliminado');
        }
    }
};

// RECEPCIÓN - PERSONAL MODULE
const Personal = {
    init() {
        document.getElementById('btnNewMaid').addEventListener('click', () => this.showCreateModal());
        document.getElementById('searchMaids').addEventListener('input', (e) => this.search(e.target.value));
    },

    refresh() {
        this.render();
    },

    render() {
        const maids = Utils.getStorage('maids') || [];
        const container = document.getElementById('maidsGrid');

        container.innerHTML = maids.map(maid => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${maid.name}</h3>
                    <span class="badge ${maid.active ? 'badge-done' : 'badge-blocked'}">
                        ${maid.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="card-row">
                        <span class="card-label"><i class="bi bi-envelope"></i> Email</span>
                        <span class="card-value">${maid.email}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label"><i class="bi bi-telephone"></i> Teléfono</span>
                        <span class="card-value">${maid.phone}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-card-action edit" onclick="Personal.edit(${maid.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn-card-action delete" onclick="Personal.delete(${maid.id})">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    },

    search(query) {
        // Implement search functionality
    },

    showCreateModal() {
        const html = `
            <div class="modal fade" id="modalMaid" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Nuevo Personal</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Nombre Completo</label>
                                <input type="text" class="form-control" id="maidName" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="maidEmail" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Teléfono</label>
                                <input type="tel" class="form-control" id="maidPhone" required>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn-primary" onclick="Personal.create()">Crear</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('modalContainer').innerHTML = html;
        const modal = new bootstrap.Modal(document.getElementById('modalMaid'));
        modal.show();
    },

    create() {
        const maids = Utils.getStorage('maids') || [];
        const newMaid = {
            id: maids.length + 1,
            name: document.getElementById('maidName').value,
            email: document.getElementById('maidEmail').value,
            phone: document.getElementById('maidPhone').value,
            active: true
        };

        maids.push(newMaid);
        Utils.setStorage('maids', maids);
        bootstrap.Modal.getInstance(document.getElementById('modalMaid')).hide();
        this.render();
        Utils.showToast('Personal creado exitosamente');
    },

    edit(id) {
        Utils.showToast('Función de edición - implementar según necesidades');
    },

    delete(id) {
        if (confirm('¿Eliminar este personal?')) {
            const maids = Utils.getStorage('maids') || [];
            const filtered = maids.filter(m => m.id !== id);
            Utils.setStorage('maids', filtered);
            this.render();
            Utils.showToast('Personal eliminado');
        }
    }
};
