export default interface ClientPerformanceData {
  idStat_011: IDStat011;
}

export interface IDStat011 {
  AdrID: string;
  Statistics: Statistic[];
}

export interface Statistic {
  StatisticType: string;
  Carriers: Carriers;
}

export interface Carriers {
  Carrier: string;
  Data: Datum[];
}

export interface Datum {
  '@year.month': string;
  Year: string;
  Month: string;
  Details: Detail[] | Detail;
}

export interface Detail {
  Transport: Transport;
  LocationType: LocationType | null;
  LocationCode: null | string;
  Unit: Unit | null;
  Amount: string;
}

export enum LocationType {
  Pod = 'POD',
  Pol = 'POL',
}

export enum Transport {
  Import = 'Import',
}

export enum Unit {
  Teu = 'TEU',
  The22G1 = '22G1',
  The42G1 = '42G1',
  The45G1 = '45G1',
}
