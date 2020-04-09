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
  ForwPersID: string;
  ETA: Date;
  extensions?: BookingExtension[];
  BkgCreateTimeStamp: Date;
  BkgAgentContactEml: string;
  BkgAgentContactTxt: string;
  BkgStatus: ExportShipmentStatusCode | ImportShipmentStatusCode | null;
  BkgStatusText: string;
  TimeStamp: Date;
  CargoDetails: CargoDetail[];
  FreightDetails: FreightDetail[];
  Category: BookingCategory;
  BkgAgentContact: string | null;
  ForwAdrId: string;
  ForwAdrCity: string;
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
}

export interface CheckListData {
  label: string;
  checked?: boolean;
  documents?: CheckListDocument[];
}

export interface CheckListDocument {
  isAdmin: boolean;
  url: string;
  name: string;
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
}

export interface CargoDetail {
  CommodityTXT: string;
  CargoDetailRermarks: string;
  CtrWeight: string;
  CtrQuantity: string;
  CommodityID: string;
  CtypID: string;
  LocRefs: LocRefs;
  IMCO: IMCO | null;
  Overdimension: CargoOverdimension | null;
}

export interface LocRefs {
  LocRef: LocRefItem[];
}

export interface LocRefItem {
  LocRef: string;
  LocDate: string;
  LocDet: string;
  LocType: BookingLocType;
  CargoDetailRermarks: string;
}

export enum BookingLocType {
  pickUp = 'PICK UP',
  delivery = 'DELIVERY',
}

export interface FreightDetail {
  Txt: string;
  Anz: string;
  UnitValue: string;
  Total: string;
  Currency: string;
  Unit: string;
}

export enum ShipperOwnedContainer {
  The20TK = '20TK',
  The20SO = '20SO',
  The40SO = '40SO',
  The40HS = '40HS',
  The20OS = '20OS',
  The20FS = '20FS',
  The40FS = '40FS',
}

export enum CargoOverdimension {
  Trigger = 'Yes',
}

export enum IMCO {
  Trigger = 'Yes',
}
