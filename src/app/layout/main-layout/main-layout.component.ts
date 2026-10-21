import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { SiteFooterComponent } from '@shared/components/site-footer/site-footer.component';

/** Layout da área autenticada: menu lateral, barra superior, conteúdo e rodapé. */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, SiteFooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  protected readonly menuAberto = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(() => this.menuAberto.set(false));
  }

  @HostListener('document:keydown.escape')
  fecharMenu() {
    this.menuAberto.set(false);
  }

  /** Com <base href="/">, um href="#conteudo" levaria para a raiz; por isso o foco é movido manualmente. */
  pularParaConteudo(event: Event) {
    event.preventDefault();
    document.getElementById('conteudo')?.focus();
  }
}
