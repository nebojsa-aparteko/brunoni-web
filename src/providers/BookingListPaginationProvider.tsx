import React, { createContext, Dispatch, SetStateAction, useState } from 'react';

export interface BookingPaginationContext {
  searchString: string;
  page: number;
  rowsPerPage: number;
  scrollPosition?: number;
  activeTab: number;
}

export const BOOKING_FILTERS_INITIAL_STATE = {
  page: 0,
  rowsPerPage: 10,
  searchString: '',
  activeTab: 0,
} as BookingPaginationContext;

const BookingListPaginationContext = createContext<
  [BookingPaginationContext, Dispatch<SetStateAction<BookingPaginationContext>> | undefined]
>([BOOKING_FILTERS_INITIAL_STATE, undefined]);

const BookingListPaginationProvider = (props: any) => {
  const [state, setState] = useState(BOOKING_FILTERS_INITIAL_STATE);

  return (
    <BookingListPaginationContext.Provider value={[state, setState]}>
      {props.children}
    </BookingListPaginationContext.Provider>
  );
};

export const useBookingListPaginationContext = () => {
  const context = React.useContext(BookingListPaginationContext);
  if (context === undefined) {
    throw new Error(
      'useBookingListPaginationContext must be used within a BookingListPaginationProvider',
    );
  }
  return context;
};

export default BookingListPaginationProvider;
