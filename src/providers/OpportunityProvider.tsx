import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';
import { OpportunityMatchDefinition } from '../model/Opportunity';
export const normalizeOpportunity = (
  getUser: (id: string) => any,
  getClient: (id: string) => any,
  getPortsGroup: (omd: OpportunityMatchDefinition) => any,
  getPlacesGroup: (omd: OpportunityMatchDefinition) => any,
  getCommodityGroup: (omd: OpportunityMatchDefinition) => any,
  getEquipmentGroup: (omd: OpportunityMatchDefinition) => any,
  getTag: (id: string) => any,
  getCounters: (id: string) => {
    booked: number;
    bookedTEU?: number;
    quoted: number;
    quotedTEU?: number;
  },
) =>
  flow(
    update('salesRepId', getUser),
    update('bookingPartyId', getClient),
    update('bookingPartyRepId', getUser),
    update('statisticalClientId', getClient),
    update('portOfLoading', getPortsGroup),
    update('placeOfReceipt', getPlacesGroup),
    update('placeOfDelivery', getPlacesGroup),
    update('portOfDischarge', getPortsGroup),
    update('commodity', getCommodityGroup),
    update('equipment', getEquipmentGroup),
    update('tagIds', map(getTag)),
    update('validity', invoke('toDate')),
    update('createdAt', invoke('toDate')),
    update('updatedAt', invoke('toDate')),
    update('tagIds', filter(Boolean)),
    (opportunity: any) => ({
      ...opportunity,
      ...getCounters(opportunity.id),
    }),
  );
