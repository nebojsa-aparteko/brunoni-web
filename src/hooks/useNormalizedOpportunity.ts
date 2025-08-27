import { useMemo } from 'react';

import { useOpportunityCounters } from './useOpportunityCounters';
import { useOpportunityDefinitionNormalizer } from '../components/opportunities/NormlizeOpportunityDefinitionsProvider';
import { normalizeOpportunity } from '../providers/OpportunityProvider';

const useNormalizedOpportunity = (opportunityIds: string[]) => {
  const counters = useOpportunityCounters(opportunityIds);
  const normalizator = useOpportunityDefinitionNormalizer();
  return useMemo(() => {
    const getCounters = (id: string) =>
      counters[id] || { booked: 0, bookedTEU: 0, quoted: 0, quotedTEU: 0 };

    return normalizeOpportunity(
      normalizator.getUser,
      normalizator.getClient,
      normalizator.getPortsGroup,
      normalizator.getPlacesGroup,
      normalizator.getCommodityGroup,
      normalizator.getEquipmentGroup,
      normalizator.getTag,
      getCounters,
    );
  }, [normalizator, counters]);
};

export default useNormalizedOpportunity;
