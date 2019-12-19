import React, { useState } from 'react';
import { DateRange, DefinedRange } from '../components/DateRangePicker/types';
import { rangePredefinedValues } from '../components/inputs/DateRangeInput';

interface QuoteListStateParams {
  searchString: string;
  page: number;
  rowsPerPage: number;
  dateRange: any;
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
