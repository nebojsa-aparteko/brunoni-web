import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import firebase from '../firebase';
import { EquipmentExportSummary, EquipmentImportSummary } from '../model/EquipmentControl';
import { useEquipmentControlFilterProviderContext } from '../providers/EquipmentControlFilterProvider';
import { BookingCategory } from '../model/Booking';
import { addWeeks, getWeek, getYear } from 'date-fns';

export default function useEquipmentSummary<T extends BookingCategory>(
  category: T,
): T extends BookingCategory.Export ? EquipmentExportSummary[] : EquipmentImportSummary[] {
  const [filters] = useEquipmentControlFilterProviderContext();
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection;
      if (category === BookingCategory.Export) {
        query = query.where('year', '==', getYear(new Date()));
        query = query.where('week', '>=', getWeek(new Date(), { weekStartsOn: 1 }));
        query = query.where('week', '<=', getWeek(addWeeks(new Date(), 3), { weekStartsOn: 1 }));
        query = query.orderBy('week', 'asc');
      }
      return query;
    },
    [category],
  );

  const equipmentSummary = useFirestoreCollection(
    'sum-equipment-control',
    query,
    `${filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id}-${category}-${filters.version}`,
    'summary',
  );
  if (category === BookingCategory.Export) {
    return equipmentSummary?.docs.map(doc => {
      console.log('Equipment control', doc.data());
      return { ...doc.data(), id: doc.id } as EquipmentExportSummary;
    }) as any;
  } else {
    return equipmentSummary?.docs.map(doc => {
      console.log('Equipment control', doc.data());
      return { ...doc.data(), id: doc.id } as EquipmentImportSummary;
    }) as any;
  }
}
