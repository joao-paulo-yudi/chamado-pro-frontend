import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Nivel, Role, Usuario, UsuarioRequest } from '@core/models';
import { NIVEL_OPCOES, ROLE_META, ROLE_OPCOES } from '@core/constants/chamado.constants';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ToastService, mensagemDeErro } from '@core/services/toast.service';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { UsuariosService } from '../services/usuarios.service';

/** Cadastro e edição de usuários (a mesma tela atende `/usuarios/novo` e `/usuarios/:id/editar`). */
@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingStateComponent],
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.css',
})
export class FormUsuarioComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(UsuariosService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  /** Parâmetro `:id` da rota; ausente no cadastro. */
  readonly id = input<string>();
  protected readonly edicao = computed(() => !!this.id());

  protected readonly roles = ROLE_OPCOES;
  protected readonly roleMeta = ROLE_META;
  protected readonly niveis = NIVEL_OPCOES;

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    tipoUsuario: this.fb.control<Role>('CLIENTE'),
    nivelTecnico: this.fb.control<Nivel>('N1'),
    senha: ['', [Validators.minLength(8), Validators.maxLength(128)]],
    telefone: ['', [Validators.pattern(/^\d{10,15}$/)]],
    whatsappApiKey: ['', [Validators.maxLength(64)]],
  });

  protected readonly tipo = toSignal(this.form.controls.tipoUsuario.valueChanges, { initialValue: 'CLIENTE' as Role });
  protected readonly original = signal<Usuario | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mostrarSenha = signal(false);

  ngOnInit() {
    if (!this.edicao()) {
      this.form.controls.senha.addValidators(Validators.required);
      return;
    }

    this.carregando.set(true);
    this.service.buscarPorId(Number(this.id())).subscribe({
      next: u => {
        this.original.set(u);
        this.form.patchValue({
          nome: u.nome,
          email: u.email,
          tipoUsuario: u.tipoUsuario,
          nivelTecnico: u.nivelTecnico ?? 'N1',
          telefone: u.telefone ?? '',
        });
        this.carregando.set(false);
      },
      error: () => {
        this.toast.error('Usuário não encontrado.');
        this.router.navigate(['/usuarios']);
      },
    });
  }

  invalido(campo: 'nome' | 'email' | 'senha' | 'telefone'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  /** Trocar o telefone revoga o consentimento de WhatsApp dado para o número anterior. */
  telefoneAlterado(): boolean {
    const o = this.original();
    return !!o?.consentimentoWhatsapp && (o.telefone ?? '') !== this.form.controls.telefone.value.trim();
  }

  salvar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const v = this.form.getRawValue();
    const payload: UsuarioRequest = {
      nome: v.nome.trim(),
      email: v.email.trim(),
      tipoUsuario: v.tipoUsuario,
      nivelTecnico: v.tipoUsuario === 'TECNICO' ? v.nivelTecnico : null,
      telefone: v.telefone.trim() || null,
    };
    // Em branco = manter a senha e a chave atuais
    if (v.senha) payload.senha = v.senha;
    if (v.whatsappApiKey.trim()) payload.whatsappApiKey = v.whatsappApiKey.trim();

    this.salvando.set(true);
    this.erro.set('');
    const req = this.edicao() ? this.service.atualizar(Number(this.id()), payload) : this.service.criar(payload);
    req.subscribe({
      next: u => {
        this.toast.success(this.edicao() ? 'Usuário atualizado.' : `Usuário ${u.nome} criado com sucesso.`);
        this.router.navigate(['/usuarios']);
      },
      error: err => {
        this.salvando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível salvar o usuário.'));
      },
    });
  }

  async excluir() {
    const u = this.original();
    if (!u) return;
    const ok = await this.confirm.confirmar({
      titulo: `Excluir ${u.nome}?`,
      mensagem: 'O usuário perderá o acesso ao sistema. Esta ação não pode ser desfeita.',
      confirmar: 'Excluir usuário',
      perigo: true,
    });
    if (!ok) return;

    this.service.excluir(u.id).subscribe({
      next: () => {
        this.toast.success('Usuário excluído.');
        this.router.navigate(['/usuarios']);
      },
      error: err => this.toast.error(mensagemDeErro(err, 'Não foi possível excluir o usuário.')),
    });
  }
}
