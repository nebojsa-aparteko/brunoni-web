import React from 'react';
import firebase from '../firebase';

export default React.createContext<firebase.User | null | undefined>(undefined);
