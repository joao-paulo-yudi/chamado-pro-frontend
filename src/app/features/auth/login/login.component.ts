import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { PerfilService } from '@core/services/perfil.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly perfil = inject(PerfilService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  protected readonly carregando = signal(false);
  protected readonly erro = signal('');
  protected readonly mostrarSenha = signal(false);

  invalido(campo: 'email' | 'senha'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  entrar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    this.carregando.set(true);
    this.erro.set('');
    const { email, senha } = this.form.getRawValue();

    this.auth.login({ email: email.trim(), senha }).subscribe({
      next: () => {
        this.perfil.limpar();
        this.router.navigate(['/']);
      },
      error: err => {
        this.carregando.set(false);
        this.erro.set(
          err.status === 429
            ? 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'
            : 'E-mail ou senha incorretos.'
        );
      },
    });
  }
}
