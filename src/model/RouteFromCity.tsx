import Port from './Port';
import Destination from './land-transport/Destination';

export default interface RouteFromCity extends Destination {
  distance: number;
  portOfLoading?: Port;
  transportMode?: string;
}
