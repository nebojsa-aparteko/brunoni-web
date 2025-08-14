import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import {
  OpportunityMatchDefinition,
  BookingQuoteMatchData,
  NormalizedBookingQuoteMatchData,
} from '../model/Opportunity';

export const normalizeOpportunityMatch = (
  getUser: (id: string) => any,
  getClient: (id: string) => any,
  getPortsGroup: (omd: OpportunityMatchDefinition) => any,
  getPlacesGroup: (omd: OpportunityMatchDefinition) => any,
  getCommodityGroup: (omd: OpportunityMatchDefinition) => any,
  getEquipmentGroup: (omd: OpportunityMatchDefinition) => any,
) => {
  const normalizeMatchDefinitionArray = (
    definitions: OpportunityMatchDefinition[],
    normalizer: (omd: OpportunityMatchDefinition) => any,
  ) => definitions.map(normalizer);

  const normalizeEntityMatchData = (
    entityMatchData: BookingQuoteMatchData,
  ): NormalizedBookingQuoteMatchData => ({
    bookingPartyId: getClient(entityMatchData.bookingPartyId),
    statisticalClientId: getClient(entityMatchData.statisticalClientId),
    agreementId: entityMatchData.agreementId,
    placeOfReceipt: normalizeMatchDefinitionArray(entityMatchData.placeOfReceipt, getPlacesGroup),
    portOfLoading: normalizeMatchDefinitionArray(entityMatchData.portOfLoading, getPortsGroup),
    portOfDischarge: normalizeMatchDefinitionArray(entityMatchData.portOfDischarge, getPortsGroup),
    placeOfDelivery: normalizeMatchDefinitionArray(entityMatchData.placeOfDelivery, getPlacesGroup),
    commodity: normalizeMatchDefinitionArray(entityMatchData.commodity, getCommodityGroup),
    equipment: normalizeMatchDefinitionArray(entityMatchData.equipment, getEquipmentGroup),
  });

  return flow(
    update('matchedBy', getUser),
    update('matchedAt', invoke('toDate')),
    update('entityMatchData', normalizeEntityMatchData),
  );
};
