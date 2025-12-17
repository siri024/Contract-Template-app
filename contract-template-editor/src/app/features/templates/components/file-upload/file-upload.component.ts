import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { interval, map, takeWhile } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  @Output() urlReady = new EventEmitter<string>();

  uploading = false;
  progress = 0;
  url = '';

  start() {
    this.uploading = true;
    this.progress = 0;
    this.url = '';

    interval(120)
      .pipe(
        map((i) => Math.min(100, i * 6)),
        takeWhile((p) => p < 100, true)
      )
      .subscribe({
        next: (p) => (this.progress = p),
        complete: () => {
          this.uploading = false;
          this.url = `https://gcs.fake/${Date.now()}.pdf`;
          this.urlReady.emit(this.url);
        },
      });
  }
}
