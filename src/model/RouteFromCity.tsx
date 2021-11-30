import City from './City';
import Port from './Port';

export default interface RouteFromCity extends City {
  distance: number;
  portOfLoading?: Port;
  transportModus?: string;
}
