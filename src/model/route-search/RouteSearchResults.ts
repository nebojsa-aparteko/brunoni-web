import Port from '../Port';

export default interface RouteSearchResults {
  Routes: RouteSearchResult[];
}

export interface RouteSearchResult {
  TransitTime: string;
  Service: string;
  Routing: string;
  SpaceInfo: string;
  SpaceInfoColor: string;
  idRequest: string;
  idRoute: string;
  OriginInfo: RouteSearchResultOriginInfo;
  DestinationInfo: RouteSearchResultDestinationInfo;
  IntermediatePortInfos: RouteSearchResultIntermediatePortInfo[];
  Deadlines: RouteSearchResultDeadline[];
}

export interface RouteSearchResultOriginInfo {
  DepartureDate: string;
  Port: Port;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultDestinationInfo {
  ArrivalDate: string;
  Port: Port;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultVoyageInfo {
  VesselName: string;
  VoyageNr: string;
  Carrier: string;
}

export interface RouteSearchResultIntermediatePortInfo {}

export interface RouteSearchResultDeadline {
  Typ: string;
  Time: string;
  AdditionalInfo: any;
}
