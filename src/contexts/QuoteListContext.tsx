import React, { useState } from 'react';
import { rangePredefinedValues } from '../components/inputs/DateRangeInput';
import Client from '../model/Client';
import Port from '../model/Port';

interface QuoteListStateParams {
  searchString: string;
  page: number;
  rowsPerPage: number;
  dateRange: any;
  clientFilter?: Client;
  originPort?: Port;
  destinationPort?: Port;
}
const QuoteListContext = React.createContext<[QuoteListStateParams, any]>([
  { searchString: '', page: 0, rowsPerPage: 10, dateRange: rangePredefinedValues[3] },
  (state: QuoteListStateParams) => {},
]);

const QuoteListProvider = (props: any) => {
  const [state, setState] = useState({
    searchString: '',
    page: 0,
    rowsPerPage: 10,
    dateRange: rangePredefinedValues[3],
  });
  const setStateFn = (state: QuoteListStateParams) => {
    setState(state);
  };
  return <QuoteListContext.Provider value={[state, setStateFn]}>{props.children}</QuoteListContext.Provider>;
};

export { QuoteListContext, QuoteListProvider };
