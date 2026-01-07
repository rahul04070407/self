import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isLoggedInSignal = signal<boolean>(this.checkAuth());

    constructor(private router: Router) { }

    isLoggedIn() {
        return this.isLoggedInSignal();
    }

    login(username: string, password: string): boolean {
        // Standardizing on 'rahul' as username and '321@rahul' as password
        if (username.toLowerCase() === 'rahul' && password === '321@rahul') {
            localStorage.setItem('isAuthenticated', 'true');
            this.isLoggedInSignal.set(true);
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('isAuthenticated');
        this.isLoggedInSignal.set(false);
        this.router.navigate(['/login']);
    }

    private checkAuth(): boolean {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('isAuthenticated') === 'true';
        }
        return false;
    }
}
