export interface ChecklistItemValueDocument {
  uploadedBy: ActivityLogUserData;
  uploadedAt: Date;
  url: string;
  name: string;
  storedName: string;
  status?: ChecklistItemValueDocumentStatus;
}

export enum ChecklistItemValueDocumentStatusType {
  DEFAULT,
  APPROVED,
  REJECTED,
}

export interface ChecklistItemValueDocumentStatus {
  type: ChecklistItemValueDocumentStatusType;
  at?: Date;
  by?: ActivityLogUserData;
}

export interface ShortChecklistItemValueDocument {
  url: string;
  name: string;
  status?: ChecklistItemValueDocumentStatus;
}

export interface ActivityLogUserData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  alphacomClientId: string;
  alphacomId: string;
}
export interface Stage {
  id: string;
  checked?: boolean;
  label: string;
  by?: ActivityLogUserData;
  at?: Date;
  order: number;
}
export interface ChecklistItem {
  id: string;
  label: string;
  order: number;
  checked?: boolean;
  confirmedByCustomer?: {
    by: ActivityLogUserData;
    at: Date;
  };
  customerAction?: CustomerAction;
  values?: ChecklistItemValueDocument[];
  valuesAdmin?: ChecklistItemValueDocument[];
  stages: Stage[];
}

export enum CustomerChecklistActionType {
  markCompleted,
  uploadFile,
  fillForm,
}

export interface CustomerAction {
  id: string;
  action: CustomerChecklistActionType;
  stageId?: string;
  by?: ActivityLogUserData;
  at?: Date;
}

export interface ShortChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export enum ActivityText {
  CHECKED = ' has checked ',
  UNCHECKED = ' has unchecked ',
  ADD_FILE = ' has added file ',
  DELETE_FILE = ' has deleted file ',
  ADD_FILES = ' has added files ',
  DELETE_FILES = ' has deleted files ',
  DONE_BY_CUSTOMER = ' has marked done ',
  DEFAULTED_FILE = ' has undo changes on ',
  APPROVED_FILE = ' has approved ',
  REJECTED_FILE = ' has rejected ',
}

export enum ActivityChangeType {
  CHECKED,
  ADD_FILE,
  DELETE_FILE,
  STAGE_CHECKED,
  DOCUMENT_STATUS_CHANGED,
  DONE_BY_CUSTOMER,
}
