import { Component, OnInit, inject, signal, computed, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, Chart } from 'chart.js';
import { TaskService } from '../../core/services/task.service';
import { PomodoroService } from '../../core/services/pomodoro.service';
import { LucideAngularModule, Zap, Flame } from 'lucide-angular';
import { Task } from '../../core/models/task.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, LucideAngularModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
    private taskService = inject(TaskService);
    private pomodoroService = inject(PomodoroService);

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    readonly icons = { Zap, Flame };

    tasks = signal<Task[]>([]);

    constructor() {
        this.taskService.tasks$.subscribe(t => this.tasks.set(t));

        effect(() => {
            const allTasks = this.tasks();
            const today = new Date().toISOString().split('T')[0];
            const todaysTasks = allTasks.filter(t => t.date === today);

            // Update Doughnut Data
            const percent = this.completionPercentage();
            this.doughnutData = {
                ...this.doughnutData,
                datasets: [{
                    ...this.doughnutData.datasets[0],
                    data: [percent, Math.max(0, 100 - percent)]
                }]
            };

            // Update Bar Data (Hourly Distribution)
            const dynamicLabels: string[] = [];
            const dynamicData: number[] = [];
            for (let i = 8; i <= 22; i += 2) {
                dynamicLabels.push(`${i}:00`);
                let count = 0;
                for (const t of todaysTasks) {
                    if (t.startTime) {
                        const h = parseInt(t.startTime.split(':')[0], 10);
                        if (h >= i && h < i + 2) count++;
                    }
                }
                dynamicData.push(count);
            }
            this.barData = {
                ...this.barData,
                labels: dynamicLabels,
                datasets: [{
                    ...this.barData.datasets[0],
                    data: dynamicData
                }]
            };

            // Update Line Data (Weekly Productivity)
            const daysData: number[] = [];
            const daysLabels: string[] = [];
            const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dStr = d.toISOString().split('T')[0];
                daysLabels.push(dayNames[d.getDay()]);
                const dayCompleted = allTasks.filter(t => t.date === dStr && t.status === 'completed').length;
                daysData.push(dayCompleted);
            }
            this.lineData = {
                ...this.lineData,
                labels: daysLabels,
                datasets: [{ ...this.lineData.datasets[0], data: daysData }]
            };

        }, { allowSignalWrites: true });
    }

    todayStats = computed(() => {
        const tasks = this.tasks();
        const today = new Date().toISOString().split('T')[0];
        const todays = tasks.filter(t => t.date === today);
        return {
            total: todays.length,
            completed: todays.filter(t => t.status === 'completed').length,
            inProgress: todays.filter(t => t.status === 'in-progress').length,
            pending: todays.filter(t => t.status === 'pending').length
        };
    });

    completionPercentage = computed(() => {
        const s = this.todayStats();
        if (s.total === 0) return 0;
        return Math.round((s.completed / s.total) * 100);
    });

    todayFocusTime = this.pomodoroService.totalFocusTime;

    currentStreak = computed(() => {
        const allTasks = this.tasks();
        let streak = 0;
        let d = new Date();
        while (true) {
            const dStr = d.toISOString().split('T')[0];
            const completedForDay = allTasks.filter(t => t.date === dStr && t.status === 'completed').length;
            if (completedForDay > 0) {
                streak++;
            } else if (streak > 0 || dStr !== new Date().toISOString().split('T')[0]) {
                break;
            }
            d.setDate(d.getDate() - 1);
        }
        return streak;
    });

    // Chart Data Configs
    public doughnutData: ChartConfiguration<'doughnut'>['data'] = {
        labels: ['Completada', 'Restante'],
        datasets: [{
            data: [0, 100],
            backgroundColor: ['#6d28d9', '#2c2c2e'],
            borderWidth: 0,
            hoverBackgroundColor: ['#7c3aed', '#3f3f46']
        }]
    };

    public doughnutOptions: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        cutout: '85%',
        animation: { animateScale: true, animateRotate: true }
    };

    public barData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            label: 'Tareas',
            backgroundColor: '#6d28d9',
            borderRadius: 8,
            barThickness: 20
        }]
    };

    public barOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { display: false }, ticks: { color: '#a1a1aa' } },
            y: { beginAtZero: true, grid: { color: '#2a2a2a', lineWidth: 1 }, ticks: { display: false } }
        },
        plugins: { legend: { display: false } }
    };

    public lineData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [{
            data: [],
            label: 'Completadas',
            borderColor: '#00e5ff',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0d0d0d',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
        }]
    };

    public lineOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { display: false }, ticks: { color: '#a1a1aa' } },
            y: { beginAtZero: true, grid: { color: '#2a2a2a', lineWidth: 1 }, ticks: { stepSize: 1, color: '#a1a1aa' } }
        },
        plugins: { legend: { display: false } }
    };

    ngOnInit() {
    }

    ngAfterViewInit() {
    }
}
