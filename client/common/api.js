// ============================================
// API MODULE - Backend integration with PouchDB for offline support
// ============================================

/**
 * API Configuration
 * Centralizes all backend endpoints and PouchDB databases
 */
const API_CONFIG = {
    baseURL: 'http://localhost:8080/api', // Spring Boot backend URL
    timeout: 10000,
    databases: {
        rooms: 'hotelclean_rooms',
        buildings: 'hotelclean_buildings',
        staff: 'hotelclean_staff',
        assignments: 'hotelclean_assignments',
        incidents: 'hotelclean_incidents',
        blocks: 'hotelclean_blocks',
        notifications: 'hotelclean_notifications'
    }
};

/**
 * PouchDB Manager
 * Handles offline database operations and sync with CouchDB/backend
 */
class DatabaseManager {
    constructor() {
        this.dbs = {};
        this.syncHandlers = {};
        this.isOnline = navigator.onLine;
        this.pendingSync = new Set();
        
        // Listen to online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    /**
     * Initialize a PouchDB database
     * @param {string} name - Database name
     * @param {string} remoteURL - Optional remote CouchDB URL
     */
    async initDB(name, remoteURL = null) {
        if (this.dbs[name]) return this.dbs[name];

        try {
            // Create local database
            this.dbs[name] = new PouchDB(name, {
                auto_compaction: true,
                revs_limit: 1
            });

            console.log(`[DB] Initialized local database: ${name}`);

            // Setup sync with remote if URL provided and online
            if (remoteURL && this.isOnline) {
                await this.setupSync(name, remoteURL);
            }

            return this.dbs[name];
        } catch (error) {
            console.error(`[DB] Error initializing ${name}:`, error);
            throw error;
        }
    }

    /**
     * Setup bidirectional sync with remote database
     */
    async setupSync(name, remoteURL) {
        try {
            const remoteDB = new PouchDB(remoteURL, {
                skip_setup: true
            });

            // Bidirectional sync
            this.syncHandlers[name] = this.dbs[name].sync(remoteDB, {
                live: true,
                retry: true,
                batch_size: 100
            })
            .on('change', (info) => {
                console.log(`[DB] ${name} sync change:`, info);
                this.notifySyncChange(name, info);
            })
            .on('paused', (err) => {
                console.log(`[DB] ${name} sync paused`, err);
            })
            .on('active', () => {
                console.log(`[DB] ${name} sync resumed`);
            })
            .on('denied', (err) => {
                console.error(`[DB] ${name} sync denied:`, err);
            })
            .on('error', (err) => {
                console.error(`[DB] ${name} sync error:`, err);
            });

            console.log(`[DB] Sync enabled for ${name}`);
        } catch (error) {
            console.error(`[DB] Error setting up sync for ${name}:`, error);
        }
    }

    /**
     * Handle online event
     */
    handleOnline() {
        console.log('[DB] Connection restored - syncing pending data');
        this.isOnline = true;
        
        // Trigger background sync
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('sync-data');
            });
        }

        // Notify application
        window.dispatchEvent(new CustomEvent('app:online'));
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('[DB] Connection lost - working offline');
        this.isOnline = false;
        window.dispatchEvent(new CustomEvent('app:offline'));
    }

    /**
     * Notify sync changes to application
     */
    notifySyncChange(dbName, info) {
        window.dispatchEvent(new CustomEvent('db:sync', {
            detail: { database: dbName, info }
        }));
    }

    /**
     * Get all documents from a database
     */
    async getAll(dbName) {
        const db = this.dbs[dbName];
        if (!db) throw new Error(`Database ${dbName} not initialized`);

        try {
            const result = await db.allDocs({
                include_docs: true,
                attachments: false
            });
            return result.rows.map(row => row.doc);
        } catch (error) {
            console.error(`[DB] Error getting all from ${dbName}:`, error);
            throw error;
        }
    }

    /**
     * Get a document by ID
     */
    async get(dbName, id) {
        const db = this.dbs[dbName];
        if (!db) throw new Error(`Database ${dbName} not initialized`);

        try {
            return await db.get(id);
        } catch (error) {
            if (error.status === 404) return null;
            console.error(`[DB] Error getting ${id} from ${dbName}:`, error);
            throw error;
        }
    }

    /**
     * Create or update a document
     */
    async put(dbName, doc) {
        const db = this.dbs[dbName];
        if (!db) throw new Error(`Database ${dbName} not initialized`);

        try {
            // Ensure _id exists
            if (!doc._id) {
                doc._id = this.generateId();
            }

            // Get existing doc to get _rev if updating
            if (!doc._rev) {
                try {
                    const existing = await db.get(doc._id);
                    doc._rev = existing._rev;
                } catch (err) {
                    // Document doesn't exist, creating new
                }
            }

            const result = await db.put(doc);
            return { ...doc, _rev: result.rev };
        } catch (error) {
            console.error(`[DB] Error putting to ${dbName}:`, error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async delete(dbName, id) {
        const db = this.dbs[dbName];
        if (!db) throw new Error(`Database ${dbName} not initialized`);

        try {
            const doc = await db.get(id);
            return await db.remove(doc);
        } catch (error) {
            console.error(`[DB] Error deleting ${id} from ${dbName}:`, error);
            throw error;
        }
    }

    /**
     * Query documents with a filter
     */
    async query(dbName, filter) {
        const docs = await this.getAll(dbName);
        return docs.filter(filter);
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear all local databases (for testing)
     */
    async clearAll() {
        for (const name in this.dbs) {
            try {
                await this.dbs[name].destroy();
                console.log(`[DB] Cleared ${name}`);
            } catch (error) {
                console.error(`[DB] Error clearing ${name}:`, error);
            }
        }
        this.dbs = {};
        this.syncHandlers = {};
    }
}

/**
 * API Service
 * Handles HTTP requests with offline fallback to PouchDB
 */
class APIService {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.timeout = API_CONFIG.timeout;
        this.db = new DatabaseManager();
        this.requestQueue = [];
        
        // Initialize databases
        this.initializeDatabases();
    }

    /**
     * Initialize all PouchDB databases
     */
    async initializeDatabases() {
        try {
            for (const [key, dbName] of Object.entries(API_CONFIG.databases)) {
                // In production: provide remote CouchDB URL
                // Example: await this.db.initDB(dbName, `${this.baseURL}/couch/${dbName}`);
                await this.db.initDB(dbName);
            }
            console.log('[API] All databases initialized');
        } catch (error) {
            console.error('[API] Error initializing databases:', error);
        }
    }

    /**
     * Make HTTP request with offline fallback
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            useCache = true,
            dbName = null,
            fallbackData = null
        } = options;

        // Build request
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('authToken');
        
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...headers
            },
            signal: AbortSignal.timeout(this.timeout)
        };

        if (body) {
            fetchOptions.body = JSON.stringify(body);
        }

        // Try network request first if online
        if (navigator.onLine) {
            try {
                const response = await fetch(url, fetchOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Cache in PouchDB if dbName provided
                if (useCache && dbName && data) {
                    await this.cacheResponse(dbName, data);
                }

                return { data, source: 'network' };
            } catch (error) {
                console.warn(`[API] Network request failed: ${error.message}`);
                // Fall through to offline handling
            }
        }

        // Offline or network failed - use PouchDB
        if (dbName) {
            try {
                const cachedData = await this.getCachedData(dbName, endpoint, method);
                if (cachedData) {
                    console.log(`[API] Using cached data for ${endpoint}`);
                    return { data: cachedData, source: 'cache' };
                }
            } catch (error) {
                console.error('[API] Cache retrieval failed:', error);
            }
        }

        // Queue for later if POST/PUT/DELETE
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            this.queueRequest(endpoint, options);
            return { 
                data: fallbackData, 
                source: 'queued',
                message: 'Request queued for sync when online'
            };
        }

        throw new Error('No network connection and no cached data available');
    }

    /**
     * Cache response in PouchDB
     */
    async cacheResponse(dbName, data) {
        try {
            if (Array.isArray(data)) {
                // Multiple documents
                for (const item of data) {
                    await this.db.put(dbName, item);
                }
            } else if (data._id || data.id) {
                // Single document
                const doc = { ...data, _id: data._id || data.id };
                await this.db.put(dbName, doc);
            }
        } catch (error) {
            console.error('[API] Error caching response:', error);
        }
    }

    /**
     * Get cached data from PouchDB
     */
    async getCachedData(dbName, endpoint, method) {
        if (method === 'GET') {
            // For GET requests, return all documents
            return await this.db.getAll(dbName);
        }
        return null;
    }

    /**
     * Queue request for later sync
     */
    queueRequest(endpoint, options) {
        const request = {
            id: this.db.generateId(),
            endpoint,
            options,
            timestamp: Date.now()
        };
        
        this.requestQueue.push(request);
        localStorage.setItem('api_queue', JSON.stringify(this.requestQueue));
        
        console.log('[API] Request queued:', request);
    }

    /**
     * Process queued requests (called by service worker sync)
     */
    async processQueue() {
        const queue = JSON.parse(localStorage.getItem('api_queue') || '[]');
        const processed = [];

        for (const request of queue) {
            try {
                await this.request(request.endpoint, {
                    ...request.options,
                    useCache: false
                });
                processed.push(request.id);
                console.log('[API] Processed queued request:', request.id);
            } catch (error) {
                console.error('[API] Failed to process queued request:', error);
            }
        }

        // Remove processed requests
        this.requestQueue = queue.filter(r => !processed.includes(r.id));
        localStorage.setItem('api_queue', JSON.stringify(this.requestQueue));

        return processed.length;
    }

    // ============================================
    // Authentication API
    // ============================================

    async login(username, password) {
        return await this.request('/auth/login', {
            method: 'POST',
            body: { username, password },
            useCache: false
        });
    }

    async logout() {
        return await this.request('/auth/logout', {
            method: 'POST',
            useCache: false
        });
    }

    async verifyToken() {
        return await this.request('/auth/verify', {
            method: 'GET',
            useCache: false
        });
    }

    // ============================================
    // Rooms API
    // ============================================

    async getRooms() {
        return await this.request('/rooms', {
            method: 'GET',
            dbName: API_CONFIG.databases.rooms
        });
    }

    async getRoom(id) {
        return await this.request(`/rooms/${id}`, {
            method: 'GET',
            dbName: API_CONFIG.databases.rooms
        });
    }

    async createRoom(roomData) {
        return await this.request('/rooms', {
            method: 'POST',
            body: roomData,
            dbName: API_CONFIG.databases.rooms,
            fallbackData: { ...roomData, _id: this.db.generateId() }
        });
    }

    async updateRoom(id, roomData) {
        return await this.request(`/rooms/${id}`, {
            method: 'PUT',
            body: roomData,
            dbName: API_CONFIG.databases.rooms,
            fallbackData: { ...roomData, _id: id }
        });
    }

    async deleteRoom(id) {
        return await this.request(`/rooms/${id}`, {
            method: 'DELETE',
            dbName: API_CONFIG.databases.rooms
        });
    }

    // ============================================
    // Buildings API
    // ============================================

    async getBuildings() {
        return await this.request('/buildings', {
            method: 'GET',
            dbName: API_CONFIG.databases.buildings
        });
    }

    async createBuilding(buildingData) {
        return await this.request('/buildings', {
            method: 'POST',
            body: buildingData,
            dbName: API_CONFIG.databases.buildings,
            fallbackData: { ...buildingData, _id: this.db.generateId() }
        });
    }

    async updateBuilding(id, buildingData) {
        return await this.request(`/buildings/${id}`, {
            method: 'PUT',
            body: buildingData,
            dbName: API_CONFIG.databases.buildings
        });
    }

    async deleteBuilding(id) {
        return await this.request(`/buildings/${id}`, {
            method: 'DELETE',
            dbName: API_CONFIG.databases.buildings
        });
    }

    // ============================================
    // Staff API
    // ============================================

    async getStaff() {
        return await this.request('/staff', {
            method: 'GET',
            dbName: API_CONFIG.databases.staff
        });
    }

    async getStaffMember(id) {
        return await this.request(`/staff/${id}`, {
            method: 'GET',
            dbName: API_CONFIG.databases.staff
        });
    }

    async createStaffMember(staffData) {
        return await this.request('/staff', {
            method: 'POST',
            body: staffData,
            dbName: API_CONFIG.databases.staff,
            fallbackData: { ...staffData, _id: this.db.generateId() }
        });
    }

    async updateStaffMember(id, staffData) {
        return await this.request(`/staff/${id}`, {
            method: 'PUT',
            body: staffData,
            dbName: API_CONFIG.databases.staff
        });
    }

    async deleteStaffMember(id) {
        return await this.request(`/staff/${id}`, {
            method: 'DELETE',
            dbName: API_CONFIG.databases.staff
        });
    }

    // ============================================
    // Assignments API
    // ============================================

    async getAssignments(date = null) {
        const endpoint = date ? `/assignments?date=${date}` : '/assignments';
        return await this.request(endpoint, {
            method: 'GET',
            dbName: API_CONFIG.databases.assignments
        });
    }

    async createAssignment(assignmentData) {
        return await this.request('/assignments', {
            method: 'POST',
            body: assignmentData,
            dbName: API_CONFIG.databases.assignments,
            fallbackData: { ...assignmentData, _id: this.db.generateId() }
        });
    }

    async updateAssignment(id, assignmentData) {
        return await this.request(`/assignments/${id}`, {
            method: 'PUT',
            body: assignmentData,
            dbName: API_CONFIG.databases.assignments
        });
    }

    async deleteAssignment(id) {
        return await this.request(`/assignments/${id}`, {
            method: 'DELETE',
            dbName: API_CONFIG.databases.assignments
        });
    }

    async bulkAssign(assignments) {
        return await this.request('/assignments/bulk', {
            method: 'POST',
            body: { assignments },
            dbName: API_CONFIG.databases.assignments,
            fallbackData: assignments.map(a => ({ ...a, _id: this.db.generateId() }))
        });
    }

    // ============================================
    // Incidents API
    // ============================================

    async getIncidents(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = queryString ? `/incidents?${queryString}` : '/incidents';
        return await this.request(endpoint, {
            method: 'GET',
            dbName: API_CONFIG.databases.incidents
        });
    }

    async getIncident(id) {
        return await this.request(`/incidents/${id}`, {
            method: 'GET',
            dbName: API_CONFIG.databases.incidents
        });
    }

    async createIncident(incidentData) {
        return await this.request('/incidents', {
            method: 'POST',
            body: incidentData,
            dbName: API_CONFIG.databases.incidents,
            fallbackData: { ...incidentData, _id: this.db.generateId() }
        });
    }

    async updateIncident(id, incidentData) {
        return await this.request(`/incidents/${id}`, {
            method: 'PUT',
            body: incidentData,
            dbName: API_CONFIG.databases.incidents
        });
    }

    async resolveIncident(id, resolution) {
        return await this.request(`/incidents/${id}/resolve`, {
            method: 'POST',
            body: { resolution },
            dbName: API_CONFIG.databases.incidents
        });
    }

    // ============================================
    // Blocks API
    // ============================================

    async getBlocks() {
        return await this.request('/blocks', {
            method: 'GET',
            dbName: API_CONFIG.databases.blocks
        });
    }

    async createBlock(blockData) {
        return await this.request('/blocks', {
            method: 'POST',
            body: blockData,
            dbName: API_CONFIG.databases.blocks,
            fallbackData: { ...blockData, _id: this.db.generateId() }
        });
    }

    async deleteBlock(id) {
        return await this.request(`/blocks/${id}`, {
            method: 'DELETE',
            dbName: API_CONFIG.databases.blocks
        });
    }

    // ============================================
    // Notifications API
    // ============================================

    async getNotifications() {
        return await this.request('/notifications', {
            method: 'GET',
            dbName: API_CONFIG.databases.notifications
        });
    }

    async markNotificationRead(id) {
        return await this.request(`/notifications/${id}/read`, {
            method: 'POST',
            dbName: API_CONFIG.databases.notifications
        });
    }

    async clearAllNotifications() {
        return await this.request('/notifications/clear', {
            method: 'DELETE',
            dbName: API_CONFIG.databases.notifications
        });
    }
}

// ============================================
// Export singleton instance
// ============================================
const API = new APIService();

// Expose globally for easy access
if (typeof window !== 'undefined') {
    window.API = API;
    window.DBManager = API.db;
}
