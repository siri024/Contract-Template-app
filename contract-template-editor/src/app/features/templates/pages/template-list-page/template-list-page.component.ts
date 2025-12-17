import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TemplateSummary } from '../../../../core/models/template.model';
import { Subject, takeUntil } from 'rxjs';
import { TemplatesApiService } from '../../../../core/api/templates-api.service';

@Component({
  selector: 'app-template-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './template-list-page.component.html',
  styleUrl: './template-list-page.component.scss',
})
export class TemplateListPageComponent {
  templates: TemplateSummary[] = [];
  newTitle = '';

  renamingId: string | null = null;
  renameTitle = '';

  private destroy$ = new Subject<void>();

  constructor(private api: TemplatesApiService) {
    this.load();
  }

  load() {
    this.api
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe((t) => (this.templates = t));
  }

  create() {
    const title = this.newTitle.trim();
    if (!title) return;
    this.api
      .create(title)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.newTitle = '';
        this.load();
      });
  }

  startRename(t: TemplateSummary) {
    this.renamingId = t.id;
    this.renameTitle = t.title;
  }

  cancelRename() {
    this.renamingId = null;
    this.renameTitle = '';
  }

  confirmRename(id: string) {
    const title = this.renameTitle.trim();
    if (!title) return;
    this.api
      .patch(id, { title })
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cancelRename();
        this.load();
      });
  }

  remove(id: string) {
    this.api
      .remove(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
