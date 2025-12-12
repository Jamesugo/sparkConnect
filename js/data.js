
// Nigeria States/Locations for filtering
const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
    "Taraba", "Yobe", "Zamfara"
];

// Replaced DataManager with API Calls
const DataManager = {
    // No init needed
    init: function() { console.log("DataManager init (no-op in API mode)"); },

    getAllElectricians: async function() {
        try {
            const res = await fetch('/api/electricians');
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
    signup: async function(data) {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            // Auto login after signup?
            return await this.login(data.email, data.password);
        } else {
            throw new Error(result.error || "Signup failed");
        }
    },

    login: async function(email, password) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        
        const result = await res.json();
        if (res.ok) {
            return result.user;
        } else {
            throw new Error(result.error || "Login failed");
        }
    },

    logout: async function() {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = 'index.html';
    },

    getCurrentUser: async function() {
        try {
            const res = await fetch('/api/auth/me');
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
         const res = await fetch('/api/user/update', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updates)
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
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
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
        
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
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
