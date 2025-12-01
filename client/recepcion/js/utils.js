// ============================================
// RECEPCIÓN - UTILS MODULE
// Common helper functions
// ============================================

const Utils = {
    /**
     * Format date to readable Spanish format
     * @param {Date} date 
     * @returns {string}
     */
    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        };
        return date.toLocaleDateString('es-ES', options);
    },

    /**
     * Format date time
     * @param {Date} date 
     * @returns {string}
     */
    formatDateTime(date) {
        return date.toLocaleString('es-ES');
    },

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Get/Set localStorage
     */
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    setStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        alert(message); // Simplified for desktop
    },

    /**
     * Get status label
     */
    getStatusLabel(status) {
        const labels = {
            'pending': 'Pendiente',
            'in-progress': 'En Proceso',
            'done': 'Completada',
            'blocked': 'Bloqueada'
        };
        return labels[status] || status;
    },

    /**
     * Get incident type label
     */
    getIncidentTypeLabel(type) {
        const labels = {
            'maintenance': 'Mantenimiento',
            'cleaning': 'Limpieza Profunda',
            'supplies': 'Falta de Suministros',
            'damage': 'Daño en Mobiliario',
            'other': 'Otro'
        };
        return labels[type] || type;
    }
};
