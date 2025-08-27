import React, { createContext, PropsWithChildren, useContext } from 'react';

import useOpportunitiesWithSalesRep from '../../hooks/useOpportunities';
import { NormalizedOpportunity } from '../../model/Opportunity';

const OpportunitiesDataProviderCtx = createContext([] as NormalizedOpportunity[] | undefined);

export const OpportunitiesDataProvider = ({ children }: PropsWithChildren<{}>) => {
  const opportunities = useOpportunitiesWithSalesRep();

  return (
    <OpportunitiesDataProviderCtx.Provider value={opportunities}>
      {children}
    </OpportunitiesDataProviderCtx.Provider>
  );
};

export const useOpportunities = () => useContext(OpportunitiesDataProviderCtx);
