import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AlarmOverlayComponent } from './features/alarm-overlay/alarm-overlay.component';
import { LucideAngularModule, Calendar, ListTodo, Hourglass, BarChart2, Download, X, Settings, Plus } from 'lucide-angular';
import { ThemeService } from './core/services/theme.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        AlarmOverlayComponent,
        RouterLink,
        RouterLinkActive,
        LucideAngularModule
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'daily-planner';

    private themeService = inject(ThemeService);

    deferredPrompt: any;
    showInstallPrompt = signal(false);

    readonly icons = { Calendar, ListTodo, Hourglass, BarChart2, Download, X, Settings, Plus };

    constructor() {
        this.checkInstallStatus();
    }

    @HostListener('window:beforeinstallprompt', ['$event'])
    onBeforeInstallPrompt(e: any) {
        e.preventDefault();
        this.deferredPrompt = e;
        this.checkInstallStatus();
    }

    checkInstallStatus() {
        const dismissed = localStorage.getItem('dismissed_install_prompt');
        if (!dismissed && this.deferredPrompt) {
            this.showInstallPrompt.set(true);
        }
    }

    async installPwa() {
        this.showInstallPrompt.set(false);
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
    }

    dismissInstall() {
        this.showInstallPrompt.set(false);
        localStorage.setItem('dismissed_install_prompt', 'true');
    }
}
