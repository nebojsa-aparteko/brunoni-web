import Port from './Port';
import Carrier from './Carrier';
import { RouteSearchResult } from './route-search/RouteSearchResults';
import { UserRecordMin } from './UserRecord';
import { FreightDetail } from './Booking';

export interface BookingRequest {
  id?: string;
  blNumber?: string;
  origin?: Port;
  destination?: Port;
  carrier?: Carrier;
  quoteNumber?: number;
  freightDetails?: FreightDetail[];
  customerReference?: string;
  containers?: any[];
  additionalInfo?: string;
  specialRemarkId?: string;
  specialRemarkText?: string;
  imo?: boolean;
  soc?: boolean;
  createdAt?: Date;
  createdBy?: any;
  status: BookingRequestStatus;
  schedule?: RouteSearchResult;
  assignedUser?: UserRecordMin;
  archived?: boolean;
}

export enum BookingRequestStatus {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
  ARCHIVED = 'Archived',
}
