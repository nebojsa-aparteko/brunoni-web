import React, { createContext, PropsWithChildren, useContext } from 'react';
import useOpportunitiesWithSalesRep from '../../hooks/useOpportunities';
import { NormalizedOpportunity } from '../../model/Opportunity';
import { useOpportunitiesListFilterContext } from '../../providers/OpportunitiesFilterProvider';

const OpportunitiesDataProviderCtx = createContext([] as NormalizedOpportunity[] | undefined);

export const OpportunitiesDataProvider = ({ children }: PropsWithChildren<{}>) => {
  const [filters] = useOpportunitiesListFilterContext(); // ✅ read year from context
  const opportunities = useOpportunitiesWithSalesRep(filters?.year);

  return (
    <OpportunitiesDataProviderCtx.Provider value={opportunities}>
      {children}
    </OpportunitiesDataProviderCtx.Provider>
  );
};

export const useOpportunities = () => useContext(OpportunitiesDataProviderCtx);
