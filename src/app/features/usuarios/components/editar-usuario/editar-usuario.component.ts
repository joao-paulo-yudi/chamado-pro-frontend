import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService, Usuario } from '../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.style.css']
})
export class EditarUsuarioComponent implements OnInit {
  usuario?: Usuario;
  erro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.usuariosService.buscarPorId(id).subscribe(data => this.usuario = data);
  }

  salvar() {
    if (!this.usuario) return;
    this.usuariosService.atualizar(this.usuario.id, this.usuario).subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: err => this.erro = err.error?.message || 'Não foi possível salvar o usuário.'
    });
  }

  deletar() {
    if (!this.usuario) return;
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      this.usuariosService.excluir(this.usuario.id).subscribe({
        next: () => this.router.navigate(['/usuarios']),
        error: err => this.erro = err.error?.message || 'Não foi possível excluir o usuário.'
      });
    }
  }
}
