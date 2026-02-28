import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private permission: NotificationPermission = 'default';

    constructor() {
        if (this.isSupported()) {
            this.permission = Notification.permission;
            if (this.permission === 'default') {
                this.requestPermission();
            }
        }
    }

    isSupported(): boolean {
        return 'Notification' in window;
    }

    async requestPermission() {
        if (!this.isSupported()) return;

        // Check if user previously denied
        const stored = localStorage.getItem('notification_permission');
        if (stored === 'denied') return;

        try {
            this.permission = await Notification.requestPermission();
            localStorage.setItem('notification_permission', this.permission);
        } catch (e) {
            console.error('Notification permission request failed', e);
        }
    }

    showNotification(title: string, options?: NotificationOptions) {
        if (!this.isSupported() || this.permission !== 'granted') return;

        try {
            new Notification(title, {
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                ...options
            });
        } catch (e) {
            console.error('Error showing notification', e);
        }
    }

    getPermissionStatus(): NotificationPermission {
        return this.permission;
    }
}
