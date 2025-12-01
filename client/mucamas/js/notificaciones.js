// ============================================
// MUCAMAS - NOTIFICATIONS MODULE
// Handle push/local notifications and toast messages
// ============================================

const Notifications = {
    /**
     * Initialize notifications module
     */
    init() {
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Register service worker for push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            this.registerServiceWorker();
        }
    },

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('../common/service-worker.js');
            console.log('[Notifications] Service Worker registered:', registration);
        } catch (error) {
            console.error('[Notifications] Service Worker registration failed:', error);
        }
    },

    /**
     * Show toast notification
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toastId = Utils.generateId();
        const icons = {
            success: 'check-circle-fill',
            error: 'exclamation-circle-fill',
            warning: 'exclamation-triangle-fill',
            info: 'info-circle-fill'
        };

        const colors = {
            success: 'text-success',
            error: 'text-danger',
            warning: 'text-warning',
            info: 'text-info'
        };

        const toastHTML = `
            <div class="toast align-items-center border-0" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i class="bi bi-${icons[type]} ${colors[type]} fs-5"></i>
                        <span>${message}</span>
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHTML);

        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: duration });
        toast.show();

        // Remove from DOM after hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },

    /**
     * Show browser notification (requires permission)
     * @param {string} title 
     * @param {string} body 
     * @param {string} icon 
     */
    showBrowserNotification(title, body, icon = null) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: icon || '/icon-192.png',
                badge: '/badge-72.png',
                vibrate: [200, 100, 200],
                tag: Utils.generateId()
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    },

    /**
     * Notify room status change
     * @param {string} roomNumber 
     * @param {string} status 
     */
    notifyRoomStatusChange(roomNumber, status) {
        const statusLabels = {
            'in-progress': 'iniciada',
            'done': 'completada'
        };

        const message = `Habitación ${roomNumber} ${statusLabels[status] || status}`;
        this.showToast(message, 'success');
        
        // Browser notification
        this.showBrowserNotification(
            'Estado Actualizado',
            message
        );
    },

    /**
     * Notify incident reported
     * @param {string} roomNumber 
     */
    notifyIncidentReported(roomNumber) {
        const message = `Incidencia reportada en habitación ${roomNumber}`;
        this.showToast(message, 'success');
        
        this.showBrowserNotification(
            'Incidencia Reportada',
            message
        );
    },

    /**
     * Notify QR scanned
     * @param {string} roomNumber 
     */
    notifyQRScanned(roomNumber) {
        const message = `Habitación ${roomNumber} escaneada correctamente`;
        this.showToast(message, 'success');
    },

    /**
     * Notify error
     * @param {string} message 
     */
    notifyError(message) {
        this.showToast(message, 'error', 4000);
    },

    /**
     * Schedule daily reminder for pending rooms
     * Called when app loads to set up reminders
     */
    scheduleDailyReminders() {
        // Check if reminders are enabled
        const remindersEnabled = Utils.getStorage('remindersEnabled', true);
        if (!remindersEnabled) return;

        // Get pending rooms count
        const rooms = Utils.getStorage('rooms') || [];
        const session = Auth.getSession();
        const pendingRooms = rooms.filter(r => 
            r.maidId === session.id && r.status === 'pending'
        );

        if (pendingRooms.length > 0) {
            // Show reminder notification
            this.showBrowserNotification(
                'Habitaciones Pendientes',
                `Tienes ${pendingRooms.length} habitación(es) pendiente(s) de limpiar hoy`,
                '/icon-192.png'
            );

            this.showToast(
                `Tienes ${pendingRooms.length} habitación(es) pendiente(s)`,
                'info',
                5000
            );
        }

        // Schedule next reminder (every 2 hours during work hours 8am-6pm)
        this.scheduleNextReminder();
    },

    /**
     * Schedule next reminder check
     */
    scheduleNextReminder() {
        const now = new Date();
        const currentHour = now.getHours();

        // Only schedule during work hours (8am-6pm)
        if (currentHour >= 8 && currentHour < 18) {
            setTimeout(() => {
                this.scheduleDailyReminders();
            }, 2 * 60 * 60 * 1000); // 2 hours
        } else {
            // Schedule for 8am next morning
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(8, 0, 0, 0);
            const msUntilTomorrow = tomorrow.getTime() - now.getTime();
            
            setTimeout(() => {
                this.scheduleDailyReminders();
            }, msUntilTomorrow);
        }
    },

    /**
     * Notify new assignment
     * @param {Object} room - Room assignment details
     */
    notifyNewAssignment(room) {
        const message = `Nueva asignación: Habitación ${room.number}`;
        this.showToast(message, 'info', 5000);
        
        this.showBrowserNotification(
            'Nueva Asignación',
            `Se te ha asignado la habitación ${room.number} en ${room.building}`,
            '/icon-192.png'
        );
    },

    /**
     * Notify incident update for admin
     * @param {Object} incident - Incident details
     */
    notifyIncidentUpdate(incident) {
        const message = `Incidencia en habitación ${incident.roomNumber}: ${incident.status}`;
        this.showToast(message, 'warning', 4000);
        
        this.showBrowserNotification(
            'Actualización de Incidencia',
            message,
            '/icon-192.png'
        );
    }
};
