import Port from '../Port';
import Container from '../Container';
import ContainerDetails from '../ContainerDetails';

export default interface DetailedRouteSearchParams {
  originPort?: Port;
  destinationPort?: Port;
  date: Date;
  weeks: number;
  carrier?: string;
  containers: Array<Container & ContainerDetails>;
}
