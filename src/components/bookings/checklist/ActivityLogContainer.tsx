import React, { useCallback, useContext, useMemo, useState } from 'react';
import ActivityLogView from './ActivityLogView';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import { ActivityLogItem, ActivityType } from './ActivityModel';
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

  const activityCollection = activityLogCollection?.docs.map(doc => doc.data()) as ActivityLogItem[];

  const normalizedActivityLog = useMemo(() => map(update('at', invoke('toDate')))(activityCollection), [
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
      activityLog={normalizedActivityLog}
      onCommentSave={handleCommentSave}
      showMore={showMore}
      onChange={handleShowMore}
    />
  );
};

export default ActivityLogContainer;
