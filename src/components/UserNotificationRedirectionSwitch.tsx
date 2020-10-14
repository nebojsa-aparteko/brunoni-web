import React, { ChangeEvent, useCallback } from 'react';
import UserRecord from '../model/UserRecord';
import { FormControl, Switch } from '@material-ui/core';
import firebase from '../firebase';

const UserNotificationRedirectionSwitch = ({ userUid, user }: Props) => {
  const saveUserChanges = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!userUid || userUid == '') return;
      return firebase
        .firestore()
        .collection('users')
        .doc(userUid)
        .set({ isRedirectionActive: event.target.checked }, { merge: true })
        .then(_ => console.log('Saved'));
    },
    [userUid],
  );

  return (
    <FormControl>
      <Switch checked={user.isRedirectionActive} onChange={saveUserChanges} name="checkedB" color="primary" />
    </FormControl>
  );
};

interface Props {
  userUid: string;
  user: UserRecord;
}

export default UserNotificationRedirectionSwitch;
