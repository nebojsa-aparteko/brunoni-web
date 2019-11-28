import React from 'react';
import { QuoteGroup } from '../providers/QuotesEndpoint';

export default React.createContext<Endpoint>({
  busy: false,
  error: undefined,
  result: undefined,
  refresh: () => {},
});

interface Endpoint {
  busy: boolean;
  error: string | undefined;
  result: QuoteGroup[] | null | undefined;
  refresh: () => void;
}
