import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FieldSchema } from '../../../../core/models/template.model';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DatepickerOverlayComponent } from '../datepicker-overlay/datepicker-overlay.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dynamic-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatepickerOverlayComponent],
  templateUrl: './dynamic-fields.component.html',
  styleUrl: './dynamic-fields.component.scss',
})
export class DynamicFieldsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) schema: FieldSchema[] = [];
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) initialValues!: Record<string, any>;

  options: Record<string, string[]> = {};

  @Output() valuesChange = new EventEmitter<Record<string, any>>();

  private destroy$ = new Subject<void>();
  private subscribed = false;

  ngOnInit(): void {
    console.log('DynamicFieldsComponent initialized with schema:', this.schema);
  }

  ngOnChanges(): void {
    // ensure controls exist for schema
    for (const f of this.schema) {
      if (!this.form.contains(f.key)) {
        this.form.addControl(
          f.key,
          new FormControl(
            this.initialValues[f.key] ?? this.defaultValue(f),
            this.validatorsFor(f)
          )
        );
      }

      if (
        (f.type === 'select' || f.type === 'multiselect') &&
        !this.options[f.key]
      ) {
        this.options[f.key] = f.options || [];
      }
    }
    if (!this.subscribed) {
      this.subscribed = true;

      this.form.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((values) => {
          this.valuesChange.emit(values);
        });
    }
  }

  ctrl(key: string) {
    return this.form.get(key) as FormControl;
  }

  onSelect(f: FieldSchema, e: Event) {
    const select = e.target as HTMLSelectElement;
    if (f.type === 'multiselect') {
      const values = Array.from(select.selectedOptions).map((o) => o.value);
      this.ctrl(f.key).setValue(values);
    } else {
      this.ctrl(f.key).setValue(select.value);
    }
    this.ctrl(f.key).markAsTouched();
  }

  private defaultValue(f: FieldSchema) {
    if (f.type === 'checkbox') return false;
    if (f.type === 'multiselect') return [];
    return '';
  }

  private validatorsFor(f: FieldSchema) {
    const v = [];
    if (f.required) v.push(Validators.required);

    if (f.validations?.minLength != null)
      v.push(Validators.minLength(f.validations.minLength));
    if (f.validations?.maxLength != null)
      v.push(Validators.maxLength(f.validations.maxLength));
    if (f.validations?.pattern)
      v.push(Validators.pattern(f.validations.pattern));

    if (
      f.type === 'date' &&
      (f.validations?.minDate || f.validations?.maxDate)
    ) {
      v.push(
        this.dateRangeValidator(f.validations?.minDate, f.validations?.maxDate)
      );
    }

    return v;
  }

  private dateRangeValidator(min?: string, max?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value as string;
      if (!val) return null;

      if (min && val < min) {
        return { minDate: true };
      }

      if (max && val > max) {
        return { maxDate: true };
      }

      return null;
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
