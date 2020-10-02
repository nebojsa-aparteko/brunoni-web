export interface ChecklistItemValueDocument {
  uploadedBy: ActivityLogUserData;
  uploadedAt: Date;
  url: string;
  name: string;
  storedName: string;
  status?: ChecklistItemValueDocumentStatus;
  id: string;
  mentionCount?: number;
  isInternal?: boolean;
  final?: boolean;
  isSelected?: boolean;
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
  isInternal?: boolean;
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
  UNDO_COMPLETED_CUSTOMER = ' has unmarked done ',
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
  UNDO_COMPLETED_CUSTOMER,
}

export enum ChecklistNames {
  DEPOT_OUT = 'DEPOT_OUT',
  SOC_CERTIFICATE = 'SOC_CERTIFICATE',
  INVOICED = 'INVOICED',
  IMO = 'IMO',
  IMO_REQUESTED = 'IMO_REQUESTED',
  IMO_APPROVED = 'IMO_APPROVED',
  FINAL_DGD_SHEET = 'FINAL_DGD_SHEET_AND_DELIVERY_DETAILS',
  INFORMED_PORT = 'INFORMED_PORT',
  OOG = 'OOG',
  OOG_APPROVED = 'OOG_APPROVED',
  OOG_REQUESTED = 'OOG_REQUESTED',
  LASHING_CERTIFICATE = 'LASHING_CERTIFICATE',
  GATE_IN_TERMINAL = 'GATE_IN_TERMINAL',
  BHT_NUMBER_ISSUANCE = 'BHT_NUMBER_ISSUANCE',
  VGM_SUBMISSION = 'VGM_SUBMISSION',
  SHIPPING_INSTRUCTIONS = 'SHIPPING_INSTRUCTIONS',
  B_L = 'B/L',
  BL_DRAFT_CREATE = 'BL_DRAFT_CREATE',
  'BL_DRAFT_SENT ' = 'BL_DRAFT_SENT ',
  'BL_DRAFT_APPROVED ' = 'BL_DRAFT_APPROVED ',
  'FINAL_BL_COPY ' = 'FINAL_BL_COPY ',
  MANIFESTED = 'MANIFESTED',

  SHIPPED_ON_BOARD = 'SHIPPED_ON_BOARD',
  // import specific items
  BILL_OF_LADING = 'BILL_OF_LADING',
  'FREIGHT COLLECTION' = 'FREIGHT COLLECTION',
  RELEASE_DONE = 'RELEASE_DONE',
  PIN_NUMBER = 'PIN_NUMBER',
  GATE_OUT_TERMINAL = 'GATE_OUT_TERMINAL',
  DEPOT_IN = 'DEPOT_IN',
}
export enum ChecklistNamesPreview {
  DEPOT_OUT = 'DEPOT OUT',
  SOC_CERTIFICATE = 'SOC CERTIFICATE',
  INVOICED = 'INVOICED',
  IMO = 'IMO',
  IMO_REQUESTED = 'IMO REQUESTED',
  IMO_APPROVED = 'IMO APPROVED',
  FINAL_DGD_SHEET = 'FINAL DGD SHEET',
  INFORMED_PORT = 'INFORMED PORT',
  OOG = 'OOG',
  OOG_APPROVED = 'OOG APPROVED',
  OOG_REQUESTED = 'OOG REQUESTED',
  LASHING_CERTIFICATE = 'LASHING CERTIFICATE',
  GATE_IN_TERMINAL = 'GATE IN TERMINAL',
  BHT_NUMBER_ISSUANCE = 'BHT NUMBER ISSUANCE',
  VGM_SUBMISSION = 'VGM SUBMISSION',
  SHIPPING_INSTRUCTIONS = 'SHIPPING INSTRUCTIONS',
  B_L = 'B/L (Export)',
  BL_DRAFT_CREATE = 'BL DRAFT CREATE',
  'BL_DRAFT_SENT ' = 'BL DRAFT SENT ',
  'BL_DRAFT_APPROVED ' = 'BL DRAFT APPROVED ',
  'FINAL_BL_COPY ' = 'FINAL BL COPY ',
  MANIFESTED = 'MANIFESTED',

  SHIPPED_ON_BOARD = 'SHIPPED ON BOARD',
  // import specific items
  BILL_OF_LADING = 'BILL OF LADING (Import)',
  'FREIGHT COLLECTION' = 'FREIGHT COLLECTION',
  RELEASE_DONE = 'RELEASE DONE',
  PIN_NUMBER = 'PIN NUMBER',
  GATE_OUT_TERMINAL = 'GATE OUT TERMINAL',
  DEPOT_IN = 'DEPOT IN',
}
