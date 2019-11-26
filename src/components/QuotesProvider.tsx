import React from 'react';
import update from 'lodash/fp/update';
import sortBy from 'lodash/fp/sortBy';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import groupBy from 'lodash/fp/groupBy';
import flatten from 'lodash/fp/flatten';
import values from 'lodash/fp/values';
import Context from '../contexts/Quotes';
import { QuoteHeader } from '../model/quotes/QuotesResult';

import useEndpoint from '../hooks/useEndpoint';
import useTestData from '../utilities/useTestData';
import asArray from '../utilities/asArray';

interface Props {
  children: React.ReactNode;
}

const flattenEntity = (name: string) => flow(asArray, map(flow(update(name, asArray), get(name))), flatten);

const normalizeQuotes = flow(
  get('QuoteHeader'),
  groupBy('idRequest'),
  values,
  map(
    flow(
      map(
        flow(
          update('QuoteDetails', flattenEntity('QuoteDetail')),
          update('CostDetailsRemarks', flattenEntity('CostDetailRemark')),
          update('ServiceDetail', asArray),
          update('CargoDetails', flattenEntity('CargoDetail')),
          update('Remarks', flattenEntity('Remark')),
          update('Terms', flattenEntity('Term')),
        ),
      ),
      sortBy((quote: QuoteHeader) => quote.QuoteDate),
    ),
  ),
  sortBy((quotes: QuoteHeader[]) => quotes[0].QuoteDate),
);

const QuotesProvider: React.FC<Props> = ({ children }) => {
  const quotes = useEndpoint('/quotes', normalizeQuotes, useTestData('quotes', normalizeQuotes));

  return <Context.Provider value={quotes}>{children}</Context.Provider>;
};

export default QuotesProvider;
