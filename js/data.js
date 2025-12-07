const defaultElectricians = [
    {
        id: 1,
        name: "Sarah Johnson",
        specialty: "Residential Wiring",
        rating: 4.8,
        reviews: 120,
        location: "Lagos",
        state: "Lagos",
        image: "assets/images/profile1.jpg",
        description: "Expert in residential wiring and lighting installations with over 7 years of experience.",
        gallery: ["assets/images/gallery1.jpg", "assets/images/gallery2.jpg"]
    },
    {
        id: 2,
        name: "Michael Chen",
        specialty: "Commercial Systems",
        rating: 4.9,
        reviews: 150,
        location: "Abuja",
        state: "FCT - Abuja",
        image: "assets/images/profile2.jpg",
        description: "Specializes in commercial electrical systems and panel upgrades.",
        gallery: ["assets/images/gallery3.jpg", "assets/images/gallery4.jpg"]
    },
    {
        id: 3,
        name: "David Rodriguez",
        specialty: "Emergency Repairs",
        rating: 4.7,
        reviews: 95,
        location: "Ikeja, Lagos",
        state: "Lagos",
        image: "assets/images/profile3.jpg",
        description: "Offers a wide range of electrical services, including emergency repairs available 24/7.",
        gallery: ["assets/images/gallery5.jpg"]
    },
    {
        id: 4,
        name: "Emily Carter",
        specialty: "Smart Home",
        rating: 4.6,
        reviews: 110,
        location: "Port Harcourt",
        state: "Rivers",
        image: "assets/images/profile4.jpg",
        description: "Focuses on smart home installations and energy-efficient solutions.",
        gallery: ["assets/images/gallery6.jpg"]
    }
];

// Nigeria States/Locations for filtering
const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
    "Taraba", "Yobe", "Zamfara"
];

const DB_KEY = 'sparkconnect_electricians';
const USER_KEY = 'sparkconnect_current_user';

// Data Manager
const DataManager = {
    init: function() {
        let currentData = [];
        try {
            currentData = JSON.parse(localStorage.getItem(DB_KEY)) || [];
        } catch (e) {
            currentData = [];
        }

        // Force restore/merge logic via version flag to ensure it runs for the user
        const RESTORE_FLAG = 'sparkconnect_restored_v2';
        
        let shouldRestore = false;
        if (!localStorage.getItem(RESTORE_FLAG)) {
            shouldRestore = true;
            localStorage.setItem(RESTORE_FLAG, 'true');
        }

        // Smart Merge: Add defaults if they are not present (by name)
        // Run this if we are forcing restore OR if the list is dangerously empty
        let modified = false;
        
        if (shouldRestore || currentData.length === 0) {
            defaultElectricians.forEach(def => {
                const exists = currentData.some(curr => curr.name === def.name);
                if (!exists) {
                    // ID Conflict handling: If ID taken, find new Max ID
                    const idTaken = currentData.some(curr => curr.id === def.id);
                    let newProfile = { ...def };
                    
                    if (idTaken) {
                        const maxId = currentData.length > 0 ? Math.max(...currentData.map(e => e.id)) : 0;
                        newProfile.id = maxId + 1;
                    }
                    currentData.push(newProfile);
                    modified = true;
                }
            });
        }

        if (modified || currentData.length === 0) {
            localStorage.setItem(DB_KEY, JSON.stringify(currentData));
        }
    },

    getAllElectricians: function() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEY));
    },

    getElectricianById: function(id) {
        const electricians = this.getAllElectricians();
        return electricians.find(e => e.id == id);
    },

    addElectrician: function(electrician) {
        const electricians = this.getAllElectricians();
        // Generate new ID
        const newId = electricians.length > 0 ? Math.max(...electricians.map(e => e.id)) + 1 : 1;
        const newElectrician = { ...electrician, id: newId, rating: 0, reviews: 0, gallery: [] };
        
        electricians.push(newElectrician);
        localStorage.setItem(DB_KEY, JSON.stringify(electricians));
        return newElectrician;
    },

    updateElectrician: function(updatedData) {
        const electricians = this.getAllElectricians();
        const index = electricians.findIndex(e => e.id == updatedData.id);
        
        if (index !== -1) {
            electricians[index] = { ...electricians[index], ...updatedData };
            localStorage.setItem(DB_KEY, JSON.stringify(electricians));
            return electricians[index];
        }
        return null;
    },

    // Auth Simulation
    login: function(username) {
        // For simulation, we'll see if a user exists with this name (acting as username)
        // If not, we block. But since we need signup, we'll stick to a simple flow.
        // For this demo: 'username' effectively maps to 'name' for electricians if they try to login.
        
        const electricians = this.getAllElectricians();
        // Simple fuzzy match for demo
        const user = electricians.find(e => e.name.toLowerCase() === username.toLowerCase());
        
        if (user) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },
    
    signup: function(data) {
        // data: { name, specialty, location, state, password(ignored) }
        const newUser = this.addElectrician(data);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        return newUser;
    },

    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem(USER_KEY));
    },

    logout: function() {
        localStorage.removeItem(USER_KEY);
    },

    deleteElectrician: function(id) {
        const electricians = this.getAllElectricians();
        const updatedList = electricians.filter(e => e.id != id); // Filter out the user
        localStorage.setItem(DB_KEY, JSON.stringify(updatedList));

        // If the deleted user is the currently logged-in user, logout
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id == id) {
            this.logout();
        }
        return true;
    },
    
    // Helper to generate initials
    getInitials: function(name) {
        if (!name) return 'SC';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    },

    // Check if current user is admin
    isAdmin: function() {
        const currentUser = this.getCurrentUser();
        // Admin is identified by username 'admin' (case-insensitive)
        return currentUser && currentUser.name && currentUser.name.toLowerCase() === 'admin';
    }
};

// Expose electricians global variable for backward compatibility with existing pages temporarily
// but init it from manager
DataManager.init();
const electricians = DataManager.getAllElectricians();
