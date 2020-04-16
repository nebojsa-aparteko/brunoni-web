import React, { useCallback, useContext, useMemo } from 'react';
import ActivityLogView from './ActivityLogView';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import { ActivityType, CommentEntity } from './ActivityModel';
import UserRecordContext from '../../../contexts/UserRecord';
import { ActivityLogUserData } from './ChecklistItemModel';
import firebase from '../../../firebase';

interface Props {
  bookingId: string;
  isInternal: boolean;
}

const ActivityLogContainer: React.FC<Props> = ({ bookingId, isInternal = false }) => {
  // TODO storing logic

  // addActivityItem (ActivityItemDetails) // firestore.save

  //
  // Text. matcher replace({INVOICE}}

  const activityLogCollection = useFirestoreCollection(
    'bookings',
    useCallback(query => query.orderBy('commentedAt', 'desc'), [isInternal]), //where('isInternal', '==', isInternal)
    bookingId,
    'activity',
  );

  const activityCollection = activityLogCollection?.docs.map(doc => doc.data()) as CommentEntity[];

  const normalizedActivityLog = useMemo(() => map(update('commentedAt', invoke('toDate')))(activityCollection), [
    activityCollection,
  ]);

  const userRecord = useContext(UserRecordContext);

  const handleCommentSave = useCallback(
    (messageBody: string) => {
      const userActivityLogData = {
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData;
      firebase
        .firestore()
        .collection('bookings')
        .doc(bookingId)
        .collection('activity')
        .add({
          type: ActivityType.COMMENT,
          text: messageBody,
          commentedAt: new Date(),
          commentedBy: userActivityLogData,
          isInternal: isInternal,
        } as CommentEntity)
        .then(_ => console.log('Success saving message'))
        .catch(err => console.log(err));
    },
    [bookingId, userRecord, isInternal],
  );

  return <ActivityLogView activityLog={normalizedActivityLog} onCommentSave={handleCommentSave} />;
};

export default ActivityLogContainer;
