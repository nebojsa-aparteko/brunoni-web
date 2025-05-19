import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import Carrier from '../model/Carrier';
import Port from '../model/Port';
import { DateRange } from '../components/daterangepicker/types';
import { addDays, subDays } from 'date-fns';

export interface LoadListContextFilters {
  carrier?: Carrier | undefined;
  origin?: Port | undefined;
  dateRange: DateRange | undefined;
  isLoading: boolean;
}

export const LOAD_LIST_FILTERS_INITIAL_STATE = {
  dateRange: { startDate: subDays(new Date(), 5), endDate: addDays(new Date(), 5) } as DateRange,
  isLoading: false,
} as LoadListContextFilters;

const LoadListFilterContext = createContext<
  [LoadListContextFilters, Dispatch<SetStateAction<LoadListContextFilters>> | undefined]
>([LOAD_LIST_FILTERS_INITIAL_STATE, undefined]);

const LoadListFilterProvider = (props: any) => {
  const [state, setState] = useState<LoadListContextFilters>(LOAD_LIST_FILTERS_INITIAL_STATE);

  return (
    <LoadListFilterContext.Provider value={[state, setState]}>
      {props.children}
    </LoadListFilterContext.Provider>
  );
};

export const useLoadListFilterContext = () => {
  const context = React.useContext(LoadListFilterContext);
  if (context === undefined) {
    throw new Error('useLoadListFilterContext must be used within a LoadListFilterProvider');
  }
  return context;
};

export default LoadListFilterProvider;
