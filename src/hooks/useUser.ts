import { useContext } from 'react';

import firebase from '../firebase';

import User from '../contexts/User';
import UserRecordContext from '../contexts/UserRecord';

import UserRecord from '../model/UserRecord';

export default (): [firebase.User, UserRecord] => [useContext(User)!, useContext(UserRecordContext)!];
