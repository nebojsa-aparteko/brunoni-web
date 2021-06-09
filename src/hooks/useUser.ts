import { useContext } from 'react';

import firebase from '../firebase';

import UserContext from '../contexts/UserContext';
import UserRecordContext from '../contexts/UserRecordContext';

import UserRecord from '../model/UserRecord';
import ActingAs from '../contexts/ActingAs';

export default (): [firebase.User, UserRecord, boolean] => [
  useContext(UserContext)!,
  useContext(UserRecordContext)!,
  !useContext(ActingAs)?.[0]!,
];
