import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Role, Usuario } from '@core/models';
import { ROLE_OPCOES } from '@core/constants/chamado.constants';
import { EnumBadgeComponent } from '@shared/components/enum-badge/enum-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { InitialsPipe } from '@shared/pipes/initials.pipe';
import { LabelPipe } from '@shared/pipes/label.pipe';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [FormsModule, RouterLink, EnumBadgeComponent, EmptyStateComponent, InitialsPipe, LabelPipe],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.css',
})
export class ListaUsuariosComponent implements OnInit {
  private readonly service = inject(UsuariosService);
  private readonly router = inject(Router);

  protected readonly roles = ROLE_OPCOES;
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly busca = signal('');
  protected readonly papel = signal<Role | ''>('');

  protected readonly contagem = computed(() => {
    const c: Record<string, number> = { '': this.usuarios().length };
    for (const u of this.usuarios()) c[u.tipoUsuario] = (c[u.tipoUsuario] ?? 0) + 1;
    return c;
  });

  protected readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const papel = this.papel();
    return this.usuarios()
      .filter(u => !papel || u.tipoUsuario === papel)
      .filter(u => !termo || `${u.nome} ${u.email}`.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set(false);
    this.service.listar().subscribe({
      next: data => {
        this.usuarios.set(data);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  editar(u: Usuario, event?: MouseEvent) {
    if (event && (event.target as HTMLElement).closest('a, button')) return;
    this.router.navigate(['/usuarios', u.id, 'editar']);
  }
}
