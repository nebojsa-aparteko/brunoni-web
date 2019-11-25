import React from 'react';
import update from 'lodash/fp/update';
import sortBy from 'lodash/sortBy';
import Context from '../contexts/Quotes';
import { QuoteHeader } from '../model/quotes/QuotesResult';

import useEndpoint from '../hooks/useEndpoint';

interface Props {
  children: React.ReactNode;
}
const updateQuoteResults = (quotes: QuoteHeader[]) => sortBy(quotes, (quote: QuoteHeader) => quote.QuoteDate);

const updateQuoteBody = update('Quote', updateQuoteResults);

const initialResults =
  process.env.NODE_ENV !== 'production' ? updateQuoteBody(require('../test/QuotesDataTest.json')) : undefined;

const QuotesProvider: React.FC<Props> = ({ children }) => {
  const quotes = useEndpoint('/quotes', updateQuoteBody, initialResults);

  return <Context.Provider value={quotes}>{children}</Context.Provider>;
};

export default QuotesProvider;
