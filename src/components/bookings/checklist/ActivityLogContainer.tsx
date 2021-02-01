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
import { useActivityLogState } from './ActivityLogContext';
import { flow, isNil, omitBy } from 'lodash/fp';
import { shortenedChecklist, shortenedDocumentValue } from '../../../utilities/shortenedModel';
import { MentionItem } from 'react-mentions';
import { Booking } from '../../../model/Booking';
import { normalizePaymentActivityData } from '../documentApproval/ComparisonDialogContent';

interface Props {
  booking: Booking;
  isAdmin: boolean;
  isAccounting?: boolean;
}

export const addActivityItem = (bookingId: string, activityLog: ActivityLogItem) => {
  return firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('activity')
    .doc()
    .set(activityLog);
};

const ActivityLogContainer: React.FC<Props> = ({ booking, isAdmin, isAccounting }) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const activityLogContext = useActivityLogState();

  const activityLogCollection = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        const queryByItemFilter = showMore
          ? query
          : query.where('type', 'in', [ActivityType.COMMENT, ActivityType.ACTIVITY_WITH_COMMENT]);
        const queryByAdminRole = isAdmin ? query : queryByItemFilter.where('isInternal', '==', isAdmin);
        return queryByAdminRole.orderBy('at', 'desc');
      },
      [isAdmin, showMore],
    ),
    booking.id,
    'activity',
  );

  const activityCollection = activityLogCollection?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityLogItem[];

  const normalizedActivityLog = useMemo(
    () =>
      map(flow(update('at', invoke('toDate')), update('paymentActivityData', normalizePaymentActivityData)))(
        activityCollection,
      ) as ActivityLogItem[],
    [activityCollection],
  );
  const pinnedCommentsCount = useMemo(() => normalizedActivityLog?.filter(item => item.isPinned).length, [
    normalizedActivityLog,
  ]);
  const filteredActivityLog = useMemo(
    () =>
      normalizedActivityLog?.filter((item: ActivityLogItem) =>
        isAccounting
          ? item.isAccountingActivity
            ? showMore
              ? true
              : item.type === ActivityType.COMMENT || item.type === ActivityType.ACTIVITY_WITH_COMMENT
            : false
          : showMore
          ? !item.isAccountingActivity
          : !item.isAccountingActivity &&
            (item.type === ActivityType.COMMENT || item.type === ActivityType.ACTIVITY_WITH_COMMENT),
      ),
    [showMore, normalizedActivityLog, isAccounting],
  );

  const userRecord = useContext(UserRecordContext);

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], internal: boolean) => {
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
        .doc(booking.id)
        .collection('activity')
        .add(
          flow(omitBy(isNil))({
            type: ActivityType.COMMENT,
            comment: messageBody,
            at: new Date(),
            by: userActivityLogData,
            isInternal: internal,
            isAccountingActivity: isAccounting,
            checklistItem: shortenedChecklist(activityLogContext.state?.checklistReference),
            documents: shortenedDocumentValue(activityLogContext.state?.documentReference),
            mentions: mentions,
          } as ActivityLogItem),
        )
        .then(_ => {
          console.log('Success saving message');
          activityLogContext.setState({});
        })
        .catch(err => console.log(err));
    },
    [booking.id, userRecord, activityLogContext, isAccounting],
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
      booking={booking}
      isAccounting={isAccounting}
      canPin={pinnedCommentsCount === 2}
    />
  );
};

export default ActivityLogContainer;
