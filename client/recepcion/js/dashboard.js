// ============================================
// RECEPCIÓN - DASHBOARD MODULE
// Main dashboard with KPIs and activity
// ============================================

const Dashboard = {
    init() {
        this.loadDemoData();
        this.refresh();
    },

    loadDemoData() {
        // Ensure demo data exists in storage
        if (!Utils.getStorage('rooms')) {
            const rooms = [];
            const buildings = ['Edificio A', 'Edificio B'];
            let id = 1;

            for (let building of buildings) {
                for (let floor = 1; floor <= 3; floor++) {
                    for (let roomNum = 1; roomNum <= 5; roomNum++) {
                        const number = `${floor}0${roomNum}`;
                        rooms.push({
                            id: id++,
                            number,
                            building,
                            floor,
                            type: roomNum === 5 ? 'Suite' : 'Estándar',
                            status: ['pending', 'in-progress', 'done'][Math.floor(Math.random() * 3)],
                            maidId: Math.floor(Math.random() * 2) + 1,
                            maidName: ['María González', 'Ana Martínez'][Math.floor(Math.random() * 2)],
                            priority: 'normal',
                            notes: '',
                            assignedAt: new Date().toISOString()
                        });
                    }
                }
            }
            Utils.setStorage('rooms', rooms);
        }

        if (!Utils.getStorage('buildings')) {
            Utils.setStorage('buildings', [
                { id: 1, name: 'Edificio A', floors: 3, totalRooms: 15 },
                { id: 2, name: 'Edificio B', floors: 3, totalRooms: 15 }
            ]);
        }

        if (!Utils.getStorage('maids')) {
            Utils.setStorage('maids', [
                { id: 1, name: 'María González', email: 'maria@hotel.com', phone: '555-0001', active: true },
                { id: 2, name: 'Ana Martínez', email: 'ana@hotel.com', phone: '555-0002', active: true }
            ]);
        }

        if (!Utils.getStorage('incidents')) {
            Utils.setStorage('incidents', [
                {
                    id: 1,
                    roomNumber: '101',
                    type: 'maintenance',
                    description: 'Aire acondicionado no funciona',
                    status: 'pending',
                    maidName: 'María González',
                    reportedAt: new Date().toISOString()
                }
            ]);
        }
    },

    refresh() {
        this.updateStats();
        this.renderActivity();
        this.renderSummary();
    },

    updateStats() {
        const rooms = Utils.getStorage('rooms') || [];
        const incidents = Utils.getStorage('incidents') || [];
        const maids = Utils.getStorage('maids') || [];

        document.getElementById('statTotalRooms').textContent = rooms.length;
        document.getElementById('statPending').textContent = rooms.filter(r => r.status === 'pending').length;
        document.getElementById('statProgress').textContent = rooms.filter(r => r.status === 'in-progress').length;
        document.getElementById('statDone').textContent = rooms.filter(r => r.status === 'done').length;
        document.getElementById('statIncidents').textContent = incidents.filter(i => i.status === 'pending').length;
        document.getElementById('statMaids').textContent = maids.filter(m => m.active).length;
    },

    renderActivity() {
        const container = document.getElementById('recentActivity');
        const rooms = Utils.getStorage('rooms') || [];
        
        const recent = rooms
            .filter(r => r.status === 'done' && r.completedAt)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay actividad reciente</p>';
            return;
        }

        container.innerHTML = recent.map(room => `
            <div style="padding: 0.75rem; background: var(--light); border-radius: 8px; display: flex; justify-content: space-between;">
                <span><strong>Habitación ${room.number}</strong> limpiada por ${room.maidName}</span>
                <span class="text-muted" style="font-size: 0.85rem;">${this.getTimeAgo(room.completedAt)}</span>
            </div>
        `).join('');
    },

    renderSummary() {
        const container = document.getElementById('dailySummary');
        const rooms = Utils.getStorage('rooms') || [];
        
        const total = rooms.length;
        const done = rooms.filter(r => r.status === 'done').length;
        const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

        container.innerHTML = `
            <div style="padding: 1rem; background: var(--light); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Progreso del Día</span>
                    <strong>${percentage}%</strong>
                </div>
                <div style="height: 12px; background: white; border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; background: var(--success); width: ${percentage}%;"></div>
                </div>
            </div>
            <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Habitaciones Completadas</span>
                    <strong>${done} / ${total}</strong>
                </div>
            </div>
        `;
    },

    getTimeAgo(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'hace un momento';
        if (diffMins < 60) return `hace ${diffMins} min`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `hace ${diffHours}h`;
        
        return `hace ${Math.floor(diffHours / 24)}d`;
    }
};
