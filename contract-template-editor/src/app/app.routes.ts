import { Routes } from '@angular/router';
import { TemplateListPageComponent } from './features/templates/pages/template-list-page/template-list-page.component';
import { TemplateEditorPageComponent } from './features/templates/pages/template-editor-page/template-editor-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'templates' },
  { path: 'templates', component: TemplateListPageComponent },
  { path: 'templates/:id', component: TemplateEditorPageComponent },
  { path: '**', redirectTo: 'templates' },
];
