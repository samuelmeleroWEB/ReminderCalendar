import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroService } from '../../core/services/pomodoro.service';
import { LucideAngularModule, Play, Pause, RotateCcw } from 'lucide-angular';

@Component({
    selector: 'app-focus',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './focus.component.html',
    styleUrl: './focus.component.scss'
})
export class FocusComponent {
    pomodoroService = inject(PomodoroService);

    readonly icons = { Play, Pause, RotateCcw };

    formattedTime = computed(() => {
        const totalSeconds = this.pomodoroService.timer();
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    });

    dashOffset = computed(() => {
        const current = this.pomodoroService.timer();
        const max = this.pomodoroService.MODES[this.pomodoroService.currentMode()] * 60;
        const circumference = 2 * Math.PI * 130; // r=130
        return circumference - (current / max) * circumference;
    });

    progressPercent = computed(() => {
        const current = this.pomodoroService.timer();
        const max = this.pomodoroService.MODES[this.pomodoroService.currentMode()] * 60;
        return (current / max) * 100;
    });

    formatMode(mode: string): string {
        return mode.replace('-', ' ');
    }
}
