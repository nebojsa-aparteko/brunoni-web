import React, { useState } from 'react';
import { rangePredefinedValues } from '../components/inputs/DateRangeInput';
import Client from '../model/Client';
import Port from '../model/Port';

export interface QuoteListStateParams {
  searchString: string;
  page: number;
  rowsPerPage: number;
  dateRange: any;
  clientFilter?: Client;
  originPort?: Port;
  destinationPort?: Port;
}
const QuoteListFilterContext = React.createContext<[QuoteListStateParams, any]>([
  { searchString: '', page: 0, rowsPerPage: 10, dateRange: rangePredefinedValues[3] },
  (state: QuoteListStateParams) => {},
]);

const QuoteFilterListProvider = (props: any) => {
  const [state, setState] = useState({
    searchString: '',
    page: 0,
    rowsPerPage: 10,
    dateRange: rangePredefinedValues[3],
  });
  const setStateFn = (state: QuoteListStateParams) => {
    setState(state);
  };
  return (
    <QuoteListFilterContext.Provider value={[state, setStateFn]}>{props.children}</QuoteListFilterContext.Provider>
  );
};

export { QuoteListFilterContext, QuoteFilterListProvider };
