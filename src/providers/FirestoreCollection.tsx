import React, { useMemo } from 'react';
import useFirestoreCollection from '../hooks/useFirestoreCollection';

interface Props<T> {
  name: string;
  context: React.Context<T[] | undefined>;
  children: React.ReactNode;
}

function firestoreCollection<T>({ name, context, children }: Props<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const snapshot = useFirestoreCollection(name);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const value = useMemo(() => {
    return snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as T[] | undefined;
  }, [snapshot]);

  const { Provider } = context;

  return <Provider value={value}>{children}</Provider>;
}

export default firestoreCollection;
