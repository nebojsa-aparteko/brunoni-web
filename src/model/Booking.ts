import { UserRecordMin } from './UserRecord';

export interface Booking {
  id: string;
  CarrierID: string;
  Vessel: string;
  Voyage: string;
  PlaceOfRecieptName: string;
  PlaceOfReceiptETS: Date;
  FinalDestinationETA: Date;
  ETS: Date;
  FinalDestinationName: string;
  ForwPersID?: string;
  ETA: Date;
  extensions?: BookingExtension[];
  BkgAgentContactEml: string;
  BkgAgentContactTxt: string;
  BkgStatus: ExportShipmentStatusCode | ImportShipmentStatusCode | null;
  BkgStatusText: string;
  TimeStamp: Date;
  CargoDetails: CargoDetail[];
  FreightDetails: FreightDetail[];
  Category: BookingCategory;
  CtrTariffsDetails: CtrTariffDetail[];
  Agreement: string | null;
  StatClientRef: string | null;
  BkgAgentContact?: string;
  ForwAdrId: string;
  ForwAdrCity: string;
  ForwAdrName: string;
  ForwarderPersTxt: string | null;
  PlaceOfRecieptISO: string;
  POL: string;
  POLName: string;
  POD: string;
  PODName: string;
  FinalDestinationISO: string;
  checklists?: CheckListData[] | undefined;
  DepotOut?: string;
  ShippedOnBoard?: string;
  Invoiced?: string;
  GateIn?: string;
  PortTerms: PortTerms;
  Remarks: Remark[];
  Version: BookingVersion;
  'ERP-BkgRef': string;
  'ERP-CarrierID': string;
  'ERP-ServiceID': string;
  'Carrier-BkgRef': string | null;
  'Cust-BkgRef': string;
  'BL-No': string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  pendingPayment: boolean;
  alerts: AlertType[];
  inDispute?: boolean;
  checklistCheckedCount: number;
  checklistItemCount: number;
  watchers: UserRecordMin[];
  assignedUser: UserRecordMin;
  assignedCustomerUser: UserRecordMin;
}

export interface CheckListData {
  label: string;
  checked?: boolean;
  documents?: StoredDocument[];
}

export interface StoredDocument {
  isAdmin: boolean;
  url: string;
  name: string;
  storedName: string;
}

export interface BookingExtension {
  id: string;
  statusText: string;
  checked: boolean;
  documents: BookingDocument[];
}

export interface BookingDocument {
  isAdmin: boolean;
  url: string;
}

export enum StatusExport {
  DepotOut = 'DEPOT OUT',
  SocCertificate = 'SOC CERTIFICATE',
  OogRequested = 'OOG REQUESTED',
  OogApproved = 'OOG APPROVED',
  ImoRequested = 'IMO REQUESTED',
  ImoApproved = 'IMO APPROVED',
  FinalDgdSheetAndDeliveryDetails = 'FINAL DGD SHEET AND DELIVERY DETAILS',
  tankCertificate = 'TANK CERTIFICATE',
  GateInTerminal = 'GATE IN TERMINAL',
  VgmSubmission = 'VGM SUBMISSION',
  ShippingInstructions = 'SHIPPING INSTRUCTIONS',
  BlDraftSent = 'B/L DRAFT SENT',
  BlDraftApproved = 'B/L DRAFT APPROVED',
  ShippedOnBoard = 'SHIPPED ON BOARD',
  FinalBlCopy = 'FINAL B/L COPY',
  Invoiced = 'INVOICED',
  BhtNumberIssuance = 'B/BHT NUMBER ISSUANCE',
  Other = 'OTHER',
}

export enum StatusImport {
  BillOfLandingSurrendered = 'BILL OF LANDING SURRENDERED',
  ReleaseDone = 'RELEASE DONE',
  PinNumber = 'PIN NUMBER',
  GateOutTerminal = 'GATE OUT TERMINAL',
  DepotIn = 'DEPOT IN',
  Invoiced = 'INVOICED',
  Other = 'OTHER',
}

export enum BookingCategory {
  Import = 'Import',
  Export = 'Export',
}

export enum ExportShipmentStatusCode {
  Status10 = '10',
  Status20 = '20',
  Status30 = '30',
  Status40 = '40',
}

export enum ImportShipmentStatusCode {
  Status1 = '1',
  Status2 = '2',
  Status3 = '3',
  Status4 = '4',
}

export interface BookingStatus {
  [key: string]: string;
}

export enum BookingVersion {
  long = 'Long',
  short = 'Short',
}

export interface Remark {
  RemarkSeq: number;
  RemarkTxt: string;
  RemarkType: string;
}

export interface PortTerms {
  Closings: Closing[];
  FOBDeliveryBy: string;
  LinerPortAgent: string;
  RelevantPort: string;
  VGMSubmByID: string;
  VGMSubmByTxt: string;
}

export interface Closing {
  ClosingDate: string;
  ClosingTime: string;
  ClosingTxt: string;
  ClosingType: string;
  ClosingDateObject: Date;
}

export interface CargoDetail {
  CommodityTXT: string;
  CargoDetailRermarks: string;
  CtrWeight: string;
  CtrQuantity: string;
  CommodityID: string;
  CtypID: string;
  Equipment: EquipmentDetail[];
  LocRefs: LocRefItem[];
  Temperature: string | null;
  Dehumidification: string | null;
  Ventilation: string | null;
  IMCO: IMCO | null;
  IMCOs: IMCOField[] | null;
  Overdimension: CargoOverdimension | null;
  Overwidth: string | null;
  Overheight: string | null;
  Overlength: string | null;
  PINNr: string | null;
  Stock: string | null;
  DropOffRef: string | null;
  DemDetTariff: string;
  PluginTariff: string;
  StorageTariff: string;
  'VGM-PIN': string;
}

export interface EquipmentDetail {
  ContainerNumber: string | null;
  CtypID: string | null;
  DropOffDate: string | null;
  GateInDate: string | null;
  GateOutDate: string | null;
  PickUpDate: string | null;
  CtrTariffs: CtrTariff[] | null;
  PINNr: string;
}

export interface CtrTariff {
  Amount: string | null;
  Days: string | null;
  ID: string | null;
  Type: CtrTariffType;
}

export interface CtrTariffDetail {
  DaysFree: string | null;
  ID: string | null;
  Txt: string | null;
  Type: CtrTariffType;
}

export enum CtrTariffType {
  DemDet = 'DEM/DET',
  Storage = 'STORAGE',
  PlugIn = 'PLUGIN',
}

export interface LocRefItem {
  LocRef: string;
  LocDate: string;
  LocDet: string;
  LocID: string;
  LocType: BookingLocType;
  CargoDetailRermarks: string;
}

export enum BookingLocType {
  pickUp = 'PICK UP',
  delivery = 'DELIVERY',
  dropOff = 'DROP OFF',
  gateOut = 'GATE OUT',
}

export interface FreightDetail {
  Txt: string;
  Anz: string;
  UnitValue?: string;
  Total?: string;
  Currency: string;
  Unit?: string;
  Group: FreightDetailGroup;
  Invoice: string;
  SeqNr: string;
  Internal1?: boolean;
}

export enum FreightDetailGroup {
  EXTERNAL = 'external',
  INTERNAL1 = 'internal1',
  INTERNAL2 = 'internal2',
}

export enum ShipperOwnedContainer {
  The20TK = '22T2S',
  The20SO = '22G1S',
  The40SO = '42G1S',
  The40HS = '45G1S',
  The20OS = '22U1S',
  The20FS = '22P1S',
  The40FS = '42P1S',
}

export enum CargoOverdimension {
  Trigger = 'Yes',
}

export enum IMCO {
  Trigger = 'Yes',
}
export interface IMCOField {
  IMOClass: string;
  UNNumber: string;
  PackingNumber: string;
  FlashPoint: string;
}

export enum CarrierId {
  ALIANCA = 'ALIANCA',
  HAMBURG_SUD = 'Hamburg Süd',
  ZIM = 'ZIM',
  DEUTSCHE_AFRIKA = 'DAL',
  MACS = 'MACS',
  HMM = 'HMM',
  HSG = 'HSG',
  SLOM = 'SLOM',
  STNN = 'STNN',
  UAL = 'UAL',
}

export enum AlertType {
  DEPOT_OUT_PICK_UP,
  VGM,
  INVOICED,
  GATE_OUT,
  FREIGHT,
  S_I,
}
