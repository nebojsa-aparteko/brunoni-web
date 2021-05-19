import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import { update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import firebase from '../firebase';

export default <T = any>({
  collectionPath,
  shouldShowAllDocuments = false,
}: {
  collectionPath: string;
  shouldShowAllDocuments?: boolean;
}) => {
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let q = collection.orderBy('uploadedAt', 'desc');
      if (!shouldShowAllDocuments) {
        q = q.limit(1);
      }
      return q;
    },
    [shouldShowAllDocuments],
  );
  const documents = useFirestoreCollection(collectionPath, query);

  return documents?.docs.map(doc => update('uploadedAt', safeInvoke('toDate'))({ ...doc.data(), id: doc.id })) as T[];
};
