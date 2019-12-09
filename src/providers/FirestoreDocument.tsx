import React from 'react';
import useFirestoreDocument from '../hooks/useFirestoreDocument';

interface Props<T> {
  name: string;
  context: React.Context<T | undefined>;
  children: React.ReactNode;
}

export default function firestoreDocument<T>({ name, context, children }: Props<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const snapshot = useFirestoreDocument(name);

  const { Provider } = context;

  return <Provider value={snapshot?.data() as T | undefined}>{children}</Provider>;
}
