import Container from '../Container';

export default interface RouteSearchParams {
  from: string;
  to: string;
  earliestDate: Date;
  transportMode: string;
  containers?: Container[];
}
