import { Routes } from '@angular/router';
import { TodayComponent } from './features/today/today.component';

export const routes: Routes = [
    { path: 'today', component: TodayComponent },
    {
        path: 'focus',
        loadComponent: () => import('./features/focus/focus.component').then(m => m.FocusComponent)
    },
    {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'add-task',
        loadComponent: () => import('./features/add-task/add-task.component').then(m => m.AddTaskComponent)
    },
    {
        path: 'edit-task/:id',
        loadComponent: () => import('./features/add-task/add-task.component').then(m => m.AddTaskComponent)
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
    },
    { path: '', redirectTo: 'today', pathMatch: 'full' }
];
