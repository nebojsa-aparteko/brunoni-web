import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import firebase from '../firebase';
import { BookingCategory } from '../model/Booking';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import BrunoniCodes, { BrunoniCodesType } from '../model/BrunoniCodes';

export default function useCodebook({
  depotLocation,
  category,
  carrier,
  equipment,
  port,
}: {
  category: BookingCategory;
  depotLocation: string;
  carrier: string;
  port: string;
  equipment: string;
}) {
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let q = collection.where('depotLocations', 'array-contains', depotLocation);
      q = q.where('category', '==', category);
      q = q.where('carrierId', '==', carrier);
      return q;
    },
    [depotLocation, category, carrier],
  );
  const codeBookCollection = useFirestoreCollection('brunoni-codes', query);
  return codeBookCollection?.docs
    .map(d => normalizeCodebook(d.data()) as BrunoniCodes)
    .filter(
      value =>
        (value.ports ? value.ports.includes(port) : true) &&
        (value.equipments ? value.equipments.includes(equipment) : true),
    )
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
