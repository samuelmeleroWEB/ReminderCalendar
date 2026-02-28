/* src/app/core/models/task.model.ts */
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
    id: string;
    title: string;
    description?: string;
    startTime: string; // HH:mm
    duration: number; // minutes
    status: TaskStatus;
    date: string; // YYYY-MM-DD
}
