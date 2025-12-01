// ============================================
// COMMON - AUTHENTICATION MODULE
// Shared authentication logic for all roles
// ============================================

/**
 * User database (simulated)
 * In production: Replace with API calls to backend
 */
const USERS_DB = [
    {
        id: 1,
        username: 'maria',
        password: '1234',
        name: 'María González',
        role: 'maid',
        email: 'maria@hotel.com',
        phone: '555-0001'
    },
    {
        id: 2,
        username: 'ana',
        password: '1234',
        name: 'Ana Martínez',
        role: 'maid',
        email: 'ana@hotel.com',
        phone: '555-0002'
    },
    {
        id: 3,
        username: 'admin',
        password: 'admin',
        name: 'Administrador',
        role: 'admin',
        email: 'admin@hotel.com',
        phone: '555-0100'
    },
    {
        id: 4,
        username: 'recepcion',
        password: '1234',
        name: 'Recepción Principal',
        role: 'admin',
        email: 'recepcion@hotel.com',
        phone: '555-0101'
    }
];

const Auth = {
    /**
     * Authenticate user and redirect based on role
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<boolean>} Success status
     */
    async login(username, password) {
        try {
            // Try API authentication first
            if (typeof API !== 'undefined' && navigator.onLine) {
                const response = await API.login(username, password);
                
                if (response.data && response.data.user && response.data.token) {
                    const user = response.data.user;
                    
                    // Create session object
                    const session = {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        email: user.email,
                        username: user.username,
                        loginTime: new Date().toISOString()
                    };

                    // Save session and token
                    localStorage.setItem('hotelSession', JSON.stringify(session));
                    localStorage.setItem('authToken', response.data.token);

                    // Redirect based on role
                    this.redirectByRole(user.role);
                    return true;
                }
            }
        } catch (error) {
            console.warn('[Auth] API login failed, trying offline:', error);
        }

        // Fallback to local authentication (offline mode)
        const user = USERS_DB.find(u => 
            u.username === username && u.password === password
        );

        if (user) {
            // Create session object
            const session = {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                username: user.username,
                loginTime: new Date().toISOString(),
                offline: true
            };

            // Save to localStorage
            localStorage.setItem('hotelSession', JSON.stringify(session));

            // Redirect based on role
            this.redirectByRole(user.role);
            return true;
        }

        return false;
    },

    /**
     * Redirect user to appropriate interface based on role
     * @param {string} role - 'maid' or 'admin'
     */
    redirectByRole(role) {
        if (role === 'maid') {
            window.location.href = '../mucamas/index.html';
        } else if (role === 'admin') {
            window.location.href = '../recepcion/index.html';
        }
    },

    /**
     * Get current session
     * @returns {Object|null} Session object or null
     */
    getSession() {
        const session = localStorage.getItem('hotelSession');
        if (session) {
            try {
                return JSON.parse(session);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.getSession() !== null;
    },

    /**
     * Verify user has required role
     * @param {string} requiredRole - 'maid' or 'admin'
     * @returns {boolean}
     */
    hasRole(requiredRole) {
        const session = this.getSession();
        return session && session.role === requiredRole;
    },

    /**
     * Logout and clear session
     */
    async logout() {
        try {
            // Try API logout
            if (typeof API !== 'undefined' && navigator.onLine) {
                await API.logout();
            }
        } catch (error) {
            console.warn('[Auth] API logout failed:', error);
        }
        
        // Clear local session
        localStorage.removeItem('hotelSession');
        localStorage.removeItem('authToken');
        // Redirect to login (common)
        window.location.href = '../common/login.html';
    },

    /**
     * Protect page - redirect if not authenticated
     * @param {string} requiredRole - Optional role requirement
     */
    protectPage(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = '../common/login.html';
            return false;
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            // Wrong role, redirect to appropriate dashboard
            const session = this.getSession();
            this.redirectByRole(session.role);
            return false;
        }

        return true;
    }
};

// Export for use in modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
