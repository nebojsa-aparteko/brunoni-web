import Port from './Port';
import Carrier from './Carrier';
import { RouteSearchResult } from './route-search/RouteSearchResults';
import { QuoteDetail } from '../providers/QuoteGroupsProvider';
import { UserRecordMin } from './UserRecord';

export interface BookingRequest {
  id?: string;
  origin?: Port;
  destination?: Port;
  carrier?: Carrier;
  quoteNumber?: number;
  freightDetails?: QuoteDetail[];
  customerReference?: string;
  containers?: any[];
  additionalInfo?: string;
  imo?: boolean;
  soc?: boolean;
  createdAt?: Date;
  createdBy?: any;
  status: BookingRequestStatus;
  schedule?: RouteSearchResult;
  assignedTo?: UserRecordMin;
}

export enum BookingRequestStatus {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
}
