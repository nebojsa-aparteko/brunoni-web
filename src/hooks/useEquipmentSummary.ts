import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import firebase from '../firebase';
import { EquipmentImportSummary } from '../model/EquipmentControl';

export default function useEquipmentSummary(carrierId: string, depots: string[]) {
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.where(firebase.firestore.FieldPath.documentId(), 'in', depots);
      // query = query.where('')
      return query;
    },
    [],
  );

  const equipmentSummary = useFirestoreCollection('sum-equipment-control', query, carrierId, 'depots');
  return equipmentSummary?.docs.map(doc => {
    console.log('Equipment control', doc.data());
    return doc.data() as EquipmentImportSummary;
  }) as EquipmentImportSummary[];
}
