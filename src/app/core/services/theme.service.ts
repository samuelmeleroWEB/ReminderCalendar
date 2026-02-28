import { Injectable, signal, effect } from '@angular/core';

export interface Theme {
    id: string;
    name: string;
    colors: {
        primary: string;
        accent: string;
        background: string;
        surface: string;
        surfaceElevated: string;
        textSecondary: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'daily-planner-theme'; // Key specified in requirement

    themes: Theme[] = [
        {
            id: 'violet-dark',
            name: 'Violeta Oscuro',
            colors: {
                primary: '#6d28d9',
                accent: '#00e5ff',
                background: '#13141a', // requested #13141a
                surface: '#1e2028',
                surfaceElevated: '#2a2d3a',
                textSecondary: '#b8b8c8'
            }
        },
        {
            id: 'midnight-blue',
            name: 'Azul Medianoche',
            colors: {
                primary: '#1d4ed8',
                accent: '#38bdf8',
                background: '#0f172a',
                surface: '#1e293b',
                surfaceElevated: '#334155',
                textSecondary: '#cbd5e1'
            }
        },
        {
            id: 'emerald-green',
            name: 'Verde Esmeralda',
            colors: {
                primary: '#059669',
                accent: '#34d399', // Corrected from #38d399 possibly
                background: '#0d1f1a', // Correct from prompt
                surface: '#132a24',
                surfaceElevated: '#1a3830',
                textSecondary: '#a7f3d0'
            }
        },
        {
            id: 'crimson-red',
            name: 'Rojo Carmesí',
            colors: {
                primary: '#dc2626',
                accent: '#fb923c',
                background: '#1a0f0f',
                surface: '#2a1a1a',
                surfaceElevated: '#3a2525',
                textSecondary: '#fca5a5'
            }
        },
        {
            id: 'dark-gold',
            name: 'Dorado Oscuro',
            colors: {
                primary: '#b45309',
                accent: '#fbbf24',
                background: '#1a1508',
                surface: '#2a220d',
                surfaceElevated: '#3a2f15',
                textSecondary: '#fde68a'
            }
        }
    ];

    activeTheme = signal<Theme>(this.themes[0]);

    constructor() {
        this.loadSavedTheme();

        effect(() => {
            this.applyTheme(this.activeTheme());
        });
    }

    setTheme(themeId: string) {
        const theme = this.themes.find(t => t.id === themeId);
        if (theme) {
            this.activeTheme.set(theme);
            localStorage.setItem(this.THEME_KEY, theme.id);
        }
    }

    private applyTheme(theme: Theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.colors.primary);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--bg-color', theme.colors.background);
        root.style.setProperty('--surface-color', theme.colors.surface);
        root.style.setProperty('--surface-elevated', theme.colors.surfaceElevated);
        root.style.setProperty('--text-secondary', theme.colors.textSecondary);

        // Also update SCSS vars mapped via root styles in styles.scss if possible, 
        // but typically we use CSS custom properties for dynamic theming.
        // We need to ensure _variables.scss or styles.scss uses var(--primary-color) instead of $primary-color for runtime changes.
        // However, the current setup uses SCSS variables. To support runtime theme switching, we must update styles.scss to use CSS variables.
    }

    private loadSavedTheme() {
        const savedId = localStorage.getItem(this.THEME_KEY);
        if (savedId) {
            const theme = this.themes.find(t => t.id === savedId);
            if (theme) {
                this.activeTheme.set(theme);
            }
        }
    }
}
