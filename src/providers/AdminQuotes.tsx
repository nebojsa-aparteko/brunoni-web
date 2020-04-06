import React from 'react';
import subMonths from 'date-fns/subMonths';
import subWeeks from 'date-fns/subWeeks';
import QuotesContext from '../contexts/Quotes';
import FirestoreCollectionProvider from './FirestoreCollection';

interface Props {
  children: React.ReactNode;
}

const Quotes: React.FC<Props> = ({ children }) => {
  const date = process.env.REACT_APP_DEVELOPMENT ? subWeeks(new Date(), 1) : subMonths(new Date(), 3);

  const query = (collection: firebase.firestore.CollectionReference) =>
    collection.where('dateIssued', '>', date).limit(500);

  return (
    <FirestoreCollectionProvider name="quotes" query={query} context={QuotesContext}>
      {children}
    </FirestoreCollectionProvider>
  );
};

export default Quotes;
