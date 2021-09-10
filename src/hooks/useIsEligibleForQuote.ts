import { Quote } from '../providers/QuoteGroupsProvider';
import useUser from './useUser';
import { useContext } from 'react';
import ActingAs from '../contexts/ActingAs';

export const useIsEligibleForQuote = () => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];
  const isAdmin = !actingAs;

  return (quote: Quote) => {
    if (isAdmin) return true;
    return quote.clientId === userRecord.alphacomClientId;
  };
};
