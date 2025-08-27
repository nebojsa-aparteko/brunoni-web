import React, { createContext, PropsWithChildren, useContext } from 'react';
import { NormalizedOpportunity } from '../../model/Opportunity';
import useOpportunitiesWithSalesRep from '../../hooks/useOpportunities';

const OpportunitiesDataProviderCtx = createContext([] as NormalizedOpportunity[]);

export const OpportunitiesDataProvider = ({ children }: PropsWithChildren<{}>) => {
  const opportunities = useOpportunitiesWithSalesRep();

  return (
    <OpportunitiesDataProviderCtx.Provider value={opportunities}>
      {children}
    </OpportunitiesDataProviderCtx.Provider>
  );
};

export const useOpportunities = () => useContext(OpportunitiesDataProviderCtx);
