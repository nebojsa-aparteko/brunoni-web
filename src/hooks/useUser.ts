import { useContext } from 'react';

import firebase from '../firebase';

import UserContext from '../contexts/UserContext';
import UserRecordContext from '../contexts/UserRecordContext';

import UserRecord from '../model/UserRecord';
import Client from '../model/Client';
import useClient from './useClient';

export default (): [firebase.User, UserRecord, Client] => [
  useContext(UserContext)!,
  useContext(UserRecordContext)!,
  useClient()!,
];
