import Port from '../Port';
import Container from '../Container';

export default interface DetailedRouteSearchParams {
  originPort?: Port;
  destinationPort?: Port;
  date: Date;
  weeks: number;
  carrier?: string;
  containers: Container[];
}
