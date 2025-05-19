import React from 'react';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import useUser from '../hooks/useUser';

interface Props<T> {
  collection: string;
  context: React.Context<T | undefined>;
  children: React.ReactNode;
}

export default function firestoreClientDocument<T>({
  collection,
  context: { Provider },
  children,
}: Props<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const userRecord = useUser()[1];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const snapshot = useFirestoreDocument(collection, userRecord?.alphacomClientId);

  return <Provider value={snapshot?.data() as T | undefined}>{children}</Provider>;
}
