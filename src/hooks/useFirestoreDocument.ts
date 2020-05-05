import { useEffect, useState } from 'react';
import firebase from '../firebase';

export default function useFirestoreDocument(
  collection: string,
  id?: string,
  documentPath?: string,
  subCollection?: string,
) {
  const [snapshot, setSnapshot] = useState<firebase.firestore.DocumentSnapshot | undefined>();

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      try {
        const document =
          (await documentPath) && subCollection
            ? firebase
                .firestore()
                .collection(collection)
                .doc(documentPath)
                .collection(subCollection)
                .doc(id)
            : firebase
                .firestore()
                .collection(collection)
                .doc(id);

        return document.onSnapshot({
          next: (snapshot: firebase.firestore.DocumentSnapshot) => {
            console.debug('useFirestoreDocument', `/${collection}/${id}`, 'updated with', snapshot);
            setSnapshot(snapshot);
          },
          error: (error: Error) => {
            console.error('useFirestoreDocument', `/${collection}/${id}`, 'threw an error', error);
          },
          complete: () => {
            console.log('useFirestoreDocument', `/${collection}/${id}`, 'completed');
          },
        });
      } catch (error) {
        console.error('useFirestoreDocument', `/${collection}/${id}`, 'threw an error', error);
      }
    })();
  }, [collection, id, documentPath, , subCollection]);

  return snapshot;
}
