import { useEffect, useState } from 'react';
import firebase from '../firebase';
import useUser from './useUser';

export default function useFirestoreDocument(name: string) {
  const [snapshot, setSnapshot] = useState<firebase.firestore.DocumentSnapshot | undefined>();

  const userRecord = useUser()[1];

  useEffect(() => {
    if (!userRecord) {
      setSnapshot(undefined);
      return undefined;
    }

    (async () => {
      try {
        const document = await firebase
          .firestore()
          .collection(name)
          .doc(userRecord!.alphacomClientId);

        return document.onSnapshot({
          next: (snapshot: firebase.firestore.DocumentSnapshot) => {
            console.debug('useFirestoreDocument', name, 'updated with', snapshot);
            setSnapshot(snapshot);
          },
          error: (error: Error) => {
            console.error('useFirestoreDocument', name, 'threw an error', error);
          },
          complete: () => {
            console.log('useFirestoreDocument', name, 'completed');
          },
        });
      } catch (error) {
        console.error('useFirestoreDocument', name, 'threw an error', error);
      }
    })();
  }, [name, userRecord?.alphacomClientId]);

  return snapshot;
}
