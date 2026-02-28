import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmService } from '../../core/services/alarm.service';
import { Task } from '../../core/models/task.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-alarm-overlay',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alarm-overlay.component.html',
    styleUrl: './alarm-overlay.component.scss'
})
export class AlarmOverlayComponent implements OnInit, OnDestroy {
    private alarmService = inject(AlarmService);

    task = signal<Task | null>(null);
    isVisible = signal<boolean>(false);

    private sub: Subscription | null = null;

    ngOnInit() {
        this.sub = this.alarmService.alarmTriggered$.subscribe(task => {
            this.task.set(task);
            this.isVisible.set(true);
        });
    }

    unlock() {
        this.alarmService.dismissAlarm();
        this.isVisible.set(false);
        this.task.set(null);
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}
