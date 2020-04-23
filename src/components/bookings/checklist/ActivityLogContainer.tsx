import React, { useCallback, useContext, useMemo, useState } from 'react';
import ActivityLogView from './ActivityLogView';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { ActivityLogUserData } from './ChecklistItemModel';
import firebase from '../../../firebase';

interface Props {
  bookingId: string;
  isInternal: boolean;
}

export const addActivityItem = (bookingId: string, checklistId: string, activityLog: ActivityLogItem) => {
  return firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('activity')
    .doc()
    .set(activityLog);
};

const ActivityLogContainer: React.FC<Props> = ({ bookingId, isInternal = false }) => {
  const [showMore, setShowMore] = useState(false);

  const activityLogCollection = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        const queryByItemFilter = showMore ? query : query.where('type', '==', ActivityType.COMMENT);
        return queryByItemFilter.where('isInternal', '==', isInternal).orderBy('at', 'desc');
      },
      [isInternal, showMore],
    ),
    bookingId,
    'activity',
  );

  const activityCollection = activityLogCollection?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityLogItem[];

  const normalizedActivityLog = useMemo(() => map(update('at', invoke('toDate')))(activityCollection), [
    activityCollection,
  ]);

  const filteredActivityLog = useMemo(() => {
    console.log(normalizedActivityLog);
    return normalizedActivityLog?.filter((item: ActivityLogItem) =>
      showMore ? true : item.type === ActivityType.COMMENT,
    );
  }, [showMore, normalizedActivityLog]);

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
          comment: messageBody,
          at: new Date(),
          by: userActivityLogData,
          isInternal: isInternal,
        } as ActivityLogItem)
        .then(_ => console.log('Success saving message'))
        .catch(err => console.log(err));
    },
    [bookingId, userRecord, isInternal],
  );

  const handleShowMore = () => {
    setShowMore(prevState => !prevState);
  };
  return (
    <ActivityLogView
      activityLog={filteredActivityLog}
      onCommentSave={handleCommentSave}
      showMore={showMore}
      onChange={handleShowMore}
    />
  );
};

export default ActivityLogContainer;
