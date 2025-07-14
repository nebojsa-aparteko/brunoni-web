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
  shipper?: string;
  cosignee?: string;
  kindOfQuote: string;
  placeOfReceiptGroupId?: OpportunityPlacesGroup;
  portOfLoadingGroupId?: OpportunityPortsGroup;
  portOfDischargeGroupId?: OpportunityPortsGroup;
  placeOfDeliveryGroupId?: OpportunityPlacesGroup;
  commodityGroupIds?: OpportunityCommodityGroup[];
  equipmentGroupIds?: OpportunityEquipmentGroup[];
  tags?: OpportunityTag[];
  capacityTEU: number;
  quotedTEU?: number;
  bookedTEU?: number;
}
