export default interface BookingsCollection {
  bookings: Booking[];
}

export interface Booking {
  id: string;
  CarrierID: string;
  Vessel: string;
  Voyage: string;
  PlaceOfRecieptName: string;
  ETS: string;
  FinalDestinationName: string;
  ETA: string;
  BkgStatus: string | null;
  TimeStamp: string;
  CargoDetails: CargoDetailItems;
  FreightDetails: {
    FreightDetail: FreightDetail[]
  };
  Category: string;
  BkgAgentContact: string | null;
  ForwAdrId: string;
  clientName?: string;
  PlaceOfRecieptISO: string;
  POL: string;
  POLName: string;
  POD: string;
  PODName: string;
  FinalDestinationISO: string;
  PortTerms: PortTerms;
  Remarks: {
    Remark: Remark[];
  };
  Version: BookingVersion;
  'ERP-BkgRef': string;
  'Carrier-BkgRef': string | null;
  'Cust-BkgRef': string;
  'BL-No': string;
}

export enum BookingVersion {
  long = 'Long',
  short = 'Short',
}

export interface Remark {
  RemarkTxt: string;
  RemarkType: string;
}

export interface PortTerms {
  Closings: {
    Closing: Closing[];
  };
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

export interface CargoDetailItems {
  CargoDetail: CargoDetail | CargoDetail[];
}

export interface CargoDetail {
  CommodityTXT: string;
  CargoDetailRermarks: string;
  CtrWeight: string;
  CtrQuantity: string;
  CommodityID: string;
  CtypID: CtypID;
  LocRefs: LocRefs;
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
}

export enum CtypID {
  The22G1 = '22G1',
  The22R1 = '22R1',
  The42G1 = '42G1',
  The45G1 = '45G1',
}
