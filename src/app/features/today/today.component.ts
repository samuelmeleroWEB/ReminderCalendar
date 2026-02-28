import { Component, OnInit, inject, signal, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { Subscription } from 'rxjs';
import { LucideAngularModule, ChevronLeft, ChevronRight, Plus } from 'lucide-angular';

@Component({
    selector: 'app-today',
    standalone: true,
    imports: [
        CommonModule,
        TaskCardComponent,
        LucideAngularModule,
        RouterLink
    ],
    templateUrl: './today.component.html',
    styleUrl: './today.component.scss'
})
export class TodayComponent implements OnInit, OnDestroy {
    private taskService = inject(TaskService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    tasks = signal<Task[]>([]);

    // Fix timezone issue: Use local date
    selectedDate = signal<string>((() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })());

    formattedDisplayDate = computed(() => {
        const d = new Date(this.selectedDate());
        const today = new Date();
        // Reset hours to compare dates properly
        today.setHours(0, 0, 0, 0);
        const dCompare = new Date(d);
        dCompare.setHours(0, 0, 0, 0);

        const diffTime = dCompare.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        const datePart = d.toLocaleDateString('es-ES', options);

        if (diffDays === 0) return `Hoy, ${datePart}`;
        if (diffDays === 1) return `Mañana, ${datePart}`;
        if (diffDays === -1) return `Ayer, ${datePart}`;
        return datePart;
    });

    readonly icons = { ChevronLeft, ChevronRight, Plus };
    private sub: Subscription | null = null;

    constructor() {
        effect(() => {
            const date = this.selectedDate();
            this.loadTasks(date);
        }, { allowSignalWrites: true });
    }

    // ... inside class ...
    username = signal<string>('Usuario');
    avatar = signal<string | null>(null);

    greeting = computed(() => {
        const hour = new Date().getHours();
        const name = this.username();
        if (hour >= 6 && hour < 12) return `Buenos días, ${name}`;
        if (hour >= 12 && hour < 20) return `Buenas tardes, ${name}`;
        return `Buenas noches, ${name}`;
    });

    ngOnInit() {
        const savedName = localStorage.getItem('daily-planner-username');
        if (savedName) this.username.set(savedName);

        const savedAvatar = localStorage.getItem('daily-planner-avatar');
        if (savedAvatar) this.avatar.set(savedAvatar);

        this.route.queryParams.subscribe(params => {
            // ... existing subscription ...
            if (params['date']) {
                this.selectedDate.set(params['date']);
            }
        });
    }

    loadTasks(date: string) {
        if (this.sub) this.sub.unsubscribe();
        this.sub = this.taskService.getTasksForDate(date).subscribe(tasks => {
            // Filter out completed tasks as requested ("disappear")
            const activeTasks = tasks.filter(t => t.status !== 'completed');
            const sorted = [...activeTasks].sort((a, b) => a.startTime.localeCompare(b.startTime));
            this.tasks.set(sorted);
        });
    }

    prevDay() {
        const d = new Date(this.selectedDate());
        d.setDate(d.getDate() - 1);
        this.selectedDate.set(d.toISOString().split('T')[0]);
    }

    nextDay() {
        const d = new Date(this.selectedDate());
        d.setDate(d.getDate() + 1);
        this.selectedDate.set(d.toISOString().split('T')[0]);
    }

    addTask() {
        this.router.navigate(['/add-task'], { queryParams: { date: this.selectedDate() } });
    }

    editTask(id: string) {
        this.router.navigate(['/edit-task', id]);
    }

    deleteTask(id: string) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            this.taskService.deleteTask(id);
        }
    }

    toggleStatus(task: Task) {
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
        this.taskService.updateTaskStatus(task.id, newStatus);
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}
