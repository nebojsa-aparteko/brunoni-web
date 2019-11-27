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
}

type Port = {
  ID: string;
  HarbourName: string;
  Land: string;
};

export interface ItineraryItem {
  ArrivalDate?: string;
  DepartureDate?: string;
  Port: Port;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultOriginInfo extends ItineraryItem {
  DepartureDate: string;
  Port: Port;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultDestinationInfo extends ItineraryItem {
  ArrivalDate: string;
  Port: Port;
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
  Port: Port;
  VoyageInfo: RouteSearchResultVoyageInfo;
}

export interface RouteSearchResultDeadline {
  Typ: string;
  Time: string;
  AdditionalInfo: any;
}
