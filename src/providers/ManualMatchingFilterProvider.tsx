import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { ContextFilters } from './filterActions';
import useUser from '../hooks/useUser';
import Client from '../model/Client';

export interface ManualMatchingContextFilters extends ContextFilters {
  opportunity?: string; // 'unmatched' or opportunity ID
  entityId?: string; // booking/quote ID for search
  bookingParty?: Client;
}

export const MANUAL_MATCHING_FILTERS_INITIAL_STATE = {
  opportunity: 'unmatched', // Default to unmatched
} as ManualMatchingContextFilters;

const ManualMatchingFilterContext = createContext<
  [ManualMatchingContextFilters, Dispatch<SetStateAction<ManualMatchingContextFilters>> | undefined]
>([MANUAL_MATCHING_FILTERS_INITIAL_STATE, undefined]);

const ManualMatchingFilterProvider = (props: any) => {
  const userRecord = useUser()[1];

  const [state, setState] = useState<ManualMatchingContextFilters>({
    assignee: userRecord,
    ...MANUAL_MATCHING_FILTERS_INITIAL_STATE,
  });

  return (
    <ManualMatchingFilterContext.Provider value={[state, setState]}>
      {props.children}
    </ManualMatchingFilterContext.Provider>
  );
};

export const useManualMatchingListFilterContext = () => {
  const context = React.useContext(ManualMatchingFilterContext);
  if (context === undefined) {
    throw new Error(
      'useManualMatchingListFilterContext must be used within a ManualMatchingFilterProvider',
    );
  }
  return context;
};

export default ManualMatchingFilterProvider;
