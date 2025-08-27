import React, { createContext, PropsWithChildren, useContext } from 'react';

import useEntityOpportunityMatches from '../../hooks/useOpportunityMatches';
import { NormalizedEntityOpportunityMatch } from '../../model/Opportunity';

const OpportunityMatchesDataProviderCtx = createContext(
  [] as NormalizedEntityOpportunityMatch[] | undefined,
);

export const OpportunityMatchesDataProvider = ({ children }: PropsWithChildren<{}>) => {
  const normalizedMatches = useEntityOpportunityMatches();

  return (
    <OpportunityMatchesDataProviderCtx.Provider value={normalizedMatches}>
      {children}
    </OpportunityMatchesDataProviderCtx.Provider>
  );
};

export const useOpportunityMatches = () => useContext(OpportunityMatchesDataProviderCtx);
