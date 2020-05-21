export interface ChecklistItemValueDocument {
  uploadedBy: ActivityLogUserData;
  uploadedAt: Date;
  url: string;
  name: string;
  storedName: string;
  status?: ChecklistItemValueDocumentStatus;
  id: string;
  mentionCount?: number;
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
  mentionCount?: number;
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
  REJECTED_FILE = ' has sent on revision ',
}

export enum ActivityChangeType {
  CHECKED,
  ADD_FILE,
  DELETE_FILE,
  STAGE_CHECKED,
  DOCUMENT_STATUS_CHANGED,
  DONE_BY_CUSTOMER,
}

export enum ChecklistNames {
  DEPOT_OUT = 'DEPOT_OUT',
  SOC_CERTIFICATE = 'SOC_CERTIFICATE',
  INVOICED = 'INVOICED',
  IMO = 'IMO',
  OOG = 'OOG',
  LASHING_CERTIFICATE = 'LASHING_CERTIFICATE',
  GATE_IN_TERMINAL = 'GATE_IN_TERMINAL',
  BHT_NUMBER_ISSUANCE = 'BHT_NUMBER_ISSUANCE',
  VGM_SUBMISSION = 'VGM_SUBMISSION',
  SHIPPING_INSTRUCTIONS = 'SHIPPING_INSTRUCTIONS',
  B_L = 'B/L',
  SHIPPED_ON_BOARD = 'SHIPPED_ON_BOARD',
  // import specific items
  BILL_OF_LANDING_SURRENDERED = 'BILL_OF_LANDING_SURRENDERED',
  FREIGHT_COLLECTION = 'FREIGHT COLLECTION',
  RELEASE_DONE = 'RELEASE_DONE',
  PIN_NUMBER = 'PIN_NUMBER',
  GATE_OUT_TERMINAL = 'GATE_OUT_TERMINAL',
  DEPOT_IN = 'DEPOT_IN',
}
