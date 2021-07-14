import Port from './Port';
import Carrier from './Carrier';
import { RouteSearchResult } from './route-search/RouteSearchResults';
import UserRecord, { UserRecordMin } from './UserRecord';
import { FreightDetailGroup } from './Booking';
import SpecialRemark from './SpecialRemark';
import Container from './Container';
import ContainerDetails from './ContainerDetails';
import Client from './Client';
import { Currency } from './Payment';
import { Object } from '../components/onlineBooking/MissingFields';

export enum VGMSubmittedBy {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}

export interface BookingRequest {
  id?: string;
  blNumber?: string;
  intBlNumber?: string;
  client?: Client;
  intraRefNumber?: string;
  vessel?: string;
  voyage?: string;
  origin?: Port;
  destination?: Port;
  carrier?: Carrier;
  quoteNumber?: number;
  quoteValidityPeriod?: { from: Date; to: Date };
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
  vgmSubmittedBy?: VGMSubmittedBy;
  archived?: boolean;
  hold?: boolean;
  leadingCurrency?: Currency;
  isScheduleChanged?: boolean;
}

export interface FreightDetail {
  Txt: string;
  Anz: number;
  UnitValue: number;
  Total?: number;
  Currency: string;
  Unit?: string;
  Group: FreightDetailGroup;
  Invoice: string;
  SeqNr: number;
  Internal1?: boolean;
}

export enum BookingRequestStatus {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
  ARCHIVED = 'Archived',
}

export enum ISOCodesEdiAlphacom {
  '22G1' = '22G0',
  '45G1' = '45G0',
  '42G1' = '42G0',
  '45R1' = '45R0',
}

export const BookingRequestLabels: Object = {
  blNumber: 'B/L-NO',
  intBlNumber: 'INTBL',
  customerReference: 'Customer ref.',
  client: 'Client',
  statClient: 'Statistic Client',
  carrier: 'Carrier',
  vessel: 'Vessel',
  schedule: 'Schedule',
  vgmSubmittedBy: 'VGM Submission By',
  assignedUser: 'Watcher (Assigned agent)',
  freightDetails: 'Freight details',
  quoteNumber: 'Quote Reference',
  containers: 'Container',
};
