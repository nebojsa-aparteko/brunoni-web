import React, { useMemo } from 'react';
import useFirestoreCollection, { QueryFunction } from '../hooks/useFirestoreCollection';

interface Props<T> {
  name: string;
  query?: QueryFunction | null;
  context: React.Context<T[] | undefined>;
  children: React.ReactNode;
  documentPath?: string;
  subCollection?: string;
}

function firestoreCollection<T>({
  name,
  query,
  documentPath,
  subCollection,
  context,
  children,
}: Props<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const snapshot = useFirestoreCollection(name, query, documentPath, subCollection);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const value = useMemo(() => {
    return snapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id }) as any) as T[] | undefined;
  }, [snapshot]);

  const { Provider } = context;

  return <Provider value={value}>{children}</Provider>;
}

export default firestoreCollection;
