// Navigation Manager
const NavManager = {
  render: async function () {
    // Find existing nav or create one (though we usually have a <nav> tag)
    const nav = document.querySelector("nav") || document.createElement("nav");
    nav.className = "navbar";

    const currentUser = await DataManager.getCurrentUser();

    let avatarHtml = "";
    if (currentUser) {
      if (
        currentUser.image &&
        currentUser.image !== "assets/images/profile_placeholder.jpg"
      ) {
        // Determine if it's base64/url, try to show it, fallback to initials on error
        avatarHtml = `<img src="${
          currentUser.image
        }" alt="User" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'avatar-placeholder\\' style=\\'font-size:14px;\\'>${DataManager.getInitials(
          currentUser.name
        )}</div>'">`;
      } else {
        // Human-like icon for user with no image
        avatarHtml = `<div class="avatar-placeholder" style="background:#f0f0f0; display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:60%; height:60%;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>`;
      }
    } else {
      avatarHtml = `<div class="avatar-placeholder" style="background:#f0f0f0; display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
          <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:60%; height:60%;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>`;
    }

    // Determine active link
    const path = window.location.pathname;
    const isHome = path.includes("index.html") || path.endsWith("/");
    const isList = path.includes("electricians.html");
    // Dashboard link is hidden in main Nav if not logged in, but we handle that dynamically below

    nav.innerHTML = `
            <div class="container nav-container">
                <!-- Hamburger Menu Button (Left) -->
                <button class="hamburger-btn hidden-desktop" onclick="NavManager.toggleMobileMenu()">
                    <span style="font-size: 1.5rem;">☰</span>
                </button>

                <a href="index.html" class="logo">
                    <img src="assets/logo.png" alt="SparkConnect Logo">
                    <span class="hidden-mobile-xs">SparkConnect</span>
                </a>
                
                <!-- Desktop Nav Links -->
                <div class="nav-links hidden-mobile">
                    <a href="index.html" class="${
                      isHome ? "active" : ""
                    }">Home</a>
                    <a href="electricians.html" class="${
                      isList ? "active" : ""
                    }">Find Electricians</a>
                    ${
                      currentUser
                        ? `<a href="dashboard.html" class="${
                            path.includes("dashboard.html") ? "active" : ""
                          }">Dashboard</a>`
                        : ""
                    }
                </div>

                <!-- Right Side Actions -->
                <div class="nav-actions">
                    
                    <div class="dropdown" style="position: relative;">
                         <div class="profile-trigger" onclick="NavManager.toggleDropdown()" style="width: 40px; height: 40px; background-color: #ddd; border-radius: 50%; overflow: hidden; cursor: pointer; border: 2px solid var(--white); box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                           ${avatarHtml}
                        </div>
                        
                        <div id="nav-dropdown" class="dropdown-menu hidden" style="position: absolute; right: 0; top: 120%; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 5px 0; z-index: 2000;">
                            ${
                              currentUser
                                ? `
                                <div style="padding: 10px 15px; border-bottom: 1px solid #eee;">
                                    <div style="font-weight: 700;">${
                                      currentUser.name
                                    }</div>
                                    <div style="font-size: 12px; color: var(--text-gray);">${
                                      currentUser.email || "No email set"
                                    }</div>
                                </div>
                                <a href="dashboard.html" style="display: block; padding: 10px 15px; color: var(--text-dark); hover: background-color: #f5f5f5;">Dashboard</a>
                                <a href="profile.html?id=${
                                  currentUser.id
                                }" style="display: block; padding: 10px 15px; color: var(--text-dark);">My Public Profile</a>
                                <a href="#" onclick="NavManager.logout()" style="display: block; padding: 10px 15px; color: #dc3545;">Sign Out</a>
                            `
                                : `
                                <a href="login.html" style="display: block; padding: 10px 15px; color: var(--text-dark);">Sign In</a>
                                <a href="signup.html" style="display: block; padding: 10px 15px; color: var(--primary-blue);">Create Account</a>
                            `
                            }
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu Sidebar/Overlay -->
            <div id="mobile-menu-overlay" class="hidden" onclick="NavManager.toggleMobileMenu()" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1999;"></div>
            <div id="mobile-menu" class="hidden" style="position: fixed; left: 0; top: 0; bottom: 0; width: 250px; background: white; z-index: 2000; padding: 20px; box-shadow: 2px 0 10px rgba(0,0,0,0.1); transform: translateX(-100%); transition: transform 0.3s ease;">
                <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700; font-size: 1.2rem;">Menu</span>
                    <button onclick="NavManager.toggleMobileMenu()" style="background:none; font-size: 1.5rem; padding: 5px;">&times;</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <a href="index.html" class="${
                      isHome ? "active" : ""
                    }" style="font-size: 1.1rem; color: var(--text-dark);">Home</a>
                    <a href="electricians.html" class="${
                      isList ? "active" : ""
                    }" style="font-size: 1.1rem; color: var(--text-dark);">Find Electricians</a>
                    ${
                      currentUser
                        ? `<a href="dashboard.html" class="${
                            path.includes("dashboard.html") ? "active" : ""
                          }" style="font-size: 1.1rem; color: var(--text-dark);">Dashboard</a>`
                        : ""
                    }
                </div>
            </div>
            
            <!-- Mobile Menu Toggle (simplified for now) -->
             <style>
                .dropdown-menu a:hover {
                    background-color: #f8f9fa;
                }
             </style>
        `;

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
      const dropdown = document.getElementById("nav-dropdown");
      const trigger = document.querySelector(".profile-trigger");
      if (
        dropdown &&
        !dropdown.classList.contains("hidden") &&
        !dropdown.contains(event.target) &&
        !trigger.contains(event.target)
      ) {
        dropdown.classList.add("hidden");
      }
    });
  },

  toggleDropdown: function () {
    const dropdown = document.getElementById("nav-dropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
  },

  toggleMobileMenu: function () {
    const menu = document.getElementById("mobile-menu");
    const overlay = document.getElementById("mobile-menu-overlay");

    if (menu.classList.contains("hidden")) {
      // Open
      menu.classList.remove("hidden");
      overlay.classList.remove("hidden");
      // Small delay to allow display:block to apply before transition
      setTimeout(() => {
        menu.style.transform = "translateX(0)";
      }, 10);
    } else {
      // Close
      menu.style.transform = "translateX(-100%)";
      overlay.classList.add("hidden");
      setTimeout(() => {
        menu.classList.add("hidden");
      }, 300);
    }
  },

  logout: async function () {
    await DataManager.logout();
    window.location.href = "index.html";
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", NavManager.render);
