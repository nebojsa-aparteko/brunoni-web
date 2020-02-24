export interface Booking {
  id: string;
  CarrierID: string;
  Vessel: string;
  Voyage: string;
  PlaceOfRecieptName: string;
  ETS: string;
  FinalDestinationName: string;
  ETA: string;
  BkgStatus?: string;
  TimeStamp: string;
}
