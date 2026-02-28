/* src/app/core/services/task.service.ts */
import { Injectable, signal, computed, effect } from '@angular/core';
import { Task, TaskStatus } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private readonly STORAGE_KEY = 'daily_planner_tasks';

    // Using BehaviorSubject for compatibility with requested structure, 
    // but also maintaining a signal for modern internal handling if needed
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    public tasks$ = this.tasksSubject.asObservable();

    constructor() {
        this.loadTasks();
    }

    private loadTasks(): void {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const tasks = JSON.parse(stored);
                this.tasksSubject.next(tasks);
            } catch (e) {
                console.error('Failed to parse tasks', e);
                this.tasksSubject.next([]);
            }
        }
    }

    private saveTasks(tasks: Task[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
        this.tasksSubject.next(tasks);
    }

    getTasks(): Task[] {
        return this.tasksSubject.value;
    }

    getTasksForDate(dateStr: string): Observable<Task[]> {
        return new Observable(subscriber => {
            const sub = this.tasks$.subscribe(tasks => {
                subscriber.next(tasks.filter(t => t.date === dateStr));
            });
            return () => sub.unsubscribe();
        });
    }

    addTask(task: Omit<Task, 'id'>): void {
        const newTask: Task = {
            ...task,
            id: crypto.randomUUID(),
        };
        const currentTasks = this.tasksSubject.value;
        this.saveTasks([...currentTasks, newTask]);
    }

    updateTask(id: string, updates: Partial<Task>): void {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex(t => t.id === id);
        if (index !== -1) {
            const updatedTasks = [...currentTasks];
            updatedTasks[index] = { ...updatedTasks[index], ...updates };
            this.saveTasks(updatedTasks);
        }
    }

    deleteTask(id: string): void {
        const currentTasks = this.tasksSubject.value;
        this.saveTasks(currentTasks.filter(t => t.id !== id));
    }

    updateTaskStatus(id: string, status: TaskStatus): void {
        this.updateTask(id, { status });
    }

    getTaskById(id: string): Task | undefined {
        return this.tasksSubject.value.find(t => t.id === id);
    }
}
