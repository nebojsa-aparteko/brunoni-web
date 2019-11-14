import { User } from 'firebase';
import React, { useEffect, useState } from 'react';

import Context from '../contexts/User';
import firebase from '../firebase';

interface Props {
  children: React.ReactNode;
}

const UserProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null | undefined>();

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user);
    });
  }, [setUser]);

  return <Context.Provider value={user}>{children}</Context.Provider>;
};

export default UserProvider;
