// ============================================
// MUCAMAS - QR SCANNER MODULE
// Scan QR codes to assign/check rooms
// ============================================

const QRScanner = {
    scanning: false,
    html5QrCode: null,

    /**
     * Initialize QR scanner
     */
    init() {
        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.getElementById('btnStartScan').addEventListener('click', () => {
            this.startScan();
        });
    },

    /**
     * Start QR code scanning
     * In production: Use html5-qrcode library
     * https://github.com/mebjas/html5-qrcode
     */
    async startScan() {
        const cameraPreview = document.getElementById('cameraPreview');
        const btnScan = document.getElementById('btnStartScan');
        const scanResult = document.getElementById('scanResult');

        if (this.scanning) {
            this.stopScan();
            return;
        }

        // Check camera permission
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Notifications.notifyError('Tu dispositivo no soporta acceso a cámara');
            return;
        }

        try {
            btnScan.textContent = 'Buscando cámara...';
            btnScan.disabled = true;

            // In production: Initialize html5-qrcode library
            // this.html5QrCode = new Html5Qrcode("cameraPreview");
            // await this.html5QrCode.start(
            //     { facingMode: "environment" },
            //     { fps: 10, qrbox: 250 },
            //     this.onScanSuccess.bind(this),
            //     this.onScanError.bind(this)
            // );

            // DEMO: Simulate camera access and scan after 2 seconds
            cameraPreview.innerHTML = `
                <video style="width: 100%; height: 100%; object-fit: cover;" autoplay></video>
            `;

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            const video = cameraPreview.querySelector('video');
            video.srcObject = stream;

            this.scanning = true;
            btnScan.innerHTML = '<i class="bi bi-stop-circle"></i> Detener Escaneo';
            btnScan.disabled = false;

            // DEMO: Simulate successful scan after 3 seconds
            setTimeout(() => {
                if (this.scanning) {
                    this.onScanSuccess('ROOM-101');
                }
            }, 3000);

        } catch (error) {
            console.error('Error accessing camera:', error);
            Notifications.notifyError('No se pudo acceder a la cámara');
            cameraPreview.innerHTML = `
                <i class="bi bi-camera-fill"></i>
                <p>Error al acceder a la cámara</p>
            `;
            btnScan.innerHTML = '<i class="bi bi-qr-code-scan"></i> Iniciar Escaneo';
            btnScan.disabled = false;
        }
    },

    /**
     * Stop QR code scanning
     */
    stopScan() {
        const cameraPreview = document.getElementById('cameraPreview');
        const btnScan = document.getElementById('btnStartScan');

        // In production: Stop html5-qrcode
        // if (this.html5QrCode) {
        //     this.html5QrCode.stop();
        // }

        // Stop camera stream
        const video = cameraPreview.querySelector('video');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        cameraPreview.innerHTML = `
            <i class="bi bi-camera-fill"></i>
            <p>Esperando cámara...</p>
        `;

        btnScan.innerHTML = '<i class="bi bi-qr-code-scan"></i> Iniciar Escaneo';
        this.scanning = false;
    },

    /**
     * Handle successful QR scan
     * @param {string} decodedText - QR code content
     */
    onScanSuccess(decodedText) {
        console.log('[QRScanner] Scanned:', decodedText);

        // Stop scanning
        this.stopScan();

        // Parse QR code (format: ROOM-XXX)
        const roomNumber = this.parseQRCode(decodedText);

        if (!roomNumber) {
            Notifications.notifyError('Código QR inválido');
            return;
        }

        // Find room in assigned rooms
        const allRooms = Utils.getStorage('rooms') || [];
        const room = allRooms.find(r => r.number === roomNumber);

        if (!room) {
            Notifications.notifyError(`Habitación ${roomNumber} no encontrada`);
            return;
        }

        // Check if room is assigned to current maid
        const session = Auth.getSession();
        if (room.maidId !== session.id) {
            Notifications.notifyError(`Habitación ${roomNumber} no está asignada a ti`);
            return;
        }

        // Show success
        const scanResult = document.getElementById('scanResult');
        const scanResultText = document.getElementById('scanResultText');
        
        scanResultText.textContent = `Habitación ${roomNumber} verificada`;
        scanResult.style.display = 'block';

        Notifications.notifyQRScanned(roomNumber);

        // Hide result after 3 seconds
        setTimeout(() => {
            scanResult.style.display = 'none';
        }, 3000);

        // If room is pending, offer to start cleaning
        if (room.status === 'pending') {
            setTimeout(() => {
                if (confirm(`¿Iniciar limpieza de habitación ${roomNumber}?`)) {
                    this.startRoomCleaning(room);
                }
            }, 500);
        }
    },

    /**
     * Handle scan error
     * @param {string} errorMessage 
     */
    onScanError(errorMessage) {
        // Ignore scan errors (continuous scanning)
        // console.warn('[QRScanner] Scan error:', errorMessage);
    },

    /**
     * Parse QR code content
     * @param {string} qrContent 
     * @returns {string|null} Room number
     */
    parseQRCode(qrContent) {
        // Expected format: ROOM-XXX or just room number
        const match = qrContent.match(/ROOM-(\d+)/i) || qrContent.match(/^(\d+)$/);
        return match ? match[1] : null;
    },

    /**
     * Start room cleaning after QR scan
     * @param {Object} room 
     */
    startRoomCleaning(room) {
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

        // Notify and switch to dashboard
        Notifications.notifyRoomStatusChange(room.number, 'in-progress');

        // Switch to dashboard view
        document.querySelector('.nav-item[data-view="viewDashboard"]').click();
    }
};
