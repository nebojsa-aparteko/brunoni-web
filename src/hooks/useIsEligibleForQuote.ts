import useUser from './useUser';
import { useContext } from 'react';
import ActingAs from '../contexts/ActingAs';
import Carrier from '../model/Carrier';
import { Quote } from '../providers/QuoteGroupsProvider';

export const useIsEligibleForQuote = () => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];
  const isAdmin = !actingAs;

  return (quote: Quote, carrier?: Carrier) => {
    if (isAdmin) return true;
    //TODO this is a temporary workaround and should not stay like this
    const typeUnsafeQuoteCarrier = quote.carrier as unknown;
    return quote.clientId === userRecord.alphacomClientId && carrier
      ? typeof typeUnsafeQuoteCarrier === 'string'
        ? typeUnsafeQuoteCarrier?.includes(carrier?.name)
        : quote.carrier?.name?.includes(carrier?.name)
      : true;
  };
};
