import React, { useEffect, useState } from 'react';

import Context from '../contexts/UserRecord';
import firebase from '../firebase';
import useUser from '../hooks/useUser';
import UserRecord from '../model/UserRecord';

interface Props {
  children: React.ReactNode;
}

const UserProvider: React.FC<Props> = ({ children }) => {
  const [user] = useUser();
  const [userRecord, setUserRecord] = useState<UserRecord | null | undefined>();

  useEffect(() => {
    switch (user) {
      case undefined:
        setUserRecord(undefined);
        break;
      case null:
        setUserRecord(null);
        break;
      default:
        setUserRecord(undefined);
        return firebase
          .firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot(
            {},
            (snapshot: firebase.firestore.DocumentSnapshot) => {
              console.debug('userRecord updated with', snapshot);
              setUserRecord(snapshot.data() as UserRecord);
            },
            (error: Error) => {
              console.error('userRecord threw an error', error);
            },
            () => {
              console.log('userRecord completed');
            },
          );
    }
  }, [user, setUserRecord]);

  return <Context.Provider value={userRecord}>{children}</Context.Provider>;
};

export default UserProvider;
