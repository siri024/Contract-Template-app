import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContractTemplate, TemplateSummary } from '../models/template.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TemplatesApiService {
  private base = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  list(): Observable<TemplateSummary[]> {
    return this.http.get<TemplateSummary[]>(`${this.base}/templates`);
  }

  create(title: string) {
    return this.http.post<TemplateSummary>(`${this.base}/templates`, { title });
  }

  get(id: string) {
    return this.http.get<ContractTemplate>(`${this.base}/templates/${id}`);
  }

  patch(id: string, body: Partial<ContractTemplate>) {
    return this.http.patch<ContractTemplate>(
      `${this.base}/templates/${id}`,
      body
    );
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.base}/templates/${id}`);
  }

  // loadOptions(endpoint: string) {
  //   return this.http.get<any[]>(`${this.base}${endpoint}`);
  // }
}
