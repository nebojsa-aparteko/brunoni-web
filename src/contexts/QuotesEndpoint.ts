import React from 'react';
import QuotesResult from '../model/quotes/QuotesResult';

type Type = {
  busy: boolean;
  error: string | undefined;
  result: QuotesResult | null | undefined;
  refresh: () => void;
};

export default React.createContext<Type>({
  busy: false,
  error: undefined,
  result: undefined,
  refresh: () => {},
});
