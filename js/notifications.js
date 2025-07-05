// Notification Manager
class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = document.getElementById('notifications');
    }

    show(message, type = 'info', duration = CONFIG.UI.NOTIFICATION_DURATION) {
        const notification = this.createNotification(message, type, duration);
        this.notifications.push(notification);
        this.container.appendChild(notification.element);
        
        // Trigger animation
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 10);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }

        return notification.id;
    }

    createNotification(message, type, duration) {
        const id = Date.now() + Math.random();
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const element = document.createElement('div');
        element.className = `notification flex items-center space-x-3 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg mb-2 max-w-sm`;
        element.innerHTML = `
            <i class="${icons[type]}"></i>
            <span class="flex-1">${this.escapeHtml(message)}</span>
            <button class="text-white hover:text-gray-200 close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        element.querySelector('.close-notification').addEventListener('click', () => {
            this.remove(id);
        });

        return { id, element, type, message };
    }

    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.element.classList.remove('show');
            
            setTimeout(() => {
                if (notification.element.parentNode) {
                    notification.element.parentNode.removeChild(notification.element);
                }
                this.notifications = this.notifications.filter(n => n.id !== id);
            }, 300);
        }
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Convenience methods
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Initialize notification manager
window.notificationManager = new NotificationManager();