import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { ContextFilters } from './filterActions';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import Carrier from '../model/Carrier';
import { BookingContextFilters } from './BookingListFilterProvider';
import { useBookingListPaginationContext } from './BookingListPaginationProvider';

interface BookingRequestContextFilters extends ContextFilters {
  assignedTags?: string[];
  carrier?: Carrier;
}

const BOOKING_REQUESTS_FILTERS_INITIAL_STATE = {
  hold: false,
  carrier: undefined,
} as BookingContextFilters;

const BookingRequestsFilterContext = createContext<
  [BookingRequestContextFilters, Dispatch<SetStateAction<BookingRequestContextFilters>> | undefined]
>([BOOKING_REQUESTS_FILTERS_INITIAL_STATE, undefined]);

const BookingRequestsFilterProvider = (props: any) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];
  const [, setBookingPaginationContextData] = useBookingListPaginationContext();

  const [state, setState] = useState({
    assignee: !actingAs && userRecord,
    ...BOOKING_REQUESTS_FILTERS_INITIAL_STATE,
  } as BookingRequestContextFilters);

  useEffect(() => {
    setBookingPaginationContextData &&
      setBookingPaginationContextData(prevState => ({
        ...prevState,
        page: 0,
      }));
  }, [setBookingPaginationContextData, state]);

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
