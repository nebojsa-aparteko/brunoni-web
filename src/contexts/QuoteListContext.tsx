import React, { useState } from 'react';

interface QuoteListStateParams {
  searchString: string;
  page: number;
  rowsPerPage: number;
}
const QuoteListContext = React.createContext<[QuoteListStateParams, any]>([
  { searchString: '', page: 0, rowsPerPage: 10 },
  (state: QuoteListStateParams) => {},
]);

const QuoteListProvider = (props: any) => {
  const [state, setState] = useState({ searchString: '', page: 0, rowsPerPage: 10 });
  const setStateFn = (state: QuoteListStateParams) => {
    setState(state);
  };
  return <QuoteListContext.Provider value={[state, setStateFn]}>{props.children}</QuoteListContext.Provider>;
};

export { QuoteListContext, QuoteListProvider };
