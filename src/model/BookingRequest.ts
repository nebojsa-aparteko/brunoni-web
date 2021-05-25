import Port from './Port';
import Carrier from './Carrier';
import { RouteSearchResult } from './route-search/RouteSearchResults';
import UserRecord, { UserRecordMin } from './UserRecord';
import { FreightDetail } from './Booking';
import SpecialRemark from './SpecialRemark';
import Container from './Container';
import ContainerDetails from './ContainerDetails';
import Client from './Client';
import { Currency } from './Payment';

export interface BookingRequest {
  id?: string;
  blNumber?: string;
  client?: Client;
  inttraRefNumber?: string;
  origin?: Port;
  destination?: Port;
  carrier?: Carrier;
  quoteNumber?: number;
  freightDetails?: FreightDetail[];
  customerReference?: string;
  agreementNo?: string;
  containers?: (Container & ContainerDetails)[];
  additionalInfo?: string;
  specialRemarks?: SpecialRemark[];
  imo?: boolean;
  soc?: boolean;
  createdAt: Date;
  createdBy?: UserRecord;
  status: BookingRequestStatus;
  schedule?: RouteSearchResult;
  assignedUser?: UserRecordMin;
  statClient?: Client | null;
  vgmSubmittedBy?: string | UserRecordMin;
  archived?: boolean;
  leadingCurrency?: Currency;
  isScheduleChanged?: boolean;
}

export enum BookingRequestStatus {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
  ARCHIVED = 'Archived',
}
