import React from 'react';
import useFirestoreDocument from '../hooks/useFirestoreDocument';

interface Props<T> {
  collection: string;
  id: string;
  context: React.Context<T | undefined>;
  children: React.ReactNode;
}

export default function firestoreDocument<T>({
  collection,
  id,
  context: { Provider },
  children,
}: Props<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const snapshot = useFirestoreDocument(collection, id);

  return <Provider value={snapshot?.data() as T | undefined}>{children}</Provider>;
}
