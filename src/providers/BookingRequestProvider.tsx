import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import { BookingRequest } from '../model/BookingRequest';

const BookingRequestContext = createContext<
  [
    BookingRequest | undefined,
    Dispatch<SetStateAction<BookingRequest | undefined>>,
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ]
>([undefined, () => {}, false, () => {}]);

const BookingRequestProvider = (props: any) => {
  const [state, setState] = useState<BookingRequest>();
  const [editing, setEditing] = useState<boolean>(false);

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
