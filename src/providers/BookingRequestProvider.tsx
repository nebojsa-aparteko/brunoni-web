import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import { BookingRequest } from '../model/BookingRequest';

const BookingRequestContext = createContext<
  [
    BookingRequest | undefined,
    Dispatch<SetStateAction<BookingRequest | undefined>> | undefined,
    boolean | undefined,
    Dispatch<SetStateAction<boolean | undefined>>,
  ]
>([undefined, undefined, false, () => {}]);

const BookingRequestProvider = (props: any) => {
  const [state, setState] = useState<BookingRequest | undefined>();
  const [editing, setEditing] = useState<boolean | undefined>();

  return (
    <BookingRequestContext.Provider value={[state, setState, editing, setEditing]}>
      {props.children}
    </BookingRequestContext.Provider>
  );
};

export const useBookingRequestContext = () => {
  const context = React.useContext(BookingRequestContext);
  if (context === undefined) {
    throw new Error('useBookingRequestContext must be used within a BookingRequestProvider');
  }
  return context;
};

export default BookingRequestProvider;
