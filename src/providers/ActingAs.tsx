import React, { useContext, useEffect, useState } from 'react';

import firebase from '../firebase';
import Context from '../contexts/ActingAs';
import useLocalStorage from '../utilities/useLocalStorage';
import UserRecordContext from '../contexts/UserRecordContext';
import UserRecord, { isDashboardUser } from '../model/UserRecord';

interface Props {
  anonymous?: boolean;
  children: React.ReactNode;
}

const ActingAsUser: React.FC<Props> = ({ children }) => {
  const userRecord = useContext(UserRecordContext);

  const [actingAsId, setActingAsId] = useLocalStorage('actingAs', null, false, Number.MAX_SAFE_INTEGER);

  const [actingAs, setActingAs] = useState<UserRecord | null | undefined>(undefined);

  useEffect(() => {
    if (actingAsId === null) {
      if (userRecord === undefined) {
        setActingAs(undefined);
      } else if (userRecord === null) {
        setActingAs(null);
      } else if (isDashboardUser(userRecord)) {
        setActingAs(null);
      } else {
        setActingAs(userRecord);
      }
    } else {
      setActingAs(undefined);

      return firebase
        .firestore()
        .collection('users')
        .doc(actingAsId)
        .onSnapshot({
          next: (snapshot: firebase.firestore.DocumentSnapshot) => {
            setActingAs(({ ...snapshot.data(), id: snapshot.id } as unknown) as UserRecord);
          },
          error: (error: Error) => {
            console.error('fetching user record', actingAsId, 'threw an error', error);
          },
        });
    }
  }, [userRecord, actingAsId, setActingAs]);

  return <Context.Provider value={[actingAs, setActingAsId]}>{children}</Context.Provider>;
};

const ActingAs: React.FC<Props> = ({ anonymous, children }) =>
  anonymous ? (
    <Context.Provider value={[null, () => {}]}>{children}</Context.Provider>
  ) : (
    <ActingAsUser>{children}</ActingAsUser>
  );

export default ActingAs;
