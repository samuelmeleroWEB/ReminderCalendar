/* src/app/core/services/alarm.service.ts */
import { Injectable, inject, OnDestroy } from '@angular/core';
import { TaskService } from './task.service';
import { NotificationService } from './notification.service';
import { Task } from '../models/task.model';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AlarmService implements OnDestroy {
    private taskService = inject(TaskService);
    private notificationService = inject(NotificationService);

    private alarmTriggeredSubject = new Subject<Task>();
    public alarmTriggered$ = this.alarmTriggeredSubject.asObservable();

    private checkInterval: any;
    private vibrationInterval: any;
    private activeTask: Task | null = null;
    private tasksSub: Subscription;
    private currentTasks: Task[] = [];

    constructor() {
        // Keep local copy of tasks updated
        this.tasksSub = this.taskService.tasks$.subscribe(tasks => {
            this.currentTasks = tasks;
        });

        this.startMonitoring();
    }

    private startMonitoring() {
        // Check every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkAlarms();
        }, 30000);
    }

    private checkAlarms() {
        if (this.activeTask) return; // Already ringing

        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;
        const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const matchingTask = this.currentTasks.find(t =>
            t.date === currentDate &&
            t.startTime === currentTime &&
            t.status === 'pending'
        );

        if (matchingTask) {
            this.triggerAlarm(matchingTask);
        }
    }

    private triggerAlarm(task: Task) {
        this.activeTask = task;
        this.alarmTriggeredSubject.next(task);

        // Native Notification
        this.notificationService.showNotification(task.title, {
            body: task.description || '¡Es hora de tu tarea!',
            requireInteraction: true,
            icon: 'assets/icons/icon-192x192.png'
        });

        // Vibrate immediately
        this.vibratePattern();

        // Repeat vibration every 2 seconds (pattern is approx 1.3s)
        this.vibrationInterval = setInterval(() => {
            this.vibratePattern();
        }, 2000);
    }

    private vibratePattern() {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([500, 300, 500]);
        }
    }

    dismissAlarm() {
        if (this.activeTask) {
            // Stop vibration
            if (this.vibrationInterval) {
                clearInterval(this.vibrationInterval);
                this.vibrationInterval = null;
            }
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(0);
            }

            // Update task status
            this.taskService.updateTaskStatus(this.activeTask.id, 'in-progress');

            this.activeTask = null;
        }
    }

    ngOnDestroy() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        if (this.vibrationInterval) clearInterval(this.vibrationInterval);
        this.tasksSub.unsubscribe();
    }
}
