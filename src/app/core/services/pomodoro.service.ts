import { Injectable, signal, computed } from '@angular/core';

export type PomodoroMode = 'focus' | 'short-break' | 'long-break';

@Injectable({
    providedIn: 'root'
})
export class PomodoroService {
    readonly MODES: Record<PomodoroMode, number> = {
        'focus': 25,
        'short-break': 5,
        'long-break': 15
    };

    timer = signal(this.MODES['focus'] * 60);
    currentMode = signal<PomodoroMode>('focus');
    isRunning = signal(false);
    sessionsCompleted = signal(0);
    totalFocusTime = signal(0); // in minutes, for dashboard

    private interval: any;
    private readonly STORAGE_KEY = 'pomodoro_stats';

    constructor() {
        this.loadStats();
        // Initialize timer based on default mode
        this.timer.set(this.MODES['focus'] * 60);
    }

    toggleTimer() {
        if (this.isRunning()) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isRunning()) return;

        this.isRunning.set(true);
        this.interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    pauseTimer() {
        this.isRunning.set(false);
        clearInterval(this.interval);
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.set(this.MODES[this.currentMode()] * 60);
    }

    setMode(mode: PomodoroMode) {
        this.currentMode.set(mode);
        this.resetTimer();
    }

    private tick() {
        if (this.timer() > 0) {
            this.timer.update(t => t - 1);
        } else {
            this.completeSession();
        }
    }

    private completeSession() {
        this.pauseTimer();
        this.vibrate();

        if (this.currentMode() === 'focus') {
            this.sessionsCompleted.update(c => c + 1);
            this.totalFocusTime.update(t => t + this.MODES['focus']);
            this.saveStats();

            // Suggest break
            if (this.sessionsCompleted() % 4 === 0) {
                // Suggest long break
                // For now, auto switch or just let user decide. 
                // Requirement says "sugerir automáticamente". We'll switch to it but pause.
                this.setMode('long-break');
            } else {
                this.setMode('short-break');
            }
        } else {
            // Break over, storing state?
            this.setMode('focus');
        }
    }

    private vibrate() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            // Distinct pattern: 200ms on, 100ms off, 200ms on
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    }

    private loadStats() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            const stats = JSON.parse(data);
            // Reset sessions count if it's a new day?
            const savedDate = stats.date;
            const today = new Date().toISOString().split('T')[0];

            if (savedDate === today) {
                this.sessionsCompleted.set(stats.sessions || 0);
                this.totalFocusTime.set(stats.totalTime || 0);
            } else {
                // New day, reset daily counters but maybe keep total history?
                // Requirement says "contador de sesiones completadas en el día".
                this.sessionsCompleted.set(0);
                this.totalFocusTime.set(0); // Reset daily focus time
            }
        }
    }

    private saveStats() {
        const stats = {
            date: new Date().toISOString().split('T')[0],
            sessions: this.sessionsCompleted(),
            totalTime: this.totalFocusTime()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    }
}
