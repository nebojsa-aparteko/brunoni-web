import UserRecord from '../model/UserRecord';
import { Quote } from '../providers/QuoteGroupsProvider';

export const isEligibleForQuote = (user: UserRecord, quote: Quote, isAdmin: boolean) => {
  if (isAdmin) return true;
  return quote.clientId === user.alphacomClientId;
};
