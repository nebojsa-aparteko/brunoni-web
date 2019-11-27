import React from 'react';
import Container from '../model/Container';
import Port from '../model/Port';
import { QuoteHeader } from '../model/quotes/QuotesResult';

export default React.createContext<Endpoint>({
  busy: false,
  error: undefined,
  result: undefined,
  refresh: () => {},
});

interface Endpoint {
  busy: boolean;
  error: string | undefined;
  result: Result[] | null | undefined;
  refresh: () => void;
}

interface Result {
  id: string;
  date: Date;
  origin: Port;
  destination: Port;
  containers: Container[];
  quotes: QuoteHeader[];
}
