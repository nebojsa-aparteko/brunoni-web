import { useHistory } from 'react-router';
import { useContext } from 'react';
import UserRecord from '../contexts/UserRecordContext';
import { isNil } from 'lodash/fp';
import { getQuoteDocRef } from '../components/onlineBooking/MissingFields';
import firebase from '../firebase';
import useNormalizeQuote from './useNormalizedQuote';
import { Quote } from '../providers/QuoteGroupsProvider';
import { getBookingData } from '../components/bookingRequests/BookingRequestView';
import { Booking } from '../model/Booking';
import { BookingRequest } from '../model/BookingRequest';
import ActingAs from '../contexts/ActingAs';

const extractIdFromPath = (pathname: string) => {
  if (/\/quotes\/groups\/[0-9]+/.test(pathname)) {
    const quoteGroupId = pathname.match(/[0-9]+/)?.[0];
    return { type: 'quotes/groups', id: quoteGroupId! };
  } else if (/\/quotes\/[0-9]+/.test(pathname)) {
    const quoteId = pathname.match(/[0-9]+/)?.[0];
    return { type: 'quotes', id: quoteId! };
  } else if (/\/bookings\/[0-9]+/.test(pathname)) {
    const bookingId = pathname.match(/[0-9]+/)?.[0];
    return { type: 'bookings', id: bookingId! };
  } else if (/\/booking-requests\/req-[0-9]+/.test(pathname)) {
    const bookingRequestId = pathname.match(/req-[0-9]+/)?.[0];
    return { type: 'bookings-requests', id: bookingRequestId! };
  } else {
    return { type: null, id: null };
  }
};

const fetchQuteByGroupId = async (id: string, normalize: (...args: any[]) => any): Promise<Quote | undefined> => {
  return (
    await firebase
      .firestore()
      .collection('quotes')
      .where('groupId', '==', id)
      .get()
  ).docs.map(doc => normalize(doc.data()) as Quote)[0];
};

const fetchBookingRequestById = async (id: string) => {
  return (
    await firebase
      .firestore()
      .collection('bookings-requests')
      .doc(id)
      .get()
  ).data() as BookingRequest | undefined;
};

const isEligible = (userClientId: string, documentClientId: string) => userClientId === documentClientId;

const useAntiTrust = async () => {
  const history = useHistory();
  const userRecord = useContext(UserRecord);
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
  const normalize = useNormalizeQuote();

  if (!userRecord || !userRecord.alphacomClientId || isAdmin) return;

  const { location } = history;
  const { pathname } = location;
  const { type, id } = extractIdFromPath(pathname);

  if (isNil(type) || isNil(id)) return;

  switch (type) {
    case 'quotes/groups':
      const quoteGroup = await fetchQuteByGroupId(id, normalize);
      if (!quoteGroup || !quoteGroup.clientId) return;
      if (!isEligible(userRecord.alphacomClientId, quoteGroup.clientId)) history.push('/not-found');
      return;
    case 'quotes':
      const quote = (await getQuoteDocRef(id)).data() as Quote;
      if (!quote || !quote.clientId) return;
      if (!isEligible(userRecord.alphacomClientId, quote.clientId)) history.push('/not-found');
      return;
    case 'bookings':
      const booking = (await getBookingData(id)) as Booking | undefined;
      if (!booking || !booking.ForwAdrId) return;
      if (!isEligible(userRecord.alphacomClientId, booking.ForwAdrId)) history.push('/not-found');
      return;
    case 'bookings-requests':
      const bookingRequest = await fetchBookingRequestById(id);
      if (!bookingRequest || !bookingRequest.client?.id) return;
      if (!isEligible(userRecord.alphacomClientId, bookingRequest.client?.id)) history.push('/not-found');
      return;
    default:
      return;
  }
};

export default useAntiTrust;
