import React, { useState } from 'react';
import { rangePredefinedValues } from '../components/inputs/DateRangeInput';
import Client from '../model/Client';
import Port from '../model/Port';

interface BookingListStateParams {
  searchString: string;
  page: number;
  rowsPerPage: number;
  dateRange: any;
  clientFilter?: Client;
  originPort?: Port;
  destinationPort?: Port;
}
const BookingListFilterContext = React.createContext<[BookingListStateParams, any]>([
  { searchString: '', page: 0, rowsPerPage: 10, dateRange: rangePredefinedValues[3] },
  (state: BookingListStateParams) => {},
]);

const BookingListFilterProvider = (props: any) => {
  const [state, setState] = useState({
    searchString: '',
    page: 0,
    rowsPerPage: 10,
    dateRange: rangePredefinedValues[3],
  });
  const setStateFn = (state: BookingListStateParams) => {
    setState(state);
  };
  return (
    <BookingListFilterContext.Provider value={[state, setStateFn]}>{props.children}</BookingListFilterContext.Provider>
  );
};

export { BookingListFilterContext, BookingListFilterProvider };
