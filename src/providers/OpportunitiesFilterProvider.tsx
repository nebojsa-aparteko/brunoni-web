import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import { OpportunityTag } from '../model/OpportunityTag';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import { ContextFilters } from './filterActions';
import useUser from '../hooks/useUser';
import Client from '../model/Client';
import { OpportunityMatchDefinition, QuoteKind } from '../model/Opportunity';
import ContainerType from '../model/ContainerType';
import Port from '../model/Port';

export interface OpportunitiesContextFilters extends ContextFilters {
  statisticalClient?: Client | null;
  bookingParty?: Client | null;
  portsOfLoading?: {
    definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
    value: OpportunityPortsGroup | Port | string;
  } | null;
  portsOfDischarge?: {
    definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
    value: OpportunityPortsGroup | Port | string;
  } | null;
  placesOfDelivery?: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null;
  placesOfReceipt?: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null;
  tags?: OpportunityTag[];
  commodity?: {
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityCommodityGroup | string;
  } | null;
  equipment?: {
    definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
    value: OpportunityEquipmentGroup | ContainerType;
  } | null;
  quoteKind?: QuoteKind;
  opportunityId?: string;
}

export const OPPORTUNITIES_FILTERS_INITIAL_STATE = {
  statisticalClient: undefined,
  bookingParty: undefined,
  archived: false,
  hold: false,
  portsOfLoading: null,
  portsOfDischarge: null,
  placesOfDelivery: null,
  placesOfReceipt: null,
  tags: [],
  commodity: null,
  equipment: null,
  quoteKind: undefined,
  opportunityId: undefined,
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
