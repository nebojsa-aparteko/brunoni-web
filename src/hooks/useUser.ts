import { useContext } from 'react';

import firebase from '../firebase';

import UserContext from '../contexts/UserContext';
import UserRecordContext from '../contexts/UserRecordContext';

import UserRecord from '../model/UserRecord';

export default (): [firebase.User, UserRecord] => [useContext(UserContext)!, useContext(UserRecordContext)!];
