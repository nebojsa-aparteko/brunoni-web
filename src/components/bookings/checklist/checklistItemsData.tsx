import { CheckListDocument } from '../../../model/Booking';
export enum FieldType {
  BASIC,
  FILE,
  TEXT,
}

export interface ChecklistItemValue {
  type: FieldType;
  text?: string;
  checked?: boolean;
  files?: CheckListDocument[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked?: boolean;
  valueCustomer?: ChecklistItemValue;
  valueAdmin?: ChecklistItemValue;
}
