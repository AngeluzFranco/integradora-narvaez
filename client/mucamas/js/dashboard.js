// ============================================
// MUCAMAS - DASHBOARD MODULE
// Main screen with assigned rooms
// ============================================

const Dashboard = {
    currentMaidId: null,
    rooms: [],

    /**
     * Initialize dashboard
     */
    init() {
        const session = Auth.getSession();
        this.currentMaidId = session.id;

        // Load rooms from storage or create demo data
        this.loadRooms();

        // Render initial view
        this.render();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize and schedule notifications
        Notifications.scheduleDailyReminders();
    },

    /**
     * Load rooms data from API or local storage
     */
    async loadRooms() {
        try {
            // Try to load from API
            if (typeof API !== 'undefined') {
                const response = await API.getAssignments();
                
                if (response.data && response.source === 'network') {
                    // Got fresh data from network
                    const assignments = response.data;
                    
                    // Extract rooms from assignments
                    this.rooms = assignments
                        .filter(a => a.maidId === this.currentMaidId)
                        .map(a => ({
                            id: a.roomId || a.id,
                            number: a.roomNumber,
                            building: a.building,
                            floor: a.floor,
                            type: a.roomType,
                            status: a.status || 'pending',
                            maidId: a.maidId,
                            maidName: a.maidName,
                            notes: a.notes || '',
                            priority: a.priority || 'normal',
                            assignedAt: a.assignedAt,
                            startedAt: a.startedAt,
                            completedAt: a.completedAt
                        }));
                    
                    // Cache in localStorage
                    Utils.setStorage('rooms', this.rooms);
                    return;
                }
                
                // Fallback to cached data
                if (response.data && response.source === 'cache') {
                    console.log('[Dashboard] Using cached data');
                    const assignments = response.data;
                    this.rooms = assignments
                        .filter(a => a.maidId === this.currentMaidId)
                        .map(a => ({
                            id: a.roomId || a.id,
                            number: a.roomNumber,
                            building: a.building,
                            floor: a.floor,
                            type: a.roomType,
                            status: a.status || 'pending',
                            maidId: a.maidId,
                            maidName: a.maidName,
                            notes: a.notes || '',
                            priority: a.priority || 'normal',
                            assignedAt: a.assignedAt
                        }));
                    return;
                }
            }
        } catch (error) {
            console.error('[Dashboard] Error loading from API:', error);
        }

        // Final fallback - localStorage or demo data
        let rooms = Utils.getStorage('rooms');

        // If no data, create demo rooms
        if (!rooms || rooms.length === 0) {
            rooms = this.createDemoRooms();
            Utils.setStorage('rooms', rooms);
        }

        // Filter rooms assigned to current maid
        this.rooms = rooms.filter(r => r.maidId === this.currentMaidId);
    },

    /**
     * Create demo rooms for testing
     * @returns {Array}
     */
    createDemoRooms() {
        const session = Auth.getSession();
        const maidId = session.id;

        return [
            {
                id: 1,
                number: '101',
                building: 'Edificio A',
                floor: 1,
                type: 'Estándar',
                status: 'pending',
                maidId: maidId,
                maidName: session.name,
                notes: 'Check-out a las 11:00',
                priority: 'normal',
                assignedAt: new Date().toISOString()
            },
            {
                id: 2,
                number: '102',
                building: 'Edificio A',
                floor: 1,
                type: 'Suite',
                status: 'pending',
                maidId: maidId,
                maidName: session.name,
                notes: '',
                priority: 'high',
                assignedAt: new Date().toISOString()
            },
            {
                id: 3,
                number: '103',
                building: 'Edificio A',
                floor: 1,
                type: 'Estándar',
                status: 'in-progress',
                maidId: maidId,
                maidName: session.name,
                notes: '',
                priority: 'normal',
                startedAt: new Date().toISOString(),
                assignedAt: new Date().toISOString()
            },
            {
                id: 4,
                number: '201',
                building: 'Edificio A',
                floor: 2,
                type: 'Estándar',
                status: 'pending',
                maidId: maidId,
                maidName: session.name,
                notes: 'Solicita toallas extra',
                priority: 'normal',
                assignedAt: new Date().toISOString()
            },
            {
                id: 5,
                number: '202',
                building: 'Edificio A',
                floor: 2,
                type: 'Suite',
                status: 'done',
                maidId: maidId,
                maidName: session.name,
                notes: '',
                priority: 'normal',
                completedAt: new Date(Date.now() - 3600000).toISOString(),
                assignedAt: new Date().toISOString()
            }
        ];
    },

    /**
     * Refresh dashboard data
     */
    refresh() {
        this.loadRooms();
        this.render();
    },

    /**
     * Render dashboard
     */
    render() {
        this.updateStats();
        this.renderRoomsList();
    },

    /**
     * Update statistics cards
     */
    updateStats() {
        const pending = this.rooms.filter(r => r.status === 'pending').length;
        const inProgress = this.rooms.filter(r => r.status === 'in-progress').length;
        const done = this.rooms.filter(r => r.status === 'done').length;

        document.getElementById('statPending').textContent = pending;
        document.getElementById('statProgress').textContent = inProgress;
        document.getElementById('statDone').textContent = done;
    },

    /**
     * Render rooms list
     */
    renderRoomsList() {
        const container = document.getElementById('roomsList');

        if (this.rooms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No tienes habitaciones asignadas hoy</p>
                </div>
            `;
            return;
        }

        // Sort by priority and status
        const sortedRooms = [...this.rooms].sort((a, b) => {
            const statusOrder = { 'in-progress': 0, 'pending': 1, 'done': 2 };
            const priorityOrder = { 'high': 0, 'normal': 1, 'low': 2 };

            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }

            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        container.innerHTML = sortedRooms.map(room => `
            <div class="room-card status-${room.status}" data-room-id="${room.id}">
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
                    ${room.priority === 'high' ? `
                        <div class="room-detail-item">
                            <i class="bi bi-exclamation-circle text-danger"></i>
                            <span>Prioridad Alta</span>
                        </div>
                    ` : ''}
                    ${room.notes ? `
                        <div class="room-detail-item">
                            <i class="bi bi-chat-left-text"></i>
                            <span>${Utils.truncate(room.notes, 30)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Room card click - show details modal
        document.getElementById('roomsList').addEventListener('click', (e) => {
            const card = e.target.closest('.room-card');
            if (card) {
                const roomId = parseInt(card.dataset.roomId);
                this.showRoomDetail(roomId);
            }
        });

        // Start cleaning button
        document.getElementById('btnStartCleaning').addEventListener('click', () => {
            this.startCleaning();
        });

        // Finish cleaning button
        document.getElementById('btnFinishCleaning').addEventListener('click', () => {
            this.finishCleaning();
        });
    },

    /**
     * Show room detail modal
     * @param {number} roomId 
     */
    showRoomDetail(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;

        // Store current room
        this.currentRoom = room;

        // Update modal title
        document.getElementById('modalRoomTitle').textContent = `Habitación ${room.number}`;

        // Update modal content
        const infoContainer = document.getElementById('modalRoomInfo');
        infoContainer.innerHTML = `
            <div class="room-detail-row">
                <span class="room-detail-label">Edificio</span>
                <span class="room-detail-value">${room.building}</span>
            </div>
            <div class="room-detail-row">
                <span class="room-detail-label">Piso</span>
                <span class="room-detail-value">${room.floor}</span>
            </div>
            <div class="room-detail-row">
                <span class="room-detail-label">Tipo</span>
                <span class="room-detail-value">${room.type}</span>
            </div>
            <div class="room-detail-row">
                <span class="room-detail-label">Estado</span>
                <span class="room-detail-value">${Utils.getStatusLabel(room.status)}</span>
            </div>
            ${room.notes ? `
                <div class="room-detail-row">
                    <span class="room-detail-label">Notas</span>
                    <span class="room-detail-value">${room.notes}</span>
                </div>
            ` : ''}
        `;

        // Show/hide action buttons based on status
        const btnStart = document.getElementById('btnStartCleaning');
        const btnFinish = document.getElementById('btnFinishCleaning');

        if (room.status === 'pending') {
            btnStart.style.display = 'flex';
            btnFinish.style.display = 'none';
        } else if (room.status === 'in-progress') {
            btnStart.style.display = 'none';
            btnFinish.style.display = 'flex';
        } else {
            btnStart.style.display = 'none';
            btnFinish.style.display = 'none';
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('modalRoomDetail'));
        modal.show();
    },

    /**
     * Start cleaning a room
     */
    startCleaning() {
        const room = this.currentRoom;
        if (!room) return;

        // Update room status
        room.status = 'in-progress';
        room.startedAt = new Date().toISOString();

        // Save to storage
        const allRooms = Utils.getStorage('rooms');
        const index = allRooms.findIndex(r => r.id === room.id);
        if (index !== -1) {
            allRooms[index] = room;
            Utils.setStorage('rooms', allRooms);
        }

        // Update local rooms
        const localIndex = this.rooms.findIndex(r => r.id === room.id);
        if (localIndex !== -1) {
            this.rooms[localIndex] = room;
        }

        // Refresh UI
        this.render();

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('modalRoomDetail')).hide();

        // Notify
        Notifications.notifyRoomStatusChange(room.number, 'in-progress');
    },

    /**
     * Finish cleaning a room
     */
    finishCleaning() {
        const room = this.currentRoom;
        if (!room) return;

        // Update room status
        room.status = 'done';
        room.completedAt = new Date().toISOString();

        // Save to storage
        const allRooms = Utils.getStorage('rooms');
        const index = allRooms.findIndex(r => r.id === room.id);
        if (index !== -1) {
            allRooms[index] = room;
            Utils.setStorage('rooms', allRooms);
        }

        // Update local rooms
        const localIndex = this.rooms.findIndex(r => r.id === room.id);
        if (localIndex !== -1) {
            this.rooms[localIndex] = room;
        }

        // Refresh UI
        this.render();

        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('modalRoomDetail')).hide();

        // Notify
        Notifications.notifyRoomStatusChange(room.number, 'done');
    }
};
