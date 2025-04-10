class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const logoutButton = document.getElementById('logoutButton');

        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        registerForm?.addEventListener('submit', (e) => this.handleRegister(e));
        logoutButton?.addEventListener('click', () => this.handleLogout());
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            this.token = data.token;
            this.userId = data.userId;
            localStorage.setItem('token', this.token);
            localStorage.setItem('userId', this.userId);
            
            this.checkAuth();
            await this.updateUserInfo();
        } catch (error) {
            alert(error.message || 'Login failed');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            this.token = data.token;
            this.userId = data.userId;
            localStorage.setItem('token', this.token);
            localStorage.setItem('userId', this.userId);
            
            this.checkAuth();
            await this.updateUserInfo();
        } catch (error) {
            alert(error.message || 'Registration failed');
        }
    }

    handleLogout() {
        this.token = null;
        this.userId = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this.checkAuth();
    }

    checkAuth() {
        const isAuthenticated = !!this.token;
        
        // Show/hide screens based on auth state
        document.getElementById('auth-screen').style.display = isAuthenticated ? 'none' : 'block';
        document.getElementById('main-menu').style.display = isAuthenticated ? 'block' : 'none';
        document.getElementById('game-header').style.display = isAuthenticated ? 'block' : 'none';
        
        // If not authenticated, hide all game screens
        if (!isAuthenticated) {
            document.querySelectorAll('.screen').forEach(screen => {
                if (screen.id !== 'auth-screen') {
                    screen.style.display = 'none';
                }
            });
        }

        // Update UI elements that depend on auth state
        const userInfo = document.querySelector('.user-info');
        if (userInfo && isAuthenticated) {
            userInfo.style.display = 'flex';
        }
    }

    async updateUserInfo() {
        if (!this.token) return;

        try {
            const response = await fetch('/api/users/me', {
                headers: this.getAuthHeaders()
            });
            const userData = await response.json();
            
            // Update balance display
            const balanceElement = document.getElementById('userBalance');
            if (balanceElement) {
                balanceElement.textContent = `💰 ${userData.currency}`;
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Initialize the auth manager
const authManager = new AuthManager();
