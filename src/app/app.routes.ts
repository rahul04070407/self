import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { EmisComponent } from './components/emis/emis.component';
import { LoginComponent } from './components/login/login.component';
import { ReportsComponent } from './components/reports/reports.component';
import { authGuard, loginGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'transactions', component: TransactionsComponent },
            { path: 'emis', component: EmisComponent },
            { path: 'reports', component: ReportsComponent },
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
