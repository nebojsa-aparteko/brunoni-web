// import CountryCodes from '../CountryCodes';
// import { Currency } from '../Payment';

// todo. Continue
export interface RouteSearchResult {
  id: number;
  tariffReference: string;
  validFrom: string;
  validTo: string;
  fromGeoUnit: string;
  status: string;
  tliNo: string;
  relType: string;
  fromCountry: string;
  fromState: string;
  fromLocationName: string;
  viaFacility?: string;
  toCountry: string;
  toState?: string;
  toLocationName: string;
  tradeShortName?: string;
  transportMode: string;
  weightRange: string;
  equipmentSize: string;
  equipmentGroup: string;
  rate: string;
  currency: string;
  float: boolean;
  negot: boolean;
  fmc: boolean;
  tliEffDate: string;
  tliExpDate: string;
  remarks: string;
  provider: string;
}

// export enum RouteStatus {
//   FINAL = 'FINAL'
// }

// export enum RelType {
//   CL = 'C-L'
// }
