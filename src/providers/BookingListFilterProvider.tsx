import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { ContextFilters } from './filterActions';
import { BookingCategory } from '../model/Booking';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import Carrier from '../model/Carrier';

export interface BookingContextFilters extends ContextFilters {
  category: string;
  activeTab?: number;
  carrier?: Carrier | undefined;
}

export const BOOKING_FILTERS_INITIAL_STATE = {
  archived: false,
  category: BookingCategory.Export,
} as BookingContextFilters;

const BookingListFilterContext = createContext<
  [BookingContextFilters, Dispatch<SetStateAction<BookingContextFilters>> | undefined]
>([BOOKING_FILTERS_INITIAL_STATE, undefined]);

const BookingListFilterProvider = (props: any) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [state, setState] = useState({
    assignee: !actingAs && userRecord,
    ...BOOKING_FILTERS_INITIAL_STATE,
  } as BookingContextFilters);

  return (
    <BookingListFilterContext.Provider value={[state, setState]}>{props.children}</BookingListFilterContext.Provider>
  );
};

export const useBookingListFilterContext = () => {
  const context = React.useContext(BookingListFilterContext);
  if (context === undefined) {
    throw new Error('useBookingListFilterContext must be used within a BookingListFilterProvider');
  }
  return context;
};

export default BookingListFilterProvider;
