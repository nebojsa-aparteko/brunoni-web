import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import map from 'lodash/fp/map';
import filter from 'lodash/fp/filter';

export const normalizeOpportunity = (
  getUser: (id: string) => any,
  getClient: (id: string) => any,
  getPortsGroup: (id: string) => any,
  getPlacesGroup: (id: string) => any,
  getCommodityGroup: (id: string) => any,
  getEquipmentGroup: (id: string) => any,
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
    update('statisticalClientId', getClient),
    update('portOfLoadingGroupId', getPortsGroup),
    update('placeOfReceiptGroupId', getPlacesGroup),
    update('placeOfDeliveryGroupId', getPlacesGroup),
    update('portOfDischargeGroupId', getPortsGroup),
    update('commodityGroupId', getCommodityGroup),
    update('equipmentGroupId', getEquipmentGroup),
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
