import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import firebase from '../firebase';
import { EquipmentImportSummary } from '../model/EquipmentControl';
import { useEquipmentControlFilterProviderContext } from '../providers/EquipmentControlFilterProvider';
import { BookingCategory } from '../model/Booking';

export default function useEquipmentSummary(category: BookingCategory) {
  const [filters] = useEquipmentControlFilterProviderContext();
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      // let query = collection.where('show', '==', true);
      // let query = collection.where('show', '==', true);
      // query = query.where('')
      return collection;
      // return query;
    },
    [],
  );

  const equipmentSummary = useFirestoreCollection(
    'sum-equipment-control',
    query,
    `${filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id}-${category}`,
    'summary',
  );
  return equipmentSummary?.docs.map(doc => {
    console.log('Equipment control', doc.data());
    return { ...doc.data(), id: doc.id } as EquipmentImportSummary;
  }) as EquipmentImportSummary[];
}
