import { CheckListDocument } from '../../../model/Booking';
export enum FieldType {
  CHECKMARK, // when item just needs to be confirmed that it has been done -- used mostly for customers
  FILE,
  TEXT,
}

export interface ChecklistItemValueDataText {
  text: string;
}

export interface ChecklistItemValueForm {
  url: string;
  checked?: boolean;
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
  data: ChecklistItemValueDataText | ChecklistItemValueForm | ChecklistItemValueDocuments;
}

export interface ChecklistItem {
  id: string;
  label: string;
  order: number;
  checked?: boolean;
  values?: [ChecklistItemValue];
  valuesAdmin?: [ChecklistItemValue];
}
