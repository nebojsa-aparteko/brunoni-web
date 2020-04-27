import React from 'react';
import QuotesContext from '../contexts/Quotes';
import FirestoreCollectionProvider from './FirestoreCollection';
import useUser from '../hooks/useUser';

interface Props {
  children: React.ReactNode;
}

const QuotesProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];

  const query = userRecord?.alphacomClientId
    ? (collection: firebase.firestore.CollectionReference) =>
        collection
          .where('clientId', '==', userRecord!.alphacomClientId)
          .orderBy('dateIssued', 'desc')
          .limit(800)
    : (collection: firebase.firestore.CollectionReference) => collection.orderBy('dateIssued', 'desc').limit(800);

  return (
    <FirestoreCollectionProvider name="quotes" query={query} context={QuotesContext}>
      {children}
    </FirestoreCollectionProvider>
  );
};

export default QuotesProvider;
