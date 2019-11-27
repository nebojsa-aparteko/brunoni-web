import { useEffect, useState } from 'react';
import firebase from '../firebase';

export default function useFirestoreCollection(name: string) {
  const [snapshot, setSnapshot] = useState<firebase.firestore.QuerySnapshot | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const collection = await firebase
          .firestore()
          .collection(name)
          .get();

        return collection.query.onSnapshot({
          complete: () => {
            console.log('useFirestoreCollection', name, 'completed');
          },
          error: error => {
            console.error('useFirestoreCollection', name, 'threw an error', error);
          },
          next: snapshot => {
            console.debug('useFirestoreCollection', name, 'updated with', snapshot);
            setSnapshot(snapshot);
          },
        });
      } catch (error) {
        console.error('useFirestoreCollection', name, 'threw an error', error);
      }
    })();
  }, [name]);

  return snapshot;
}
