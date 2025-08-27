import React, { createContext, PropsWithChildren, useContext } from 'react';

import useNormalizedOpportunityDefinition, {
  OpportunityDefinitionNormalizator,
} from '../../hooks/useNormalizedOpportunityDefinition';

const NormalizeOpportunityDefinitionsProviderCtx = createContext(
  {} as OpportunityDefinitionNormalizator,
);

export const NormalizeOpportunityDefinitionsProvider = ({ children }: PropsWithChildren<{}>) => {
  const normalizeOpportunityDefinition = useNormalizedOpportunityDefinition();

  return (
    <NormalizeOpportunityDefinitionsProviderCtx.Provider value={normalizeOpportunityDefinition}>
      {children}
    </NormalizeOpportunityDefinitionsProviderCtx.Provider>
  );
};

export const useOpportunityDefinitionNormalizer = () =>
  useContext(NormalizeOpportunityDefinitionsProviderCtx);
