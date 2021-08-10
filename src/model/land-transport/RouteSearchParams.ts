import Container from '../Container';

export default interface LandTransportRouteSearchParams {
  from: string;
  to: string;
  earliestDate: Date;
  transportMode: string;
  containers?: Container[];
}
