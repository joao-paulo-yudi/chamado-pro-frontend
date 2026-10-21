import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.style.css']
})
export class LoginComponent {
    form: FormGroup;
    loading = false;
    errorMessage = '';
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            senha: ['', Validators.required],
        });

        if (this.auth.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    onSubmit() {
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        this.auth.login(this.form.value).subscribe({
            next: (res) => {
                this.loading = false;
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.errorMessage = err.status === 429
                    ? 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'
                    : 'E-mail ou senha incorretos.';
                this.loading = false;
            },
        });
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }
}
