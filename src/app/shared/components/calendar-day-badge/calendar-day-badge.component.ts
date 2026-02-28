import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-calendar-day-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './calendar-day-badge.component.html',
    styleUrl: './calendar-day-badge.component.scss'
})
export class CalendarDayBadgeComponent {
    day = input.required<number>();
    taskCount = input<number>(0);
    active = input<boolean>(false);
}
