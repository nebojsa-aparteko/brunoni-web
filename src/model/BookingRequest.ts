import Port from './Port';
import Carrier from './Carrier';
import { ItineraryItem, RouteSearchResult } from './route-search/RouteSearchResults';
import UserRecord, { UserRecordMin } from './UserRecord';
import { FreightDetailGroup } from './Booking';
import SpecialRemark from './SpecialRemark';
import Container from './Container';
import ContainerDetails from './ContainerDetails';
import Client from './Client';
import { Currency } from './Payment';
import { Object } from '../components/onlineBooking/MissingFields';
import { QuoteDetail } from '../providers/QuoteGroupsProvider';

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
  freightDetails?: FreightDetail[];
  quoteDetails?: QuoteDetail[];
  customerReference?: string;
  agreementNo?: string;
  containers?: (Container & ContainerDetails)[];
  additionalInfo?: string;
  specialRemarks?: SpecialRemark[];
  imo?: boolean;
  soc?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserRecord;
  statusCode: BookingRequestStatusCode;
  statusText: BookingRequestStatusText;
  schedule?: RouteSearchResult;
  assignedUser: UserRecordMin | null;
  statClient?: Client | null;
  vgmSubmittedBy?: VGMSubmittedBy;
  hold: boolean;
  leadingCurrency?: Currency;
  isScheduleChanged?: boolean;
  itinerary?: BookingRequestItinerary | null;
  checklistCheckedCount: number;
  checklistItemCount: number;
  checklistCheckedCountCustomer: number;
  checklistItemCountCustomer: number;
  pinnedCommentsCount?: number;
  bookingId?: string;
  showWarningMessage?: boolean;
  assignedTags?: string[];
  isUnread?: boolean;
}

export interface BookingRequestItinerary {
  portOfLoading: ItineraryItem;
  portOfDischarge: ItineraryItem;
  placeOfReceipt?: ItineraryItem;
  finalDestinationPort?: ItineraryItem;
}

export enum BookingRequestStatusCode {
  REQUESTED = 10,
  IN_PROGRESS = 20,
  CONFIRMED = 30,
  ARCHIVED = 40,
}

export enum BookingRequestStatusText {
  REQUESTED = 'Requested',
  IN_PROGRESS = 'In Progress',
  CONFIRMED = 'Confirmed',
  ARCHIVED = 'Archived',
}

export enum ISOCodesEdiAlphacom {
  '20G0' = '22G1',
  '22G0' = '22G1',
  '45G0' = '45G1',
  '42G0' = '42G1',
  '42R1' = '45R1',
  '45R0' = '45R1',
}

export const BookingRequestLabels: Object = {
  agreementNo: 'Agreement No.',
  blNumber: 'B/L-NO',
  intBlNumber: 'INTBL',
  intraRefNumber: 'INTTRA Ref.',
  customerReference: 'Customer ref.',
  client: 'Client',
  statClient: 'Statistic Client',
  carrier: 'Carrier',
  vessel: 'Vessel',
  voyage: 'VOY. ',
  schedule: 'Schedule',
  vgmSubmittedBy: 'VGM Submission By',
  assignedUser: 'Watcher (Assigned agent)',
  freightDetails: 'Freight details',
  quoteNumber: 'Quote Reference',
  containers: 'Container',
};

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
  isManual?: boolean;
}

export const commissionRelatedFreights = ['Seafreight', 'Seefracht', 'Fret Maritime'];

export const emptyFreightDetail: Partial<FreightDetail> = { Currency: 'USD', UnitValue: 0, Unit: '', Total: 0, Anz: 0 };
