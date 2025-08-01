import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import { OpportunityTag } from '../model/OpportunityTag';
import UserRecord from '../model/UserRecord';
import Client from '../model/Client';
import Port from './Port';
import ContainerType from './ContainerType';
export const QUOTE_KIND_OPTIONS = ['SPOT', 'QUARTERLY', 'TENDER'] as const;
export type QuoteKind = (typeof QUOTE_KIND_OPTIONS)[number];

export interface OpportunityMatchDefinition<T = string> {
  type: T; //'groupId' | 'portId' | 'containerTypeId' | 'freeText';
  value: string;
}

export interface Opportunity {
  id: string;
  opportunityId: string; // Auto generated counter
  salesRepId: string; // User ID of the sales representative
  bookingPartyId: string; // Client is always Booking Party for Import & Export
  statisticalClientId: string; // Export = Shipper, Import = Consignee
  agreementId: string; // e.g. Contract ID
  quoteKind: string; // e.g. Spot, Tender, Project
  placeOfReceipt: OpportunityMatchDefinition<'groupId' | 'freeText'>; // e.g. group or free text
  portOfLoading: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>; // e.g. group or port
  portOfDischarge: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>; // e.g. group or port
  placeOfDelivery: OpportunityMatchDefinition<'groupId' | 'freeText'>; // e.g. group or free text
  commodity: OpportunityMatchDefinition<'groupId' | 'freeText'>; // e.g. group or commodity
  equipment: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>; // e.g. group or container type
  tagIds: string[]; // e.g. Lost, Secured, Follow-up, Partial
  validity: Date; // user defined validity date
  note: string; // user note
  capacityTEU: number; // total capacity in number of TEU per year
  createdAt: Date;
  createdBy: string; // User ID of the creator
  updatedAt: Date;
  updatedBy: string; // User ID of the last updater
}

export interface OpportunityCounter {
  count: number;
  entity: 'booking' | 'quote';
  month: string;
  year: number;
  teuCount?: number;
}

export interface NormalizedOpportunity {
  id: string;
  opportunityId: string; // Unique identifier for the opportunity
  salesRepId: UserRecord | null; // Normalized user object or null
  bookingPartyId: Client | null; // Normalized client object or null
  bookingPartyRepId: UserRecord | null; // Normalized user object or null
  statisticalClientId: Client | null; // Normalized client object or null
  agreementId: string;
  quoteKind: string;
  placeOfReceipt: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null; // Normalized group object or null
  portOfLoading: {
    definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
    value: OpportunityPortsGroup | Port | string;
  } | null; // Normalized group object or null
  portOfDischarge: {
    definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
    value: OpportunityPortsGroup | Port | string;
  } | null; // Normalized group object or null
  placeOfDelivery: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null; // Normalized group object or null
  commodity: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityCommodityGroup | string;
  } | null; // Normalized group object or null
  equipment: {
    definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
    value: OpportunityEquipmentGroup | ContainerType;
  } | null; // Normalized group object or null
  tagIds: OpportunityTag[]; // Array of normalized tag objects
  validity: Date | null;
  note: string | null;
  capacityTEU: number | null; // Total capacity in number of TEU per year, or null if not set
  booked: number; // Sum of booking counts for current year
  quoted: number; // Sum of quote counts for current year
  bookedTEU: number; // Sum of TEU counts for bookings in current year
  quotedTEU: number; // Sum of TEU counts for quotes in current year
}

export interface OpportunityMatch {
  opportunityId: string;
  probability: number; // e.g. 0.8 for 80% probability
  reason: string; // e.g. "Similar commodity group"
  matchedAt: Date; // Timestamp of when the match was made
}

export enum OpportunityMatchEntity {
  Quote = 'quote',
  Booking = 'booking',
}

export enum OpportunityMatchStatus {
  Unmatched = 'unmatched',
  Matched = 'matched',
  Discarded = 'discarded',
}

export interface BookingQuoteMatchData {
  bookingPartyId: string;
  statisticalClientId: string;
  agreementId: string;
  placeOfReceipt: OpportunityMatchDefinition<'groupId' | 'freeText'>[];
  portOfLoading: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>[];
  portOfDischarge: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>[];
  placeOfDelivery: OpportunityMatchDefinition<'groupId' | 'freeText'>[];
  commodity: OpportunityMatchDefinition<'groupId' | 'freeText'>[];
  equipment: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>[];
}
export interface EntityOpportunityMatch {
  entity: OpportunityMatchEntity;
  entityId: string; // ID of the matched quote or booking
  year: number; // Entity year
  month: number; // Entity month
  bookingPartyId: string; // Booking party id, can't be changed but we need it for potential re-matching
  teuCount?: number; // TEUs for the matched entity, can be null if not applicable
  entityMatchData: BookingQuoteMatchData; // Data used for matching
  matches: OpportunityMatch[]; // List of matched opportunities
  opportunityId?: string; // ID of the opportunity, in case of single > 90% match
  status: OpportunityMatchStatus; // Status of the match
  matchedAt: Date; // Timestamp of when the match was created
  matchedBy: string; // User ID of the creator
}

export interface NormalizedBookingQuoteMatchData {
  bookingPartyId: Client;
  statisticalClientId: Client;
  agreementId: string;
  placeOfReceipt: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  }[];
  portOfLoading: {
    definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
    value: OpportunityPortsGroup | Port | string;
  }[];
  portOfDischarge: {
    definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
    value: OpportunityPortsGroup | Port | string;
  }[];
  placeOfDelivery: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  }[];
  commodity: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityCommodityGroup | string;
  }[];
  equipment: {
    definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
    value: OpportunityEquipmentGroup | ContainerType;
  }[];
}

export interface NormalizedEntityOpportunityMatch {
  entity: OpportunityMatchEntity;
  entityId: string; // ID of the matched quote or booking
  year: number; // Entity year
  month: number; // Entity month
  bookingPartyId: string; // Booking party id, can't be changed but we need it for potential re-matching
  teuCount?: number; // TEUs for the matched entity, can be null if not applicable
  entityMatchData: NormalizedBookingQuoteMatchData; // Data used for matching
  matches: OpportunityMatch[]; // List of matched opportunities
  opportunityId?: string; // ID of the opportunity, in case of single > 90% match
  status: OpportunityMatchStatus; // Status of the match
  matchedAt: Date; // Timestamp of when the match was created
  matchedBy: string; // User ID of the creator
}

export enum TaskStatus {
  Active = 'active',
  Resolved = 'resolved',
}
export interface OpportunityTask {
  opportunityId: string; // current opportunity
  createdAt: Date; // current date
  createdBy: string; // user id
  assignedTo: string; // user id
  status: TaskStatus; // ACTIVE, RESOLVED
  dueDate: Date; // due date (dd.MM.yyyyT00:00:00) swiss time, no hours
  //  "content1": string, // preselected text - POSTPONED, check with Nenad what are possible values
  content: string; // free text - check naming
}
