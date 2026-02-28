import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeFormat',
    standalone: true
})
export class TimeFormatPipe implements PipeTransform {
    transform(time: string, duration?: number): string {
        if (!time) return '';

        // If just time is provided, return formatted 12h or 24h as desired.
        // Requirement implies mostly 24h HH:mm from input, but let's just return it cleanly or handle duration addition.

        if (duration) {
            const [h, m] = time.split(':').map(Number);
            const date = new Date();
            date.setHours(h);
            date.setMinutes(m + duration);
            const endH = date.getHours().toString().padStart(2, '0');
            const endM = date.getMinutes().toString().padStart(2, '0');

            return `${time} - ${endH}:${endM}`;
        }

        return time;
    }
}
