import { UserRecordMin } from './UserRecord';
import { BookingCategory } from './Booking';

export default interface Task {
  id: string;
  type: TaskType;
  dueDate?: Date;
  assignedUser?: UserRecordMin;
  resolved: boolean;
  userRole: UserRole;
  show: boolean;
  manualResolve: ManualResolveType;
  taskCategory: TaskCategory;
  declineManualResolveAction?: TaskType;
  additionalInfo?: TaskAdditionalInfo;
  createAt?: Date;
  carrierId?: string;
  category?: BookingCategory;
  checklistId: string;
  checklistStageId?: string;
  bookingId: string;
  selected?: boolean;
}

export enum ManualResolveType {
  RESOLVE = 'RESOLVE',
  NO_MANUAL_RESOLVE = 'NO_MANUAL_RESOLVE',
  RESOLVE_OR_DECLINE = 'RESOLVE_OR_DECLINE',
}
export enum TaskCategory {
  OPERATIONS = 'OPERATIONS',
  ACCOUNTING = 'ACCOUNTING',
}

export enum UserRole {
  ADMIN,
  CLIENT,
}

export interface TaskAdditionalInfo {
  amsClosingDate?: Date;
  type: TaskAdditionalInfoType;
}

export enum TaskAdditionalInfoType {
  AMS_CLOSING = 'AMS_CLOSING',
}

export enum TaskAdditionalInfoTypeDescription {
  AMS_CLOSING = 'AMS Closing:',
}
export enum TaskType {
  // EXPORT TASKS
  DEPOT_OUT_MOVE = 'DEPOT_OUT_MOVE',
  DEPOT_OUT_CONTAINER_MOVE = 'DEPOT_OUT_CONTAINER_MOVE',
  GATE_IN_CHECK_CONTAINER = 'GATE_IN_CHECK_CONTAINER',
  B_BHT_ISSUANCE_GENERATED = 'B_BHT_ISSUANCE_GENERATED',
  VGM_SUBMISSION_ARRANGE = 'VGM_SUBMISSION_ARRANGE',
  VGM_SUBMISSION_SUBMITTED = 'VGM_SUBMISSION_SUBMITTED',
  SHIPPING_INSTRUCTIONS_CHECK = 'SHIPPING_INSTRUCTIONS_CHECK',
  SHIPPING_INSTRUCTIONS_SUBMITTED = 'SHIPPING_INSTRUCTIONS_SUBMITTED',
  SHIPPING_INSTRUCTION_CLOSING = 'SHIPPING_INSTRUCTION_CLOSING',
  B_L_DRAFT_CREATE = 'B_L_DRAFT_CREATE',
  B_L_DRAFT_SENT = 'B_L_DRAFT_SENT',
  B_L_DRAFT_APPROVE = 'B_L_DRAFT_APPROVE',
  B_L_FINAL_UPLOAD = 'B_L_FINAL_UPLOAD',
  OOG_OBTAIN_APPROVAL = 'OOG_OBTAIN_APPROVAL',
  OOG_CHECK_APPROVED = 'OOG_CHECK_APPROVED',
  IMO_OBTAIN_APPROVAL = 'IMO_OBTAIN_APPROVAL',
  IMO_CHECK_ACCEPTED = 'IMO_CHECK_ACCEPTED',
  IMO_FINAL_DGD_UPLOAD = 'IMO_FINAL_DGD_UPLOAD',
  SOC_CERTIFICATE_UPLOAD = 'SOC_CERTIFICATE_UPLOAD',
  SOC_CERTIFICATE_CHECK_UPLOAD = 'SOC_CERTIFICATE_CHECK_UPLOAD',
  LASHING_CERTIFICATE_UPLOAD = 'LASHING_CERTIFICATE_UPLOAD',
  LASHING_CERTIFICATE_CHECK_UPLOAD = 'LASHING_CERTIFICATE_CHECK_UPLOAD',
  CHECK_INVOICED = 'CHECK_INVOICED',
  SHIPMENT_LOADED = 'SHIPMENT_LOADED',

  // IMPORT TASKS
  B_L_SURRENDERED_UPLOAD = 'B_L_SURRENDERED_UPLOAD',
  RELEASE_DONE_ARRANGE = 'RELEASE_DONE_ARRANGE',
  PIN_NUMBER_ARRANGE = 'PIN_NUMBER_ARRANGE',
  GATE_OUT_TERMINAL_CHECK = 'GATE_OUT_TERMINAL_CHECK',
  DEM_DET_CHECK_CONTAINER = 'DEM_DET_CHECK_CONTAINER',
  DEPOT_IN_CHECK = 'DEPOT_IN_CHECK',
  FREIGHT_COLLECTION_CHECK = 'FREIGHT_COLLECTION_CHECK',

  // ACCOUNTING TASKS
  UPLOAD_INVOICE = 'UPLOAD_INVOICE',
  COMPARE_COSTS = 'COMPARE_COSTS',
  COMPARE_SYSTEMS = 'COMPARE_SYSTEMS',
  CORRECT_COMMISSION = 'CORRECT_COMMISSION',
  CHECK_FILE = 'CHECK_FILE',
}

export enum TaskDescription {
  // EXPORT TASKS
  DEPOT_OUT_MOVE = 'Please check DEPOT OUT move.',
  DEPOT_OUT_CONTAINER_MOVE = 'Please update container move.',
  GATE_IN_CHECK_CONTAINER = 'Please check if container is GATED IN.',
  B_BHT_ISSUANCE_GENERATED = 'Please ensure customs release is generated (B/BHT ISSUANCE).',
  VGM_SUBMISSION_ARRANGE = 'Please arrange VGM submission.',
  VGM_SUBMISSION_SUBMITTED = 'Please check if VGM is submitted.',
  SHIPPING_INSTRUCTIONS_CHECK = 'Please check if we have received Shipping Instruction.',
  SHIPPING_INSTRUCTIONS_SUBMITTED = 'Kindly submit Shipping Instruction.',
  SHIPPING_INSTRUCTION_CLOSING = 'Please provide Shipping Instruction due to AMS Closing.',
  B_L_DRAFT_CREATE = 'Please create a B/L draft and upload it in the checklist once done.',
  B_L_DRAFT_SENT = 'Please check if B/L draft has been sent to customer.',
  B_L_DRAFT_APPROVE = 'Please find enclosed B/L draft for inspection. Kindly check and approve it on the checklist.',
  B_L_DRAFT_APPROVE_CHECK = 'Please contact customer and ensure BL gets approved.',
  B_L_FINAL_UPLOAD = 'Please upload final B/L copy.',
  OOG_OBTAIN_APPROVAL = 'Please obtain OOG approval.',
  OOG_CHECK_APPROVED = 'Please check if OOG approval is in place.',
  IMO_OBTAIN_APPROVAL = 'Please obtain  IMO approval.',
  IMO_CHECK_ACCEPTED = 'Please check if IMO is accepted.',
  IMO_FINAL_DGD_UPLOAD = 'Please upload final DGD and inform the port.',
  SOC_CERTIFICATE_UPLOAD = 'Please upload SOC Certificate in the checklist.',
  SOC_CERTIFICATE_CHECK_UPLOAD = 'Please check and upload SOC Certificate in the system.',
  LASHING_CERTIFICATE_UPLOAD = 'Please upload Lashing Certificate  in the checklist.',
  LASHING_CERTIFICATE_CHECK_UPLOAD = 'Please check or upload Lashing Certificate  in the system.',
  CHECK_INVOICED = 'Please check why shipment is not invoiced.',
  SHIPMENT_LOADED = 'Please check if shipment is loaded. If not, please update sailing schedule.',

  // IMPORT TASKS
  B_L_SURRENDERED_UPLOAD = 'Please upload B/L Copy.',
  RELEASE_DONE_ARRANGE = 'Please arrange release.',
  PIN_NUMBER_ARRANGE = 'Please arrange PIN number and provide it to customer.',
  GATE_OUT_TERMINAL_CHECK = 'Please check if container is GATED OUT.',
  DEM_DET_CHECK_CONTAINER = 'Please check container on Demurrage and Storage.',
  DEPOT_IN_CHECK = 'Please check DEPOT IN move.',
  DEPOT_IN_CHECK_CONTAINER = 'Please check container on Demurrage and Detention.',
  FREIGHT_COLLECTION_CHECK = 'Please check if payment received and inform agent at destination.',

  // ACCOUNTING TASKS
  UPLOAD_INVOICE = 'Please upload and approve invoice from Shipping Line.',
  COMPARE_COSTS = 'Please compare and approve costs.',
  COMPARE_SYSTEMS = 'Please compare Commission and approve.',
  CORRECT_COMMISSION = 'Please correct commissioned amount.',
  CHECK_FILE = 'Please check this file, here is something wrong.',
}
