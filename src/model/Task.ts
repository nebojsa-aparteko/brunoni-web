export default interface Task {}

export enum TaskType {
  // EXPORT TASKS
  DEPOT_OUT_MOVE,
  GATE_IN_CHECK_CONTAINER,
  B_BHT_ISSUANCE_GENERATED,
  VGM_SUBMISSION_ARRANGE,
  VGM_SUBMISSION_SUBMITTED,
  SHIPPING_INSTRUCTIONS_CHECK,
  B_L_DRAFT_CREATE,
  B_L_DRAFT_SENT,
  B_L_DRAFT_APPROVE,
  B_L_FINAL_UPLOAD,
  OOG_OBTAIN_APPROVAL,
  OOG_CHECK_APPROVED,
  IMO_OBTAIN_APPROVAL,
  IMO_CHECK_ACCEPTED,
  IMO_FINAL_DGD_UPLOAD,
  SOC_CERTIFICATE_UPLOAD,
  SOC_CERTIFICATE_CHECK_UPLOAD,
  LASHING_CERTIFICATE_UPLOAD,
  LASHING_CERTIFICATE_CHECK_UPLOAD,

  // IMPORT TASKS
  B_L_SURRENDERED_UPLOAD,
  RELEASE_DONE_ARRANGE,
  PIN_NUMBER_ARRANGE,
  GATE_OUT_TERMINAL_CHECK,
  DEPOT_IN_CHECK,
  FREIGHT_COLLECTION_CHECK,
}

export enum TaskDescription {
  // EXPORT TASKS
  DEPOT_OUT_MOVE = 'Please check DEPOT OUT move.',
  GATE_IN_CHECK_CONTAINER = 'Please check if container is GATED IN.',
  B_BHT_ISSUANCE_GENERATED = 'Please ensure customer release is generated (B/BHT ISSUANCE).',
  VGM_SUBMISSION_ARRANGE = 'Please arrange VGM submission.',
  VGM_SUBMISSION_SUBMITTED = 'Please check is VGM was submitted.',
  SHIPPING_INSTRUCTIONS_CHECK = 'Please check Shipping instruction.',
  B_L_DRAFT_CREATE = 'Please create B/L draft.',
  B_L_DRAFT_SENT = 'Please check if B/L draft has been sent.',
  B_L_DRAFT_APPROVE = 'Please find enclosed B/L draft of inspection and kindly approved on the checklist.',
  B_L_FINAL_UPLOAD = 'Please upload final B/L copy.',
  OOG_OBTAIN_APPROVAL = 'Please obtain OOG approval.',
  OOG_CHECK_APPROVED = 'Please check is OOG approval is in place.',
  IMO_OBTAIN_APPROVAL = 'Please obtain  IMO approval.',
  IMO_CHECK_ACCEPTED = 'Please check is IMO accepted.',
  IMO_FINAL_DGD_UPLOAD = 'Please upload final DGD and inform the port.',
  SOC_CERTIFICATE_UPLOAD = 'Please upload SOC in the checklist.',
  SOC_CERTIFICATE_CHECK_UPLOAD = 'Please check or upload SOC in the system.',
  LASHING_CERTIFICATE_UPLOAD = 'Please upload Lashing Certificate  in the checklist.',
  LASHING_CERTIFICATE_CHECK_UPLOAD = 'Please check or upload Lashing Certificate  in the system.',

  // IMPORT TASKS
  B_L_SURRENDERED_UPLOAD = 'Please upload document and check if B/L SURRENDERED  is ok.',
  RELEASE_DONE_ARRANGE = 'Please arrange release.',
  PIN_NUMBER_ARRANGE = 'Please arrange PIN number and provide it to customer.',
  GATE_OUT_TERMINAL_CHECK = 'Please check if container is GATED OUT.',
  DEPOT_IN_CHECK = 'Please check DEPOT IN move.',
  FREIGHT_COLLECTION_CHECK = 'Please check if payment received and inform agent at  destination.',
}
