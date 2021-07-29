import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { ContextFilters } from './filterActions';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import Carrier from '../model/Carrier';
import { BookingContextFilters } from './BookingListFilterProvider';

interface BookingRequestContextFilters extends ContextFilters {
  assignedTags?: string[];
  carrier?: Carrier;
}

const BOOKING_REQUESTS_FILTERS_INITIAL_STATE = {
  hold: false,
  archived: false,
  carrier: undefined,
} as BookingContextFilters;

const BookingRequestsFilterContext = createContext<
  [BookingRequestContextFilters, Dispatch<SetStateAction<BookingRequestContextFilters>> | undefined]
>([BOOKING_REQUESTS_FILTERS_INITIAL_STATE, undefined]);

const BookingRequestsFilterProvider = (props: any) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [state, setState] = useState({
    assignee: !actingAs && userRecord,
    ...BOOKING_REQUESTS_FILTERS_INITIAL_STATE,
  } as BookingRequestContextFilters);

  return (
    <BookingRequestsFilterContext.Provider value={[state, setState]}>
      {props.children}
    </BookingRequestsFilterContext.Provider>
  );
};

export const useBookingRequestsFilterContext = () => {
  const context = React.useContext(BookingRequestsFilterContext);
  if (context === undefined) {
    throw new Error('useBookingRequestsListFilterContext must be used within a BookingListFilterProvider');
  }
  return context;
};

export default BookingRequestsFilterProvider;
