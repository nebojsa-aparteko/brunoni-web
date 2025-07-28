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
  placeOfReceipt: OpportunityPlacesGroup | string | null; // Normalized group object or null
  portOfLoading: OpportunityPortsGroup | Port | string | null; // Normalized group object or null
  portOfDischarge: OpportunityPortsGroup | Port | string | null; // Normalized group object or null
  placeOfDelivery: OpportunityPlacesGroup | string | null; // Normalized group object or null
  commodity: OpportunityCommodityGroup | string | null; // Normalized group object or null
  equipment: OpportunityEquipmentGroup | ContainerType | null; // Normalized group object or null
  tagIds: OpportunityTag[]; // Array of normalized tag objects
  validity: Date;
  note: string;
  capacityTEU: number;
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

// opportunity-matches Firestore collection
export interface EntityOpportunityMatch {
  entity: OpportunityMatchEntity;
  entityId: string; // ID of the matched quote or booking
  bookingPartyId: string; // Booking party id, can't be changed but we need it for potential re-matching
  matches: OpportunityMatch[]; // List of matched opportunities
  opportunityId?: string; // ID of the opportunity, in case of single > 90% match
  status: OpportunityMatchStatus; // Status of the match
  createdAt: Date; // Timestamp of when the match was created
  createdBy: string; // User ID of the creator
  updatedAt: Date; // Timestamp of when the match was last updated
  updatedBy: string; // User ID of the last updater
}
