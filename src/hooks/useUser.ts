import { useContext } from 'react';

import firebase from '../firebase';

import User from '../contexts/User';
import UserRecordContext from '../contexts/UserRecord';

import UserRecord from '../model/UserRecord';
import Client from '../model/Client';
import useClient from './useClient';

export default (): [firebase.User, UserRecord, Client] => [
  useContext(User)!,
  useContext(UserRecordContext)!,
  useClient()!,
];
