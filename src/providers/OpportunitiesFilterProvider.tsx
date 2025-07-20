import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import { OpportunityTag } from '../model/OpportunityTag';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import { ContextFilters } from './filterActions';
import useUser from '../hooks/useUser';

export interface OpportunitiesContextFilters extends ContextFilters {
  portsOfLoadingGroup?: OpportunityPortsGroup;
  portsOfDischargeGroup?: OpportunityPortsGroup;
  placesOfDeliveryGroup?: OpportunityPlacesGroup;
  placesOfReceiptGroup?: OpportunityPlacesGroup;
  tags?: OpportunityTag[];
  commodityGroup?: OpportunityCommodityGroup;
  equipmentGroup?: OpportunityEquipmentGroup;
}

export const OPPORTUNITIES_FILTERS_INITIAL_STATE = {
  archived: false,
  hold: false,
  portsGroup: undefined,
  placesGroup: undefined,
  tags: [],
  commodityGroup: undefined,
  equipmentGroup: undefined,
} as OpportunitiesContextFilters;

const OpportunitiesFilterContext = createContext<
  [OpportunitiesContextFilters, Dispatch<SetStateAction<OpportunitiesContextFilters>> | undefined]
>([OPPORTUNITIES_FILTERS_INITIAL_STATE, undefined]);

const OpportunitiesFilterProvider = (props: any) => {
  const userRecord = useUser()[1];

  const [state, setState] = useState<OpportunitiesContextFilters>({
    assignee: userRecord,
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
