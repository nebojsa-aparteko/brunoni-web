import { useEffect, useState } from 'react';
import firebase from '../firebase';

export default function useFirestoreDocument(
  collection: string,
  id?: string,
  subCollection?: string,
  subCollectionPath?: string,
) {
  const [snapshot, setSnapshot] = useState<firebase.firestore.DocumentSnapshot | undefined | null>();

  useEffect(() => {
    if (!id) {
      return;
    }

    const cleanup = (async () => {
      try {
        const document =
          (await subCollectionPath) && subCollection
            ? firebase
                .firestore()
                .collection(collection)
                .doc(id)
                .collection(subCollection)
                .doc(subCollectionPath)
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
        setSnapshot(null);
      }
    })();

    return () => {
      if (cleanup) {
        cleanup
          .then(result => {
            if (result) result();
          })
          .catch(error => console.error('cleanup error', error));
      }
    };
  }, [collection, id, subCollectionPath, subCollection]);

  return snapshot;
}
