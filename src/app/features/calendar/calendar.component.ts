import { Component, OnInit, inject, signal, computed, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { CalendarDayBadgeComponent } from '../../shared/components/calendar-day-badge/calendar-day-badge.component';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, CalendarDayBadgeComponent],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
    private taskService = inject(TaskService);
    private router = inject(Router);

    view = signal<'week' | 'month'>('month');
    currentDate = signal(new Date());

    readonly icons = { ChevronLeft, ChevronRight };

    // Weekly view helpers
    hours: string[] = [];
    currentTimeTop = signal(0);

    // Helper for date formatting (YYYY-MM-DD Local)
    private formatDate(d: Date): string {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    weekDays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    constructor() {
        // Generate hours 00:00 to 23:00 every 2 hours
        for (let i = 0; i < 24; i += 2) {
            this.hours.push(`${i.toString().padStart(2, '0')}:00`);
        }

        // Update current time indicator
        effect(() => {
            const now = new Date();
            const midnight = new Date(now).setHours(0, 0, 0, 0);
            const minutes = (now.getTime() - midnight) / 60000;
            // Scale: 60px per hour => 1px per minute
            this.currentTimeTop.set(minutes);

            const interval = setInterval(() => {
                const n = new Date();
                const m = (n.getTime() - new Date(n).setHours(0, 0, 0, 0)) / 60000;
                this.currentTimeTop.set(m);
            }, 60000);

            return () => clearInterval(interval);
        }, { allowSignalWrites: true });
    }

    // Data computations
    monthDays = computed(() => {
        const year = this.currentDate().getFullYear();
        const month = this.currentDate().getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Previous month filler
        const startDay = firstDay.getDay(); // 0 is Sunday
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                tasks: [],
                totalTasks: 0,
                isToday: false,
                date: ''
            });
        }

        // Current month
        const tasks = this.taskService.getTasks();
        const todayStr = this.formatDate(new Date());

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const d = new Date(year, month, i);
            const dStr = this.formatDate(d);
            const dayTasks = tasks.filter(t => t.date === dStr);

            days.push({
                day: i,
                isCurrentMonth: true,
                tasks: dayTasks.slice(0, 4), // Max 3 dots + logic in template
                totalTasks: dayTasks.length,
                isToday: dStr === todayStr,
                date: dStr
            });
        }

        // Next month filler
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                tasks: [],
                totalTasks: 0,
                isToday: false,
                date: ''
            });
        }

        return days;
    });

    weekDaysData = computed(() => {
        const curr = new Date(this.currentDate());
        const first = curr.getDate() - curr.getDay();
        const firstDay = new Date(new Date(curr).setDate(first));
        const tasks = this.taskService.getTasks();

        const week = [];
        for (let i = 0; i < 7; i++) {
            const next = new Date(firstDay);
            next.setDate(firstDay.getDate() + i);
            const dStr = this.formatDate(next);
            const dayTasks = tasks.filter(t => t.date === dStr);
            const isToday = this.formatDate(new Date()) === dStr;

            week.push({
                dayName: this.weekDays[i],
                dayNum: next.getDate(),
                dateStr: dStr,
                tasks: dayTasks,
                isToday
            });
        }
        return week;
    });

    currentMonthYear = computed(() => {
        const d = this.currentDate();
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    });

    ngOnInit() { }

    previous() {
        const newDate = new Date(this.currentDate());
        if (this.view() === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setDate(newDate.getDate() - 7);
        }
        this.currentDate.set(newDate);
    }

    next() {
        const newDate = new Date(this.currentDate());
        if (this.view() === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        this.currentDate.set(newDate);
    }

    goToDay(dateStr: string) {
        if (!dateStr) return;
        this.router.navigate(['/today'], { queryParams: { date: dateStr } });
    }

    getTaskStyle(task: Task) {
        const [h, m] = task.startTime.split(':').map(Number);
        const startMinutes = h * 60 + m;
        return {
            top: `${startMinutes}px`,
            height: `${task.duration}px`,
            backgroundColor: '#6d28d9',
            borderColor: '#4c1d95'
        };
    }
}
