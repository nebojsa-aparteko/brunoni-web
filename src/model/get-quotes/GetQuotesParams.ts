import Port from '../Port';
import { Container } from './Container';

export default interface GetQuotesParams {
  originPort?: Port;
  destinationPort?: Port;
  date: Date;
  weeks: number;
  containers: Container[];
}
