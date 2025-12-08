// Navigation Manager
const NavManager = {
    render: function() {
        // Find existing nav or create one (though we usually have a <nav> tag)
        const nav = document.querySelector('nav') || document.createElement('nav');
        nav.className = 'navbar';
        
        const currentUser = DataManager.getCurrentUser();
        
        let avatarHtml = '';
        if (currentUser) {
             if (currentUser.image && currentUser.image !== 'assets/images/profile_placeholder.jpg') {
                // Determine if it's base64/url, try to show it, fallback to initials on error
                avatarHtml = `<img src="${currentUser.image}" alt="User" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'avatar-placeholder\\' style=\\'font-size:14px;\\'>${DataManager.getInitials(currentUser.name)}</div>'">`;
             } else {
                avatarHtml = `<div class="avatar-placeholder" style="font-size:14px;">${DataManager.getInitials(currentUser.name)}</div>`;
             }
        } else {
             avatarHtml = `<img src="assets/images/profile_placeholder.jpg" alt="User" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        
        // Determine active link
        const path = window.location.pathname;
        const isHome = path.includes('index.html') || path.endsWith('/');
        const isList = path.includes('electricians.html');
        // Dashboard link is hidden in main Nav if not logged in, but we handle that dynamically below

        nav.innerHTML = `
            <div class="container nav-container">
                <!-- Hamburger Menu Button -->
                <button class="hamburger-btn" onclick="NavManager.toggleMobileMenu()">
                    <span class="hamburger-icon">☰</span>
                </button>

                <a href="index.html" class="logo">
                    <img src="assets/logo.png" alt="SparkConnect Logo">
                    <span>SparkConnect</span>
                </a>
                
                <div class="nav-links">
                    <a href="index.html" class="${isHome ? 'active' : ''}">Home</a>
                    <a href="electricians.html" class="${isList ? 'active' : ''}">Find Electricians</a>
                    ${currentUser ? `<a href="dashboard.html" class="${path.includes('dashboard.html') ? 'active' : ''}">Dashboard</a>` : ''}
                </div>

                <div class="nav-actions">
                     <div style="position: relative; margin-right: 15px; cursor: pointer;">
                        <span style="font-size: 1.2rem;">🔔</span>
                    </div>
                    
                    <div class="dropdown" style="position: relative;">
                         <div class="profile-trigger" onclick="NavManager.toggleDropdown()" style="width: 40px; height: 40px; background-color: #ddd; border-radius: 50%; overflow: hidden; cursor: pointer; border: 2px solid var(--white); box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                           ${avatarHtml}
                        </div>
                        
                        <div id="nav-dropdown" class="dropdown-menu hidden" style="position: absolute; right: 0; top: 120%; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 5px 0; z-index: 2000;">
                            ${currentUser ? `
                                <div style="padding: 10px 15px; border-bottom: 1px solid #eee;">
                                    <div style="font-weight: 700;">${currentUser.name}</div>
                                    <div style="font-size: 12px; color: var(--text-gray);">${currentUser.email || 'No email set'}</div>
                                </div>
                                <a href="dashboard.html" style="display: block; padding: 10px 15px; color: var(--text-dark); hover: background-color: #f5f5f5;">Dashboard</a>
                                <a href="profile.html?id=${currentUser.id}" style="display: block; padding: 10px 15px; color: var(--text-dark);">My Public Profile</a>
                                <a href="#" onclick="NavManager.logout()" style="display: block; padding: 10px 15px; color: #dc3545;">Sign Out</a>
                            ` : `
                                <a href="login.html" style="display: block; padding: 10px 15px; color: var(--text-dark);">Sign In</a>
                                <a href="login.html?signup=true" style="display: block; padding: 10px 15px; color: var(--primary-blue);">Create Account</a>
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="mobile-menu hidden">
                 <a href="index.html" class="${isHome ? 'active' : ''}">Home</a>
                 <a href="electricians.html" class="${isList ? 'active' : ''}">Find Electricians</a>
                 ${currentUser ? `<a href="dashboard.html" class="${path.includes('dashboard.html') ? 'active' : ''}">Dashboard</a>` : ''}
            </div>
            
            <style>
                .dropdown-menu a:hover {
                    background-color: #f8f9fa;
                }
            </style>
        `;
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('nav-dropdown');
            const trigger = document.querySelector('.profile-trigger');
            if (dropdown && !dropdown.classList.contains('hidden') && !dropdown.contains(event.target) && !trigger.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        });
    },
    
    toggleDropdown: function() {
        const dropdown = document.getElementById('nav-dropdown');
        if (dropdown) dropdown.classList.toggle('hidden');
    },

    toggleMobileMenu: function() {
        const menu = document.getElementById('mobile-menu');
        if (menu) menu.classList.toggle('hidden');
    },

    logout: function() {
        DataManager.logout();
        window.location.href = 'index.html';
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', NavManager.render);
