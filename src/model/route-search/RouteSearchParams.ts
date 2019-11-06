import Port from '../Port';

export default interface RouteSearchParams {
  originPort?: Port;
  destinationPort?: Port;
  date: Date;
  weeks: number;
  carrier?: string;
}
