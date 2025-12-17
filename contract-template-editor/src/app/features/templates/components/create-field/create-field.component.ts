import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldSchema } from '../../../../core/models/template.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-field',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-field.component.html',
  styleUrl: './create-field.component.scss',
})
export class CreateFieldComponent {
  @Input() schema: FieldSchema[] = [];
  @Output() schemaChange = new EventEmitter<FieldSchema[]>();

  draft: FieldSchema = {
    key: '',
    label: '',
    type: 'text',
    required: false,
  };

  selectOptions = '';

  add() {
    if (!this.draft.key || !this.draft.label) return;

    const field: FieldSchema = {
      ...this.draft,
      validations: {},
    };

    if (this.draft.type === 'select') {
      field.options = this.selectOptions
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    }

    this.schemaChange.emit([...this.schema, field]);

    // reset
    this.draft = { key: '', label: '', type: 'text', required: false };
    this.selectOptions = '';
  }

  remove(key: string) {
    this.schemaChange.emit(this.schema.filter((f) => f.key !== key));
  }
}
