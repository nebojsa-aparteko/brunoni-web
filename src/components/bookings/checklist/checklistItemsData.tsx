export enum FieldType {
  CHECKMARK, // when item just needs to be confirmed that it has been done -- used mostly for customers
  FILE,
  TEXT,
}

export interface ChecklistItemValueText {
  text: string;
}

export interface ChecklistItemValueForm {
  url: string;
  checked?: boolean;
}

export interface ChecklistItemValueDocuments {
  url: string;
  name: string;
}

export interface ChecklistItemValue {
  type: FieldType;
  data?: ChecklistItemValueText | ChecklistItemValueForm | ChecklistItemValueDocuments;
}

export interface ChecklistItem {
  id: string;
  label: string;
  order: number;
  checked?: boolean;
  values?: Array<ChecklistItemValue>;
  valuesAdmin?: Array<ChecklistItemValue>;
}
