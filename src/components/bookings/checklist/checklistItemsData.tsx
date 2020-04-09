import { CheckListDocument } from '../../../model/Booking';
export enum FieldType {
  CHECKMARK, // when item just needs to be confirmed that it has been done -- used mostly for customers
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
