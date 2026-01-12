import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import { normalizeOpportunity } from '../providers/OpportunityProvider';
import { NormalizedOpportunity } from '../model/Opportunity';
import { useOpportunityDefinitionNormalizer } from '../components/opportunities/NormlizeOpportunityDefinitionsProvider';
import { useOpportunityCounters } from './useOpportunityCounters';

const useOpportunitiesWithSalesRep = (year?: number): NormalizedOpportunity[] | undefined => {
  const opportunitySnapshot = useFirestoreCollection('opportunities');

  const opportunityIds = useMemo(() => {
    if (!opportunitySnapshot?.docs) return [];
    return opportunitySnapshot.docs.map(doc => doc.id);
  }, [opportunitySnapshot?.docs]);

  const normalizator = useOpportunityDefinitionNormalizer();
  const counters = useOpportunityCounters(opportunityIds, year);

  return useMemo(() => {
    const defaultCounters = {
      booked: undefined,
      quoted: undefined,
      bookedTEU: undefined,
      quotedTEU: undefined,
    };

    return opportunitySnapshot?.docs?.map(doc =>
      normalizeOpportunity(
        normalizator.getUser,
        normalizator.getClient,
        normalizator.getPortsGroup,
        normalizator.getPlacesGroup,
        normalizator.getCommodityGroup,
        normalizator.getEquipmentGroup,
        normalizator.getTag,
        (id: string) => counters.get(id) ?? defaultCounters,
      )({ id: doc.id, ...doc.data() }),
    );
  }, [opportunitySnapshot?.docs, normalizator, counters]);
};

export default useOpportunitiesWithSalesRep;
