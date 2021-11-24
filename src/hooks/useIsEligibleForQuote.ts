import useUser from './useUser';
import Carrier from '../model/Carrier';
import { Quote } from '../providers/QuoteGroupsProvider';

export const useIsEligibleForQuote = () => {
  const userRecord = useUser()[1];

  return (quote: Quote, carrier?: Carrier) => {
    //TODO this is a temporary workaround and should not stay like this
    const typeUnsafeQuoteCarrier = quote.carrier as unknown;
    return quote.clientId === userRecord.alphacomClientId && carrier
      ? typeof typeUnsafeQuoteCarrier === 'string'
        ? typeUnsafeQuoteCarrier?.includes(carrier?.name)
        : quote.carrier?.name?.includes(carrier?.name)
      : true;
  };
};
