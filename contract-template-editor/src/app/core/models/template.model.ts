export interface TemplateSummary {
  id: string;
  title: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface ContractTemplate {
  id: string;
  title: string;
  templateHtml: string; // quill html
  schema: FieldSchema[]; // dynamic fields schema
  values: Record<string, any>; // field values
  published: boolean;
  updatedAt: string;
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'checkbox';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // values: Record<string, string | string [] | boolean>;
  options?: string[];
  validations?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minDate?: string;
    maxDate?: string;
  };
}
