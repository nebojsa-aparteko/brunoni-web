import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import firebase from '../firebase';
import { BookingCategory } from '../model/Booking';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import BrunoniCodes, { BrunoniCodesType } from '../model/BrunoniCodes';

export default function useCodebook({ depotLocation, category }: { category: BookingCategory; depotLocation: string }) {
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let q = collection.where('depotLocations', 'array-contains', depotLocation);
      q = q.where('category', '==', category);
      return q;
    },
    [depotLocation, category],
  );
  const codeBookCollection = useFirestoreCollection('brunoni-codes', query);
  return codeBookCollection?.docs
    .map(d => normalizeCodebook(d.data()) as BrunoniCodes)
    .reduce(
      (previousValue, currentValue) => {
        if (currentValue.type === BrunoniCodesType.STORAGE) previousValue.storage.push(currentValue);
        if (currentValue.type === BrunoniCodesType.DEMURRAGE) previousValue.demurrage.push(currentValue);
        if (currentValue.type === BrunoniCodesType.PLUGIN) previousValue.plugin.push(currentValue);
        return previousValue;
      },
      { storage: [] as BrunoniCodes[], demurrage: [] as BrunoniCodes[], plugin: [] as BrunoniCodes[] },
    );
}

const normalizeCodebook = (data: any) =>
  flow(update('lastUpdated', safeInvoke('toDate')), update('validFrom', safeInvoke('toDate')))(data);
