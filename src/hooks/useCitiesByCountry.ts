import { useCallback } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import City from '../model/City';

export default (id?: string) => {
  const citiesCollection = useFirestoreCollection(
    'countries',
    useCallback(query => query.orderBy('name', 'asc'), []),
    id,
    'cities',
  );

  if (!citiesCollection) return undefined;

  return citiesCollection?.docs.map(doc => ({ id: doc.id, ...doc.data() } as City)) as City[];
};
