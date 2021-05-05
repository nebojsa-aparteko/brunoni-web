import Port from './Port';
import Carrier from './Carrier';
import { RouteSearchResult } from './route-search/RouteSearchResults';
import UserRecord, { UserRecordMin } from './UserRecord';
import { FreightDetail } from './Booking';
import SpecialRemark from './SpecialRemark';

export interface BookingRequest {
  id?: string;
  blNumber?: string;
  origin?: Port;
  destination?: Port;
  carrier?: Carrier;
  quoteNumber?: number;
  freightDetails?: FreightDetail[];
  customerReference?: string;
  agreementNo?: string;
  containers?: any[];
  additionalInfo?: string;
  specialRemarks?: SpecialRemark[];
  imo?: boolean;
  soc?: boolean;
  createdAt: Date;
  createdBy: UserRecord;
  status: BookingRequestStatus;
  schedule?: RouteSearchResult;
  assignedUser?: UserRecordMin;
  vgmSubmittedBy?: string | UserRecordMin;
  archived?: boolean;
}

export enum BookingRequestStatus {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
  ARCHIVED = 'Archived',
}
