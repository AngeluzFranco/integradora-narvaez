/* ======================================
   DB-SERVICE.JS - PouchDB Offline Database
   Maneja sincronización bidireccional con backend
   ====================================== */

import { STORAGE_KEYS, ENDPOINTS } from '../../js/config.js';

class DatabaseService {
    constructor() {
        // Bases de datos locales PouchDB
        this.roomsDB = null;
        this.incidentsDB = null;
        this.syncDB = null;
        
        // Estado de conexión
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.pendingChanges = [];
        
        this.init();
    }

    async init() {
        try {
            // Inicializar PouchDB (se carga desde CDN en HTML)
            if (typeof PouchDB === 'undefined') {
                console.warn('PouchDB no disponible, funcionando solo online');
                return;
            }

            // Crear bases de datos locales
            this.roomsDB = new PouchDB('hotel_rooms');
            this.incidentsDB = new PouchDB('hotel_incidents');
            this.syncDB = new PouchDB('hotel_sync_queue');

            console.log('✅ PouchDB inicializado correctamente');

            // Configurar listeners de conectividad
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());

            // Sincronizar si hay conexión
            if (this.isOnline) {
                await this.syncAll();
            }

        } catch (error) {
            console.error('❌ Error inicializando PouchDB:', error);
        }
    }

    // === GESTIÓN DE HABITACIONES ===

    async saveRoomsLocal(rooms) {
        if (!this.roomsDB) return;
        
        try {
            const docs = rooms.map(room => ({
                _id: `room_${room.id}`,
                ...room,
                localUpdated: Date.now()
            }));

            for (const doc of docs) {
                try {
                    const existing = await this.roomsDB.get(doc._id);
                    doc._rev = existing._rev;
                } catch (e) {
                    // Documento no existe, es nuevo
                }
                await this.roomsDB.put(doc);
            }

            console.log(`💾 ${rooms.length} habitaciones guardadas localmente`);
        } catch (error) {
            console.error('Error guardando habitaciones:', error);
        }
    }

    async getRoomsLocal(maidId = null) {
        if (!this.roomsDB) return [];
        
        try {
            const result = await this.roomsDB.allDocs({ include_docs: true });
            let rooms = result.rows.map(row => row.doc);

            // Filtrar por mucama si se especifica
            if (maidId) {
                rooms = rooms.filter(r => r.assignedTo?.id === maidId);
            }

            return rooms;
        } catch (error) {
            console.error('Error leyendo habitaciones:', error);
            return [];
        }
    }

    async updateRoomStatusLocal(roomId, status) {
        if (!this.roomsDB) return null;

        try {
            const doc = await this.roomsDB.get(`room_${roomId}`);
            doc.status = status;
            doc.updatedAt = new Date().toISOString();
            doc.localUpdated = Date.now();
            doc.pendingSync = true;

            await this.roomsDB.put(doc);

            // Agregar a cola de sincronización
            await this.addToSyncQueue({
                type: 'ROOM_STATUS',
                action: 'PATCH',
                endpoint: ENDPOINTS.ROOM_STATUS(roomId),
                data: status,
                roomId: roomId,
                timestamp: Date.now()
            });

            console.log(`💾 Estado de habitación ${roomId} actualizado localmente`);
            return doc;
        } catch (error) {
            console.error('Error actualizando estado local:', error);
            return null;
        }
    }

    // === GESTIÓN DE INCIDENCIAS ===

    async saveIncidentsLocal(incidents) {
        if (!this.incidentsDB) return;
        
        try {
            const docs = incidents.map(inc => ({
                _id: `incident_${inc.id || Date.now()}_${Math.random()}`,
                ...inc,
                localUpdated: Date.now()
            }));

            for (const doc of docs) {
                try {
                    const existing = await this.incidentsDB.get(doc._id);
                    doc._rev = existing._rev;
                } catch (e) {
                    // Documento no existe
                }
                await this.incidentsDB.put(doc);
            }

            console.log(`💾 ${incidents.length} incidencias guardadas localmente`);
        } catch (error) {
            console.error('Error guardando incidencias:', error);
        }
    }

    async getIncidentsLocal(maidId = null) {
        if (!this.incidentsDB) return [];
        
        try {
            const result = await this.incidentsDB.allDocs({ include_docs: true });
            let incidents = result.rows.map(row => row.doc);

            // Filtrar por mucama si se especifica
            if (maidId) {
                incidents = incidents.filter(i => i.reportedBy?.id === maidId);
            }

            return incidents;
        } catch (error) {
            console.error('Error leyendo incidencias:', error);
            return [];
        }
    }

    async createIncidentLocal(incidentData) {
        if (!this.incidentsDB) return null;

        try {
            const doc = {
                _id: `incident_temp_${Date.now()}`,
                ...incidentData,
                createdAt: new Date().toISOString(),
                localCreated: true,
                pendingSync: true,
                localUpdated: Date.now()
            };

            await this.incidentsDB.put(doc);

            // Agregar a cola de sincronización
            await this.addToSyncQueue({
                type: 'INCIDENT_CREATE',
                action: 'POST',
                endpoint: ENDPOINTS.INCIDENTS,
                data: incidentData,
                tempId: doc._id,
                timestamp: Date.now()
            });

            console.log('💾 Incidencia creada localmente, pendiente de sincronización');
            return doc;
        } catch (error) {
            console.error('Error creando incidencia local:', error);
            return null;
        }
    }

    // === COLA DE SINCRONIZACIÓN ===

    async addToSyncQueue(item) {
        if (!this.syncDB) return;

        try {
            await this.syncDB.post({
                ...item,
                addedAt: Date.now(),
                synced: false
            });

            this.pendingChanges.push(item);
            console.log(`📤 Cambio agregado a cola de sincronización: ${item.type}`);

            // Intentar sincronizar si hay conexión
            if (this.isOnline && !this.syncInProgress) {
                await this.processSyncQueue();
            }
        } catch (error) {
            console.error('Error agregando a cola:', error);
        }
    }

    async processSyncQueue() {
        if (!this.syncDB || this.syncInProgress || !this.isOnline) return;

        this.syncInProgress = true;
        console.log('🔄 Procesando cola de sincronización...');

        try {
            const result = await this.syncDB.allDocs({ include_docs: true });
            const pending = result.rows
                .map(row => row.doc)
                .filter(doc => !doc.synced)
                .sort((a, b) => a.addedAt - b.addedAt);

            console.log(`📋 ${pending.length} cambios pendientes de sincronización`);

            for (const item of pending) {
                try {
                    await this.syncItem(item);
                    
                    // Marcar como sincronizado
                    item.synced = true;
                    item.syncedAt = Date.now();
                    await this.syncDB.put(item);

                    console.log(`✅ Sincronizado: ${item.type}`);
                } catch (error) {
                    console.error(`❌ Error sincronizando ${item.type}:`, error);
                    // No marcamos como sincronizado, se reintentará
                }
            }

            // Limpiar items sincronizados antiguos (más de 7 días)
            await this.cleanOldSyncedItems();

        } catch (error) {
            console.error('Error procesando cola:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncItem(item) {
        // Importar API dinámicamente para evitar circulares
        const apiModule = await import('../../js/api.js');
        const api = apiModule.default;

        switch (item.type) {
            case 'ROOM_STATUS':
                await api.patch(item.endpoint, item.data);
                // Actualizar documento local
                const roomId = item.roomId;
                if (roomId && this.roomsDB) {
                    try {
                        const roomDoc = await this.roomsDB.get(`room_${roomId}`);
                        delete roomDoc.pendingSync;
                        await this.roomsDB.put(roomDoc);
                    } catch (err) {
                        console.log('Documento de habitación no encontrado localmente:', err);
                    }
                }
                break;

            case 'INCIDENT_CREATE':
                const newIncident = await api.post(item.endpoint, item.data);
                // Reemplazar documento temporal con el real
                if (item.tempId && newIncident.id) {
                    const tempDoc = await this.incidentsDB.get(item.tempId);
                    await this.incidentsDB.remove(tempDoc);
                    
                    await this.incidentsDB.put({
                        _id: `incident_${newIncident.id}`,
                        ...newIncident,
                        localUpdated: Date.now()
                    });
                }
                break;

            default:
                console.warn(`Tipo de sincronización desconocido: ${item.type}`);
        }
    }

    async cleanOldSyncedItems() {
        if (!this.syncDB) return;

        try {
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const result = await this.syncDB.allDocs({ include_docs: true });
            
            for (const row of result.rows) {
                const doc = row.doc;
                if (doc.synced && doc.syncedAt < sevenDaysAgo) {
                    await this.syncDB.remove(doc);
                }
            }
        } catch (error) {
            console.error('Error limpiando items antiguos:', error);
        }
    }

    // === SINCRONIZACIÓN COMPLETA ===

    async syncAll() {
        if (!this.isOnline) {
            console.log('⚠️ Sin conexión, sincronización omitida');
            return;
        }

        console.log('🔄 Iniciando sincronización completa...');

        try {
            // Importar API
            const apiModule = await import('../../js/api.js');
            const api = apiModule.default;

            const userData = api.getUserData();
            if (!userData) return;

            // Sincronizar habitaciones
            if (userData.role === 'MAID') {
                const rooms = await api.get(ENDPOINTS.ROOMS_BY_MAID(userData.userId));
                await this.saveRoomsLocal(rooms);

                const incidents = await api.get(ENDPOINTS.INCIDENTS_BY_MAID(userData.userId));
                await this.saveIncidentsLocal(incidents);
            }

            // Procesar cola de cambios pendientes
            await this.processSyncQueue();

            console.log('✅ Sincronización completa finalizada');
        } catch (error) {
            console.error('❌ Error en sincronización completa:', error);
        }
    }

    // === MANEJO DE CONECTIVIDAD ===

    handleOnline() {
        console.log('✅ Conexión restaurada');
        this.isOnline = true;
        this.showConnectivityToast('Conexión restaurada. Sincronizando...', 'success');
        this.syncAll();
    }

    handleOffline() {
        console.log('⚠️ Sin conexión a internet');
        this.isOnline = false;
        this.showConnectivityToast('Sin conexión. Los cambios se guardarán localmente.', 'warning');
    }

    showConnectivityToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
        toast.style.zIndex = '9999';
        toast.style.maxWidth = '90%';
        toast.innerHTML = `
            <strong>${type === 'success' ? '🌐' : '📵'}</strong> ${message}
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 4000);
    }

    // === ESTADO Y ESTADÍSTICAS ===

    async getOfflineStats() {
        if (!this.syncDB) return null;

        try {
            const result = await this.syncDB.allDocs({ include_docs: true });
            const pending = result.rows.filter(row => !row.doc.synced);

            return {
                isOnline: this.isOnline,
                pendingChanges: pending.length,
                syncInProgress: this.syncInProgress,
                roomsCount: this.roomsDB ? (await this.roomsDB.info()).doc_count : 0,
                incidentsCount: this.incidentsDB ? (await this.incidentsDB.info()).doc_count : 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
        }
    }

    // === LIMPIAR DATOS (LOGOUT) ===

    async clearAllData() {
        try {
            if (this.roomsDB) await this.roomsDB.destroy();
            if (this.incidentsDB) await this.incidentsDB.destroy();
            if (this.syncDB) await this.syncDB.destroy();

            console.log('🗑️ Bases de datos locales eliminadas');
        } catch (error) {
            console.error('Error limpiando datos:', error);
        }
    }
}

// Exportar instancia única (singleton)
const dbService = new DatabaseService();
export default dbService;
