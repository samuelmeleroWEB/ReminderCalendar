import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { LucideAngularModule, ArrowLeft, User, Image, Bell, Check, Palette, Trash2 } from 'lucide-angular';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent {
    themeService = inject(ThemeService);
    notificationService = inject(NotificationService);
    router = inject(Router);

    readonly icons = { ArrowLeft, User, Image, Bell, Check, Palette, Trash2 };

    username = signal('');
    avatar = signal<string | null>(null);

    notificationPermission = signal<NotificationPermission>('default');

    constructor() {
        // Load profile
        const savedName = localStorage.getItem('daily-planner-username');
        if (savedName) this.username.set(savedName);

        const savedAvatar = localStorage.getItem('daily-planner-avatar');
        if (savedAvatar) this.avatar.set(savedAvatar);

        this.notificationPermission.set(this.notificationService.getPermissionStatus());
    }

    goBack() {
        this.router.navigate(['/today']);
    }

    updateUsername(name: string) {
        this.username.set(name);
        localStorage.setItem('daily-planner-username', name);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const result = e.target?.result as string;
                this.avatar.set(result);
                localStorage.setItem('daily-planner-avatar', result);
            };

            reader.readAsDataURL(file);
        }
    }

    deleteAvatar() {
        this.avatar.set(null);
        localStorage.removeItem('daily-planner-avatar');
    }

    requestNotifications() {
        this.notificationService.requestPermission().then(() => {
            this.notificationPermission.set(this.notificationService.getPermissionStatus());
        });
    }

    selectTheme(themeId: string) {
        this.themeService.setTheme(themeId);
    }

    getInitials(): string {
        const name = this.username() || 'User';
        return name.slice(0, 2).toUpperCase();
    }
}
