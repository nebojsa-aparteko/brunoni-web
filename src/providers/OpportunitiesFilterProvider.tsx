import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import { OpportunityTag } from '../model/OpportunityTag';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import { ContextFilters } from './filterActions';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';

export interface OpportunitiesContextFilters extends ContextFilters {
  portsGroup?: OpportunityPortsGroup;
  placesGroup?: OpportunityPlacesGroup;
  tags?: OpportunityTag[];
  commodityGroups?: OpportunityCommodityGroup[];
  equipmentGroups?: OpportunityEquipmentGroup[];
}

export const OPPORTUNITIES_FILTERS_INITIAL_STATE = {
  archived: false,
  hold: false,
  portsGroup: undefined,
  placesGroup: undefined,
  tags: [],
  commodityGroups: [],
  equipmentGroups: [],
} as OpportunitiesContextFilters;

const OpportunitiesFilterContext = createContext<
  [OpportunitiesContextFilters, Dispatch<SetStateAction<OpportunitiesContextFilters>> | undefined]
>([OPPORTUNITIES_FILTERS_INITIAL_STATE, undefined]);

const OpportunitiesFilterProvider = (props: any) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [state, setState] = useState<OpportunitiesContextFilters>({
    assignee: !actingAs && userRecord,
    ...OPPORTUNITIES_FILTERS_INITIAL_STATE,
  });

  return (
    <OpportunitiesFilterContext.Provider value={[state, setState]}>
      {props.children}
    </OpportunitiesFilterContext.Provider>
  );
};

export const useOpportunitiesListFilterContext = () => {
  const context = React.useContext(OpportunitiesFilterContext);
  if (context === undefined) {
    throw new Error(
      'useOpportunitiesListFilterContext must be used within an OpportunitiesFilterProvider',
    );
  }
  return context;
};

export default OpportunitiesFilterProvider;
