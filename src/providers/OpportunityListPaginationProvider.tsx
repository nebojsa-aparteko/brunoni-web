import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

export interface OpportinityPaginationContext {
  searchString: string;
  page: number;
  rowsPerPage: number;
  scrollPosition?: number;
  activeTab: number;
}

export const OPPORTUNITY_FILTERS_INITIAL_STATE = {
  page: 0,
  rowsPerPage: 10,
  searchString: '',
  activeTab: 0,
} as OpportinityPaginationContext;

const OpportinityListPaginationContext = createContext<
  [OpportinityPaginationContext, Dispatch<SetStateAction<OpportinityPaginationContext>> | undefined]
>([OPPORTUNITY_FILTERS_INITIAL_STATE, undefined]);

const OpportinityListPaginationProvider = (props: any) => {
  const [state, setState] = useState(OPPORTUNITY_FILTERS_INITIAL_STATE);

  return (
    <OpportinityListPaginationContext.Provider value={[state, setState]}>
      {props.children}
    </OpportinityListPaginationContext.Provider>
  );
};

export const useOpportunityListPaginationContext = () => {
  const context = React.useContext(OpportinityListPaginationContext);
  if (context === undefined) {
    throw new Error(
      'useOpportunityListPaginationContext must be used within a BookingListPaginationProvider',
    );
  }
  return context;
};

export default OpportinityListPaginationProvider;
