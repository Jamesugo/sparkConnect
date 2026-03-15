// Custom Modal Manager to replace native alert() and confirm()

const ModalManager = {
    _createOverlay: function() {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        const modalContainer = document.createElement('div');
        modalContainer.className = 'custom-modal-container';
        
        overlay.appendChild(modalContainer);
        document.body.appendChild(overlay);
        
        // Return elements so we can populate them and animate
        return { overlay, modalContainer };
    },

    alert: function(message, title = 'Notification') {
        const { overlay, modalContainer } = this._createOverlay();
        
        modalContainer.innerHTML = `
            <h3 class="custom-modal-title">${title}</h3>
            <p class="custom-modal-message">${message}</p>
            <div class="custom-modal-actions">
                <button class="btn btn-primary custom-modal-btn" id="modal-ok-btn">OK</button>
            </div>
        `;
        
        // Show animation
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            modalContainer.classList.add('visible');
        });

        // Event listener to close
        document.getElementById('modal-ok-btn').addEventListener('click', () => {
            this._close(overlay, modalContainer);
        });
    },

    confirm: function(message, title = 'Please Confirm', onConfirmCallback) {
        const { overlay, modalContainer } = this._createOverlay();
        
        modalContainer.innerHTML = `
            <h3 class="custom-modal-title">${title}</h3>
            <p class="custom-modal-message">${message}</p>
            <div class="custom-modal-actions">
                <button class="btn btn-outline custom-modal-btn" id="modal-cancel-btn">Cancel</button>
                <button class="btn btn-primary custom-modal-btn" id="modal-confirm-btn" style="background-color: #dc3545;">Delete</button>
            </div>
        `;
        
        // Show animation
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
            modalContainer.classList.add('visible');
        });

        // Cancel
        document.getElementById('modal-cancel-btn').addEventListener('click', () => {
            this._close(overlay, modalContainer);
        });

        // Confirm
        document.getElementById('modal-confirm-btn').addEventListener('click', () => {
            this._close(overlay, modalContainer);
            if (typeof onConfirmCallback === 'function') {
                onConfirmCallback();
            }
        });
    },

    _close: function(overlay, modalContainer) {
        overlay.classList.remove('visible');
        modalContainer.classList.remove('visible');
        // Wait for transition to finish before removing from DOM
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300); // 300ms matches css transition
    }
};

// Expose globally
window.ModalManager = ModalManager;
