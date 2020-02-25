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
  CargoDetails: BookingCargoDetails;
  'BL-No': string;
}


export interface BookingCargoDetails {
  CommodityTXT: string;
  CargoDetailRermarks: string;
  CtrWeight: string;
  CtrQuantity: string;
}
