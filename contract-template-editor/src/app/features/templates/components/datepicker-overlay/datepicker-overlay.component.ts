import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Component({
  selector: 'app-datepicker-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datepicker-overlay.component.html',
  styleUrl: './datepicker-overlay.component.scss',
})
export class DatepickerOverlayComponent {
  @Input() label = '';
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('origin', { static: true }) origin!: ElementRef<HTMLInputElement>;

  private overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;

  manual(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.valueChange.emit(v);
  }

  open() {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.origin)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 8,
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const portal = new ComponentPortal(DatepickerPopupComponent);
    const popupRef = this.overlayRef.attach(portal);

    popupRef.instance.value = this.value ?? '';
    popupRef.instance.pick.subscribe((v) => {
      this.valueChange.emit(v);
      this.close();
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup">
      <div class="title">Pick date</div>
      <input type="date" [value]="value" (input)="onPick($event)" />
      <div class="hint">This popup is appended to body via CDK Overlay.</div>
    </div>
  `,
  styles: [
    `
      .popup {
        width: 260px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
      }
      .title {
        font-weight: 600;
        margin-bottom: 8px;
      }
      input {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        border-radius: 8px;
        border: 1px solid #d1d5db;
      }
      .hint {
        margin-top: 10px;
        font-size: 11px;
        color: #6b7280;
      }
    `,
  ],
})
export class DatepickerPopupComponent {
  value = '';
  pick = new EventEmitter<string>();

  onPick(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.pick.emit(v);
  }
}
