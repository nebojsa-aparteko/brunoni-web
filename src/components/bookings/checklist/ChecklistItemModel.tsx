import { Platform } from './ActivityModel';

export interface DocumentValue {
  uploadedBy: ActivityLogUserData | Platform;
  uploadedAt: Date;
  url: string;
  name: string;
  storedName: string;
  status?: DocumentValueStatus;
  mentionCount?: number;
  id: string;
}

export interface ChecklistItemValueDocument extends DocumentValue {
  isInternal?: boolean;
  final?: boolean;
  isSelectedForComparison?: boolean;
  checklistId?: string;
}

export enum ChecklistItemValueDocumentStatusType {
  DEFAULT,
  APPROVED,
  REJECTED,
}

export interface DocumentValueStatus {
  type: ChecklistItemValueDocumentStatusType;
  at?: Date;
  by?: ActivityLogUserData;
}

export interface ShortChecklistItemValueDocument {
  url: string;
  name: string;
  status?: DocumentValueStatus;
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
  documentsCount?: number;
  isInternal?: boolean;
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
  SELECT_FOR_COMPARISON = ' has selected ',
  UNSELECT_FOR_COMPARISON = ' has unselected ',
  MARK_AS_FINAL = ' has marked as final ',
  UNMARK_AS_FINAL = ' has marked as not final ',
  POSTPONE_PAYMENT = ' has postponed payment ',
  APPROVE_PAYMENT = ' has approved payment ',
  REVERT_PAYMENT_APPROVAL = ' has reverted the approval of payment ',
  PUT_ON_HOLD = ' has put on hold payment ',
  REVERT_PUT_ON_HOLD = ' has reverted the "On Hold" status of payment ',
  SET_WATCHING = ' has started watching this booking.',
  UNSET_WATCHING = ' has stopped watching this booking.',
  ASSIGNED_AGENT = ' has assigned agent ',
  ASSIGNED_CLIENT = ' has assigned client ',
  ASSIGNED_ON_TASK = ' has assigned ',
  SET_WATCHERS = ' has ',
  CLEAR_PAYMENT = ' has cleared payment ',
  REVERT_CLEAR_PAYMENT = ' has reverted the clearing of payment ',
  MARK_SOMETHING_WRONG = ' has marked that something is wrong with payment ',
  ARCHIVED = ' has archived booking request.',
  UNARCHIVED = ' has unarchived booking request.',
  EDITED = ' has edited these following fields: ',
}

export enum ActivityChangeType {
  CHECKED,
  ADD_FILE,
  DELETE_FILE,
  STAGE_CHECKED,
  DOCUMENT_STATUS_CHANGED,
  DONE_BY_CUSTOMER,
  UNDO_COMPLETED_CUSTOMER,
  SELECT_FOR_COMPARISON,
  UNSELECT_FOR_COMPARISON,
  MARK_AS_FINAL,
  UNMARK_AS_FINAL,
  POSTPONE_PAYMENT,
  APPROVE_PAYMENT,
  REVERT_PAYMENT_APPROVAL,
  PUT_ON_HOLD,
  REVERT_PUT_ON_HOLD,
  SET_WATCHING,
  UNSET_WATCHING,
  ASSIGNED_AGENT,
  ASSIGNED_CLIENT,
  SET_WATCHERS,
  CLEAR_PAYMENT,
  REVERT_CLEAR_PAYMENT,
  MARK_SOMETHING_WRONG,
  ARCHIVED,
  UNARCHIVED,
  EDITED,
  ASSIGNED_ON_TASK,
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
  B_L = 'B_L',
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
