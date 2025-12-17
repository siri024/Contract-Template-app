import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ContractTemplate,
  FieldSchema,
} from '../../../../core/models/template.model';
import { TemplatesApiService } from '../../../../core/api/templates-api.service';
import { DynamicFieldsComponent } from '../../components/dynamic-fields/dynamic-fields.component';
import { PreviewPaneComponent } from '../../components/preview-pane/preview-pane.component';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { CreateFieldComponent } from '../../components/create-field/create-field.component';

@Component({
  selector: 'app-template-editor-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    QuillModule,
    DynamicFieldsComponent,
    PreviewPaneComponent,
    FileUploadComponent,
    CreateFieldComponent,
  ],
  templateUrl: './template-editor-page.component.html',
  styleUrl: './template-editor-page.component.scss',
})
export class TemplateEditorPageComponent {
  id = '';
  template: ContractTemplate | null = null;

  loaded = false;
  preview = true;

  metaForm: FormGroup;
  fieldsForm: FormGroup;

  schema: FieldSchema[] = [];

  saving = false;
  lastSavedAt: Date | null = null;

  private destroy$ = new Subject<void>();

  // Quill modules incl @mentions
  quillModules: any = {
    toolbar: [['bold', 'italic'], [{ color: [] }], ['link'], ['clean']],
    mention: {
      mentionDenotationChars: ['@'],
      source: (searchTerm: string, renderList: any) => {
        const users = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
        const list = users
          .filter((u) =>
            u.toLowerCase().includes((searchTerm ?? '').toLowerCase())
          )
          .map((u) => ({ id: u, value: u }));
        renderList(list, searchTerm);
      },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private api: TemplatesApiService,
    fb: FormBuilder
  ) {
    this.metaForm = fb.group({
      title: [''],
      templateHtml: [''],
    });

    this.fieldsForm = fb.group({});

    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load() {
    this.api
      .get(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((t) => {
        this.template = t;
        this.schema = t.schema ?? [];

        this.metaForm.patchValue(
          { title: t.title, templateHtml: t.templateHtml },
          { emitEvent: false }
        );

        // autosave
        this.metaForm.valueChanges
          .pipe(
            debounceTime(800),
            distinctUntilChanged(
              (a, b) => JSON.stringify(a) === JSON.stringify(b)
            ),
            switchMap((v) => {
              this.saving = true;
              return this.api.patch(this.id, {
                title: v.title,
                templateHtml: v.templateHtml,
              });
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (updated) => {
              this.saving = false;
              this.lastSavedAt = new Date();
              this.template = { ...this.template!, ...updated };
            },
            error: () => (this.saving = false),
          });

        // save fields when fields change (also debounced)
        this.fieldsForm.valueChanges
          .pipe(
            debounceTime(800),
            distinctUntilChanged(
              (a, b) => JSON.stringify(a) === JSON.stringify(b)
            ),
            switchMap(() => {
              this.saving = true;
              return this.api.patch(this.id, { schema: this.schema });
            }),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: () => {
              this.saving = false;
              this.lastSavedAt = new Date();
            },
            error: () => (this.saving = false),
          });

        this.loaded = true;
      });
  }

  togglePreview() {
    this.preview = !this.preview;
  }

  publish() {
    this.api
      .patch(this.id, { published: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe((t) => {
        this.template = { ...this.template!, ...t };
        this.lastSavedAt = new Date();
      });
  }

  markAllTouched() {
    Object.values(this.fieldsForm.controls).forEach((c) => c.markAsTouched());
  }

  isValid() {
    return this.metaForm.valid && this.fieldsForm.valid;
  }

  onSchemaChange(newSchema: FieldSchema[]) {
    this.schema = newSchema;

    // remove deleted field values
    const values = { ...this.fieldsForm.value };
    Object.keys(values).forEach((key) => {
      if (!newSchema.find((f) => f.key === key)) {
        delete values[key];
        this.fieldsForm.removeControl(key);
      }
    });

    this.saveSchemaAndValues();
  }

  saveSchemaAndValues() {
    this.api
      .patch(this.id, {
        schema: this.schema,
        values: this.fieldsForm.value,
      })
      .subscribe();
  }

  onUploadUrl(url: string) {
    // demo: insert URL into template as placeholder text or append
    const current = this.metaForm.value.templateHtml ?? '';
    this.metaForm.patchValue({
      templateHtml: `${current}<p>Uploaded file: <a href="${url}">${url}</a></p>`,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onValuesChange(values: Record<string, any>) {
    this.api.patch(this.id, { values }).subscribe();
  }
}
