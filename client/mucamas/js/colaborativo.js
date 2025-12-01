// ============================================
// MUCAMAS - COLLABORATIVE VIEW MODULE
// View rooms assigned to other maids
// ============================================

const Collaborative = {
    currentMaidId: null,
    allRooms: [],

    /**
     * Initialize collaborative view
     */
    init() {
        const session = Auth.getSession();
        this.currentMaidId = session.id;
    },

    /**
     * Refresh collaborative view
     */
    refresh() {
        this.loadRooms();
        this.render();
    },

    /**
     * Load all rooms (except current maid's rooms)
     */
    loadRooms() {
        const allRooms = Utils.getStorage('rooms') || [];
        
        // Filter out current maid's rooms
        this.allRooms = allRooms.filter(r => r.maidId !== this.currentMaidId);
    },

    /**
     * Render collaborative rooms list
     */
    render() {
        const container = document.getElementById('collaborativeList');

        if (this.allRooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-people"></i>
                    <p>No hay habitaciones de otros compañeros disponibles</p>
                </div>
            `;
            return;
        }

        // Group rooms by maid
        const groupedByMaid = this.allRooms.reduce((groups, room) => {
            const maidName = room.maidName || 'Sin asignar';
            if (!groups[maidName]) {
                groups[maidName] = [];
            }
            groups[maidName].push(room);
            return groups;
        }, {});

        // Render grouped rooms
        container.innerHTML = Object.entries(groupedByMaid).map(([maidName, rooms]) => `
            <div class="maid-group" style="margin-bottom: 2rem;">
                <h4 style="font-size: 1.125rem; font-weight: 600; color: var(--dark); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="bi bi-person-circle"></i>
                    ${maidName}
                    <span style="font-size: 0.9rem; font-weight: 500; color: var(--gray);">(${rooms.length})</span>
                </h4>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${this.renderRoomCards(rooms)}
                </div>
            </div>
        `).join('');
    },

    /**
     * Render room cards
     * @param {Array} rooms 
     * @returns {string}
     */
    renderRoomCards(rooms) {
        // Sort by status
        const sortedRooms = [...rooms].sort((a, b) => {
            const statusOrder = { 'in-progress': 0, 'pending': 1, 'done': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });

        return sortedRooms.map(room => `
            <div class="room-card status-${room.status}">
                <div class="room-header">
                    <div class="room-number">${room.number}</div>
                    <div class="room-status status-${room.status}">
                        ${Utils.getStatusLabel(room.status)}
                    </div>
                </div>
                <div class="room-details">
                    <div class="room-detail-item">
                        <i class="bi bi-building"></i>
                        <span>${room.building}</span>
                    </div>
                    <div class="room-detail-item">
                        <i class="bi bi-door-closed"></i>
                        <span>${room.type}</span>
                    </div>
                    ${room.status === 'in-progress' && room.startedAt ? `
                        <div class="room-detail-item">
                            <i class="bi bi-clock"></i>
                            <span>Iniciada ${this.getTimeAgo(room.startedAt)}</span>
                        </div>
                    ` : ''}
                    ${room.status === 'done' && room.completedAt ? `
                        <div class="room-detail-item">
                            <i class="bi bi-check-circle"></i>
                            <span>Completada ${this.getTimeAgo(room.completedAt)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Get time ago string
     * @param {string} isoString 
     * @returns {string}
     */
    getTimeAgo(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'hace un momento';
        if (diffMins === 1) return 'hace 1 minuto';
        if (diffMins < 60) return `hace ${diffMins} minutos`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return 'hace 1 hora';
        if (diffHours < 24) return `hace ${diffHours} horas`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'hace 1 día';
        return `hace ${diffDays} días`;
    }
};
