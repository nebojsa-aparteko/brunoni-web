import Client from './Client';
import { OpportunityCommodityGroup } from './OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from './OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from './OpportunityPlacesGroup';
import { OpportunityPortsGroup } from './OpportunityPortsGroup';
import { OpportunityTag } from './OpportunityTag';
import UserRecord from './UserRecord';

export interface Opportunity {
  id: string;
  sleasRep: UserRecord;
  bookingParty: Client;
  statClient?: string;
  kindOfQuote: string;
  placeOfReceiptGroupId?: OpportunityPlacesGroup;
  portOfLoadingGroupId?: OpportunityPortsGroup;
  portOfDischargeGroupId?: OpportunityPortsGroup;
  placeOfDeliveryGroupId?: OpportunityPlacesGroup;
  commodityGroupIds?: OpportunityCommodityGroup[];
  equipmentGroupIds?: OpportunityEquipmentGroup[];
  tags?: OpportunityTag[];
  potentialTEU: number;
  quotedTEU?: number;
  bookedTEU?: number;
}
