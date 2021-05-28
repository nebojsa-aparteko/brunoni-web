export enum ItemType {
  Origin = 'origin',
  Intermediate = 'intermediate',
  Destination = 'destination',
}

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
  ComAmountE1?: string;
  ComAmountE2?: string;
  ComCurE1?: string;
  ComCurE2?: string;
  ComPercentE?: string;
}

export type SearchResultsPort = {
  ID: string;
  HarbourName: string;
  Land: string;
  PortName: string;
  PortAgent: string;
  TerminalID?: string;
};

export interface ItineraryItem {
  ArrivalDate?: string;
  DepartureDate?: string;
  Port: SearchResultsPort;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultOriginInfo extends ItineraryItem {
  DepartureDate: string;
  Port: SearchResultsPort;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultDestinationInfo extends ItineraryItem {
  ArrivalDate: string;
  Port: SearchResultsPort;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultVoyageInfo {
  VesselName: string;
  VoyageNr: string;
  Carrier: string;
}

export interface RouteSearchResultIntermediatePortInfo extends ItineraryItem {
  ArrivalDate: string;
  DepartureDate: string;
  Port: SearchResultsPort;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultDeadline {
  Typ: string;
  Time: string;
  AdditionalInfo: any;
}
