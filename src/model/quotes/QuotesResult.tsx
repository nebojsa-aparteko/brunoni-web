export default interface QuotesResult {
  QuoteHeader: QuoteHeader[];
}

export interface QuoteHeaderNormalized {
  QuoteItems: QuoteItemNormalized[];
}

export interface QuoteItemNormalized {
  QuoteHeader: QuoteHeader;
  CargoDetail: CargoDetailCargoDetail[];
  Terms: TermTerm[];
  QuoteDetails: QuoteDetailQuoteDetail[];
  CostDetailsRemarks: CostDetailRemark[];
  Remarks: RemarkRemark[];
  ServiceDetail: ServiceDetailElement;
  TermsHeader: TermTerm[];
}

export interface QuoteHeader {
  AdrId: string;
  PersID: null | string;
  idRequest: null | string;
  idRoute: null | string;
  CarrierID: string;
  QuoteNumber: string;
  QuoteDate: string;
  QuoteValidity: string;
  POL: string;
  POD: string;
  CargoDetails: CargoDetail[] | CargoDetail;
  Terms: Term[] | Term;
  QuoteDetails: QuoteDetailsQuoteDetailClass[] | QuoteDetailsClass;
  CostDetailsRemarks: CostDetailsRemark[] | CostDetailsRemark | null;
  ServiceDetail: ServiceDetailElement[] | ServiceDetailElement;
  Remarks: RemarksRemarkClass[] | RemarksClass;
}

export interface CargoDetail {
  CargoDetail: CargoDetailCargoDetail[];
}

export interface CargoDetailCargoDetail {
  Quantity: string;
  CtypID: CtypID;
  CommodityID: string;
  PickupAdrID: null;
}

export enum CtypID {
  The22G1 = '22G1',
  The22R1 = '22R1',
  The42G1 = '42G1',
  The45G1 = '45G1',
}

export interface CostDetailsRemark {
  CostDetailRemark: CostDetailRemark[];
}

export interface CostDetailRemark {
  RemarkRef: RemarkRef;
  RemarkText: string;
}

export enum RemarkRef {
  The1 = '(1)',
  The2 = '(2)',
}

export interface QuoteDetailsQuoteDetailClass {
  QuoteDetail: QuoteDetailQuoteDetail[];
}

export interface QuoteDetailQuoteDetail {
  Pos: string;
  Description: string;
  Currency: Currency;
  CostValue: null | string;
  CostUnit: CostUnit | null;
  Remark: RemarkEnum | null;
  RemarkRef: RemarkRef | null;
}

export enum CostUnit {
  Pro20DC = "pro 20'DC",
  Pro20RF = "pro 20'RF",
  Pro40DC = "pro 40'DC",
  ProContainer = 'pro Container',
  ProSendung = 'pro Sendung',
  ProSet = 'pro Set',
  ProShipment = 'pro Shipment',
  ProTEU = 'pro TEU',
}

export enum Currency {
  Chf = 'CHF',
  Eur = 'EUR',
  Incl = 'incl.',
  Usd = 'USD',
}

export enum RemarkEnum {
  IfRequired = 'if required',
  VATOS = 'v.a.t.o.s',
}

export interface QuoteDetailsClass {
  QuoteDetail: QuoteDetailQuoteDetail[] | QuoteDetailQuoteDetail;
}

export interface RemarksRemarkClass {
  Remark: RemarkRemark[];
}

export interface RemarkRemark {
  RemarkTitle: RemarkTitle | null;
  Reefer: Reefer;
  RemarkLabel: RemarkLabel;
  RemarkText: string;
}

export enum Reefer {
  No = 'NO',
  Yes = 'YES',
}

export enum RemarkLabel {
  DetentionDemurrage = 'Detention/Demurrage',
  PluginBREMERHAVEN = 'Plugin BREMERHAVEN',
  RatesMentioned = 'Rates mentioned',
  StorageBREMERHAVENReefer = 'Storage BREMERHAVEN (Reefer)',
}

export enum RemarkTitle {
  FreeTimeAtOrigin = 'Free time at Origin',
}

export interface RemarksClass {
  Remark: RemarkRemark[] | RemarkRemark;
}

export interface ServiceDetailElement {
  Frequency: Frequency;
  Routing: Routing;
  TransitTime: string;
}

export enum Frequency {
  Weekly = 'Weekly',
}

export enum Routing {
  Direct = 'Direct',
  ViaALTAMIRA = 'Via ALTAMIRA',
  ViaCARTAGENA = 'Via CARTAGENA',
}

export interface Term {
  Term: TermTerm[];
}

export interface TermTerm {
  TermLabel: TermLabel | null;
  TermValue: TermValue;
  TermDetail: null | string;
  TermURL: null | string;
}

export enum TermLabel {
  TermsConditions = 'TERMS & CONDITIONS',
}

export enum TermValue {
  FclFclCyCy = 'FCL/FCL - CY/CY',
  FclFclCyDoor = 'FCL/FCL - CY/DOOR',
  FullLinerTerms = 'FULL LINER TERMS',
}
