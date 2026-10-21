import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentariosService, Comentario } from '../service/comentarios.service';
import { AuthService } from './../../auth/services/auth.service';
import { PerfilService } from '../../../core/services/perfil.service';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.style.css']
})
export class ComentariosComponent implements OnInit {

  @Input() chamadoId!: number;

  comentarios: Comentario[] = [];
  novoComentario: string = '';

  role: string | null = null;
  usuarioId: number | null = null;

  constructor(
    private comentariosService: ComentariosService,
    private auth: AuthService,
    private perfil: PerfilService
  ) { }

  ngOnInit() {
    this.role = this.auth.getUserRole();
    this.perfil.me().subscribe({ next: p => this.usuarioId = p.id });

    this.carregarComentarios();
  }

  carregarComentarios() {
    this.comentariosService.listarPorChamado(this.chamadoId).subscribe({
      next: data => {
        this.comentarios = data.sort(
          (a, b) => new Date(a.dataCriacao!).getTime() - new Date(b.dataCriacao!).getTime()
        );
      },
      error: err => console.error("Erro ao carregar comentários", err)
    });
  }

  enviarComentario() {
    if (!this.novoComentario.trim()) return;

    // O autor é definido no servidor a partir do usuário autenticado
    const comentario = { texto: this.novoComentario.trim() };

    this.comentariosService.criar(this.chamadoId, comentario).subscribe({
      next: novo => {
        this.comentarios.push(novo);
        this.novoComentario = '';
      },
      error: err => console.error("Erro ao enviar comentário", err)
    });
  }

  podeExcluir(c: Comentario): boolean {
    return (
      this.role === 'ADMIN' ||
      (this.usuarioId !== null && c.autorId === this.usuarioId)
    );
  }

  excluirComentario(id: number) {
    if (!confirm("Deseja excluir este comentário?")) return;

    this.comentariosService.excluir(id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(c => c.id !== id);
      },
      error: err => console.error("Erro ao excluir comentário", err)
    });
  }
}
