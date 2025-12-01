// ============================================
// MUCAMAS - UTILS MODULE
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
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    },

    /**
     * Format time to HH:MM format
     * @param {Date} date 
     * @returns {string}
     */
    formatTime(date) {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    /**
     * Format date and time
     * @param {Date} date 
     * @returns {string}
     */
    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Get data from localStorage
     * @param {string} key 
     * @param {any} defaultValue 
     * @returns {any}
     */
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Save data to localStorage
     * @param {string} key 
     * @param {any} value 
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to localStorage:', e);
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key 
     */
    removeStorage(key) {
        localStorage.removeItem(key);
    },

    /**
     * Get status label in Spanish
     * @param {string} status 
     * @returns {string}
     */
    getStatusLabel(status) {
        const labels = {
            'pending': 'Pendiente',
            'in-progress': 'En Proceso',
            'done': 'Limpiada',
            'blocked': 'Bloqueada'
        };
        return labels[status] || status;
    },

    /**
     * Get incident type label in Spanish
     * @param {string} type 
     * @returns {string}
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
    },

    /**
     * Truncate text to max length
     * @param {string} text 
     * @param {number} maxLength 
     * @returns {string}
     */
    truncate(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    /**
     * Compress image to base64
     * @param {File} file - Image file to compress
     * @param {number} quality - Compression quality (0-1)
     * @param {number} maxWidth - Maximum width in pixels
     * @returns {Promise<string>} Compressed image as base64
     */
    compressImage(file, quality = 0.7, maxWidth = 1024) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid image file'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    // Create canvas and compress
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 with compression
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    
                    console.log(`[Utils] Image compressed: ${Math.round(file.size / 1024)}KB -> ${Math.round(compressedBase64.length / 1024)}KB`);
                    
                    resolve(compressedBase64);
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }
};
