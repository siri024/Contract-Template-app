import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-pane',
  standalone: true,
  imports: [],
  templateUrl: './preview-pane.component.html',
  styleUrl: './preview-pane.component.scss',
})
export class PreviewPaneComponent {
  safeHtml: SafeHtml = '';

  private _html = '';
  private _values: Record<string, any> = {};

  constructor(private sanitizer: DomSanitizer) {}

  // -------- INPUTS --------

  @Input()
  set html(value: string) {
    this._html = value ?? '';
    this.updatePreview();
  }

  @Input()
  set values(value: Record<string, any>) {
    this._values = value ?? {};
    this.updatePreview();
  }

  // -------- INTERNAL --------

  private updatePreview(): void {
    if (!this._html) {
      this.safeHtml = '';
      return;
    }

    const rendered = this._html.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
      const val = this._values[key];
      if (val == null) return '';
      if (Array.isArray(val)) return val.join(', ');
      return String(val);
    });

    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(rendered);
  }
}
