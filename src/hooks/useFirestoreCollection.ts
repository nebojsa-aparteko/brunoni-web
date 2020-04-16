import { useEffect, useState } from 'react';
import identity from 'lodash/fp/identity';
import firebase from '../firebase';

export type QueryFunction = (collection: firebase.firestore.CollectionReference) => firebase.firestore.Query;

/**
 *
 * @param name
 * @param query
 * @param documentPath - optional param if ther is a document to fetch, it should go with subcollection
 * @param subCollection - subcollection to fetch
 */
export default function useFirestoreCollection(
  name: string,
  query?: QueryFunction | null,
  documentPath?: string,
  subCollection?: string,
) {
  const [snapshot, setSnapshot] = useState<firebase.firestore.QuerySnapshot | undefined>();

  useEffect(() => {
    if (query === null) {
      setSnapshot(undefined);
      return;
    }

    (async () => {
      try {
        const collectionReference =
          documentPath && subCollection
            ? firebase
                .firestore()
                .collection(name)
                .doc(documentPath)
                .collection(subCollection)
            : firebase.firestore().collection(name);

        const collection = await ((query || identity)(collectionReference) as any).get();

        return collection.query.onSnapshot({
          complete: () => {
            console.log('useFirestoreCollection', name, 'completed');
          },
          error: (error: firebase.firestore.FirestoreError) => {
            console.error('useFirestoreCollection', name, 'threw an error', error);
          },
          next: (snapshot: firebase.firestore.QuerySnapshot) => {
            console.debug('useFirestoreCollection', name, 'updated with', snapshot);
            setSnapshot(snapshot);
          },
        });
      } catch (error) {
        console.error('useFirestoreCollection', name, 'threw an error', error);
      }
    })();
  }, [name, query, documentPath, subCollection]);

  return snapshot;
}
