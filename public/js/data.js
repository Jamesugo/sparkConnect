
// Nigeria States/Locations for filtering
const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
    "Taraba", "Yobe", "Zamfara"
];

// Replaced DataManager with API Calls
// Improved base URL detection for local development and Vercel
const apiHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? `http://${window.location.hostname}:5000`
    : `https://${window.location.hostname}`;

window.API_BASE_URL = apiHost;

const API_BASE_URL = window.API_BASE_URL;

// Debug Fetch
console.log("Fetch implementation:", window.fetch ? "native" : "missing");

// Standard fetch wrapper
async function networkRequest(url, options = {}) {
    try {
        // Ensure credentials are sent by default for session management
        options.credentials = options.credentials || 'include';
        
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error("Network request failed:", error);
        throw error;
    }
}

const DataManager = {
    // No init needed
    init: function() { console.log("DataManager init (no-op in API mode)"); },

    getAllElectricians: async function() {
        try {
            const res = await networkRequest(`${API_BASE_URL}/api/electricians`, { credentials: 'include' });
            if (res.ok) return await res.json();
            return [];
        } catch(e) {
            console.error("Failed to fetch electricians", e);
            return [];
        }
    },

    getElectricianById: async function(id) {
        // We fetch all for now as we don't have a specific ID endpoint, or filter client side
        // Optimization: Add specific endpoint later if list grows
        const all = await this.getAllElectricians();
        return all.find(e => e.id == id);
    },

    // Signup now hits the register endpoint
    // Signup now hits the register endpoint
    // Signup - Rewritten for robustness
    signup: async function(data) {
        console.log("Starting signup process...", data);
        
        const url = `${API_BASE_URL}/api/auth/register`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log("Signup response status:", response.status);

            // parse JSON safely
            let result;
            const text = await response.text();
            try {
                result = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error("Failed to parse signup response:", text);
                throw new Error("Server Error: Invalid JSON response");
            }

            if (!response.ok) {
                throw new Error(result.error || `Signup failed with status ${response.status}`);
            }

            console.log("Signup successful, logging in...");
            // Automatically login after success
            return await this.login(data.email, data.password);

        } catch (error) {
            console.error("Signup error:", error);
            throw error; // Propagate to UI
        }
    },

    // Login - Rewritten for robustness
    login: async function(email, password) {
        console.log("Attempting login...");
        const url = `${API_BASE_URL}/api/auth/login`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important for session cookies
            });

            // parse JSON safely
            let result;
            const text = await response.text();
            try {
                result = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error("Failed to parse login response:", text);
                throw new Error("Server Error: Invalid JSON response");
            }

            if (!response.ok) {
                throw new Error(result.error || `Login failed with status ${response.status}`);
            }
            
            console.log("Login successful");
            return result.user;

        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    googleLogin: async function(credential) {
        console.log("Attempting Google login...");
        const url = `${API_BASE_URL}/api/auth/google`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ credential }),
                credentials: 'include'
            });

            // parse JSON safely
            let result;
            const text = await response.text();
            try {
                result = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error("Failed to parse Google login response:", text);
                throw new Error("Server Error: Invalid JSON response");
            }

            if (!response.ok) {
                throw new Error(result.error || `Google login failed with status ${response.status}`);
            }
            
            console.log("Google login successful");
            return result;

        } catch (error) {
            console.error("Google login error:", error);
            throw error;
        }
    },

    logout: async function() {
        await networkRequest(`${API_BASE_URL}/api/auth/logout`, { 
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'index.html';
    },

    getCurrentUser: async function() {
        try {
            const res = await networkRequest(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
            if (res.ok) {
                const user = await res.json();
                return user; // returns null if not logged in
            }
            return null;
        } catch(e) {
            return null;
        }
    },

    updateElectrician: async function(updates) {
         const res = await networkRequest(`${API_BASE_URL}/api/user/update`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updates),
            credentials: 'include'
        });
        return res.ok;
    },
    
    deleteElectrician: async function(id) {
         // Not fully implemented on backend but simulation
         // Usually we'd have a delete endpoint
         console.warn("Delete account not connected to API yet");
    },
    
    getInitials: function(name) {
        if (!name) return 'SC';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    },

    deleteUser: async function(userId) {
        // Admin function to delete a user
        const res = await networkRequest(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (res.ok) {
            return true;
        } else {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete user');
        }
    },

    isAdmin: async function() {
        // Basic check based on current user
        const user = await this.getCurrentUser();
        return user && user.email === 'admin@sparkconnect.com';
    }
};

// MediaStore deprecated in favor of API uploads, but keeping stub if needed for logic transition
const MediaStore = {
    saveMedia: async function(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await networkRequest(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        if (res.ok) {
            const data = await res.json();
            return data.url; // Returns server path
        } else {
            throw new Error("Upload failed");
        }
    },
    getMedia: async function(url) {
        // Just return the url directly as it's now a server path
        return url;
    }
}
