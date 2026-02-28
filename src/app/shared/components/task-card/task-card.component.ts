import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';
import { LucideAngularModule, Edit2, Trash2, Check } from 'lucide-angular';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, TimeFormatPipe, LucideAngularModule],
    templateUrl: './task-card.component.html',
    styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
    task = input.required<Task>();

    edit = output<void>();
    delete = output<void>();
    statusChange = output<void>();

    readonly icons = { Edit2, Trash2, Check };

    onEdit(e: Event) {
        e.stopPropagation();
        this.edit.emit();
    }

    onDelete(e: Event) {
        e.stopPropagation();
        this.delete.emit();
    }

    onToggleStatus(e: Event) {
        e.stopPropagation();
        this.statusChange.emit();
    }
}
