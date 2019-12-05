import React from 'react';
import QuotesContext from '../contexts/Quotes';
import FirestoreCollectionProvider from './FirestoreCollection';
import useUser from '../hooks/useUser';

interface Props {
  children: React.ReactNode;
}

const Quotes: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];

  const query = userRecord?.alphacomClientId
    ? (collection: firebase.firestore.CollectionReference) =>
        collection.where('clientId', '==', userRecord!.alphacomClientId)
    : null;

  return (
    <FirestoreCollectionProvider name="quotes" query={query} context={QuotesContext}>
      {children}
    </FirestoreCollectionProvider>
  );
};

export default Quotes;
