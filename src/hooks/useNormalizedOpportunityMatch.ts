import { useMemo } from 'react';

import { useOpportunityDefinitionNormalizer } from '../components/opportunities/NormlizeOpportunityDefinitionsProvider';
import { normalizeOpportunityMatch } from '../providers/OpportunityMatchProvider';

const useNormalizedOpportunityMatch = () => {
  const normalizator = useOpportunityDefinitionNormalizer();
  return useMemo(() => {
    return normalizeOpportunityMatch(
      normalizator.getUser,
      normalizator.getClient,
      normalizator.getPortsGroup,
      normalizator.getPlacesGroup,
      normalizator.getCommodityGroup,
      normalizator.getEquipmentGroup,
    );
  }, [normalizator]);
};

export default useNormalizedOpportunityMatch;
