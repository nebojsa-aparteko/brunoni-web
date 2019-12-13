import React from 'react';
import QuotesContext from '../contexts/Quotes';
import FirestoreCollectionProvider from './FirestoreCollection';

interface Props {
  children: React.ReactNode;
}

const Quotes: React.FC<Props> = ({ children }) => (
  <FirestoreCollectionProvider name="quotes" context={QuotesContext}>
    {children}
  </FirestoreCollectionProvider>
);

export default Quotes;
