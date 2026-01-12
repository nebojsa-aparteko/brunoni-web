import { createContext, PropsWithChildren, useContext } from 'react';
import useOpportunitiesWithSalesRep from '../../hooks/useOpportunities';
import { NormalizedOpportunity } from '../../model/Opportunity';
import { useOpportunitiesListFilterContext } from '../../providers/OpportunitiesFilterProvider';

const OpportunitiesDataProviderCtx = createContext<NormalizedOpportunity[] | undefined>(undefined);

export const OpportunitiesDataProvider = ({ children }: PropsWithChildren<{}>) => {
  const [filters] = useOpportunitiesListFilterContext();
  const opportunities = useOpportunitiesWithSalesRep(filters?.year);

  return (
    <OpportunitiesDataProviderCtx.Provider value={opportunities}>
      {children}
    </OpportunitiesDataProviderCtx.Provider>
  );
};

export const useOpportunities = (): NormalizedOpportunity[] | undefined =>
  useContext(OpportunitiesDataProviderCtx);
