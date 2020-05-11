import React, { useState } from 'react';
import { rangePredefinedValues } from '../components/inputs/DateRangeInput';
import Client from '../model/Client';
import Port from '../model/Port';

interface BookingListStateParams {
  searchString: string;
  page: number;
  rowsPerPage: number;
  clientFilter?: Client;
  originPort?: Port;
  destinationPort?: Port;
  activeTab: number;
}

export const BOOKING_FILTERS_INITIAL_STATE = { searchString: '', page: 0, rowsPerPage: 25, activeTab: 0 };

const BookingListFilterContext = React.createContext<[BookingListStateParams, any]>([
  BOOKING_FILTERS_INITIAL_STATE,
  (state: BookingListStateParams) => {},
]);

const BookingListFilterProvider = (props: any) => {
  const [state, setState] = useState(BOOKING_FILTERS_INITIAL_STATE);
  const setStateFn = (state: BookingListStateParams) => {
    setState(state);
  };
  return (
    <BookingListFilterContext.Provider value={[state, setStateFn]}>{props.children}</BookingListFilterContext.Provider>
  );
};

export { BookingListFilterContext, BookingListFilterProvider };
