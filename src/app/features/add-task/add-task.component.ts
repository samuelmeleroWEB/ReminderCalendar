import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { LucideAngularModule, Calendar, Clock, X, ChevronLeft, ChevronRight, Check } from 'lucide-angular';

@Component({
    selector: 'app-add-task',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './add-task.component.html',
    styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
    private fb = inject(FormBuilder);
    private taskService = inject(TaskService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form: FormGroup;
    isEditing = false;
    editingId: string | null = null;

    // UI State
    showDatePicker = false;
    showTimePicker = false;

    // Icons
    readonly icons = { Calendar, Clock, X, ChevronLeft, ChevronRight, Check };

    // Calendar State
    calendarBaseDate = new Date(); // For navigation
    weekDays = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];

    // Time State
    availableHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    availableMinutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    get calendarDays() {
        const year = this.calendarBaseDate.getFullYear();
        const month = this.calendarBaseDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startDay = firstDay.getDay();

        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            days.push({
                day: i,
                date: this.formatDate(date),
                isToday: this.formatDate(new Date()) === this.formatDate(date),
                isSelected: this.form.get('date')?.value === this.formatDate(date)
            });
        }

        return days;
    }

    get currentMonthName() {
        return this.calendarBaseDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    constructor() {
        // Fix timezone: Use local date
        const d = new Date();
        const today = this.formatDate(d);
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        this.form = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            startTime: [currentTime, Validators.required],
            duration: [30, [Validators.required, Validators.min(1)]],
            date: [today, Validators.required]
        });
    }

    private formatDate(d: Date): string {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    toggleDatePicker() {
        this.showDatePicker = !this.showDatePicker;
        this.showTimePicker = false;
        if (this.showDatePicker) {
            // Sync calendar base date with selected date
            const selected = new Date(this.form.get('date')?.value);
            if (!isNaN(selected.getTime())) {
                this.calendarBaseDate = selected;
            }
        }
    }

    toggleTimePicker() {
        this.showTimePicker = !this.showTimePicker;
        this.showDatePicker = false;
    }

    prevMonth(e: Event) {
        e.stopPropagation();
        this.calendarBaseDate = new Date(this.calendarBaseDate.getFullYear(), this.calendarBaseDate.getMonth() - 1, 1);
    }

    nextMonth(e: Event) {
        e.stopPropagation();
        this.calendarBaseDate = new Date(this.calendarBaseDate.getFullYear(), this.calendarBaseDate.getMonth() + 1, 1);
    }

    selectDate(dateStr: string) {
        this.form.patchValue({ date: dateStr });
        this.showDatePicker = false;
    }

    selectTime(hour: string, minute: string) {
        this.form.patchValue({ startTime: `${hour}:${minute}` });
        // Don't close immediately allow adjusting
    }

    // Quick helpers
    setToday() {
        this.selectDate(this.formatDate(new Date()));
    }

    setTomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        this.selectDate(this.formatDate(d));
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        // Handle date query param
        const dateParam = this.route.snapshot.queryParamMap.get('date');
        if (dateParam && !id) { // Only set date if creating new task
            this.form.patchValue({ date: dateParam });
        }

        if (id) {
            this.isEditing = true;
            this.editingId = id;
            const task = this.taskService.getTaskById(id);
            if (task) {
                this.form.patchValue({
                    title: task.title,
                    description: task.description,
                    startTime: task.startTime,
                    duration: task.duration,
                    date: task.date
                });
            } else {
                this.router.navigate(['/']);
            }
        }
    }

    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.value;

            if (this.isEditing && this.editingId) {
                this.taskService.updateTask(this.editingId, formValue);
            } else {
                this.taskService.addTask({
                    ...formValue,
                    status: 'pending' // Default status
                });
            }

            this.router.navigate(['/']);
        }
    }

    cancel() {
        this.router.navigate(['/']);
    }
}
