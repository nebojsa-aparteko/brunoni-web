import { update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';

interface PortTerm {
  id: string;
  port: string;
  lastUpdated: Date;
  address: string;
}

export const normalizePortTerm = (doc: any) => update('lastUpdated', safeInvoke('toDate'))(doc);

export default PortTerm;
