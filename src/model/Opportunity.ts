// opportunities Firestore collection
export interface Opportunity {
  id: string;
  salesRepId: string; // User ID of the sales representative
  bookingPartyId: string; // Client is always Booking Party for Import & Export
  statisticalClientId: string; // Export = Shipper, Import = Consignee
  agreementId: string; // e.g. Contract ID
  quoteKind: string; // e.g. Spot, Tender, Project
  placeOfReceiptGroupId: string; // e.g. free text or group
  portOfLoadingGroupId: string; // e.g. ports + free text possibility
  portOfDischargeGroupId: string; // e.g. ports + free text possibility
  placeOfDeliveryGroupId: string; // e.g. free text or group
  commodityGroupId: string; // e.g. Food - Milkpowder, Fish, etc
  equipmentGroupId: string; // e.g. Tank - 22T2S, etc.
  tags: string[]; // e.g. Lost, Secured, Follow-up, Partial
  validity: Date; // user defined validity date
  note: string; // e.g. Free text note
  capacityTEU: number; // total capacity in number of TEU per year
  createdAt: Date;
  createdBy: string; // User ID of the creator
  updatedAt: Date;
  updatedBy: string; // User ID of the last updater
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
