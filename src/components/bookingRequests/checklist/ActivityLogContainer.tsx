import { ActivityLogItem, ActivityType } from '../../bookings/checklist/ActivityModel';
import firebase from '../../../firebase';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useActivityLogState } from '../../bookings/checklist/ActivityLogContext';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import map from 'lodash/fp/map';
import { flow, isNil, omitBy } from 'lodash/fp';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { normalizePaymentActivityData } from '../../bookings/documentApproval/ComparisonDialogContent';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { MentionItem } from 'react-mentions';
import { ActivityLogUserData } from '../../bookings/checklist/ChecklistItemModel';
import ActivityLogView from '../../bookings/checklist/ActivityLogView';
import { BookingRequest } from '../../../model/BookingRequest';
import { shortenedChecklist, shortenedDocumentValue } from '../../../utilities/shortenedModel';

interface Props {
  bookingRequest: BookingRequest;
  isAdmin: boolean;
}

export const addActivityItem = (bookingRequestId: string, activityLog: ActivityLogItem) => {
  return firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingRequestId)
    .collection('activity')
    .doc()
    .set(activityLog);
};

const ActivityLogContainer: React.FC<Props> = ({ bookingRequest, isAdmin }) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const activityLogContext = useActivityLogState();

  const activityLogCollection = useFirestoreCollection(
    'bookings-requests',
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
    bookingRequest.id,
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
        showMore ? true : item.type === ActivityType.COMMENT || item.type === ActivityType.ACTIVITY_WITH_COMMENT,
      ),
    [showMore, normalizedActivityLog],
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
        .collection('bookings-requests')
        .doc(bookingRequest.id)
        .collection('activity')
        .add(
          omitBy(isNil)({
            type: ActivityType.COMMENT,
            comment: messageBody,
            at: new Date(),
            by: userActivityLogData,
            isInternal: internal,
            mentions: mentions,
            checklistItem: shortenedChecklist(activityLogContext.state?.checklistReference),
            documents: shortenedDocumentValue(activityLogContext.state?.documentReference),
          } as ActivityLogItem),
        )
        .then(_ => {
          console.log('Success saving message');
          activityLogContext.setState({});
        })
        .catch(err => console.log(err));
    },
    [bookingRequest.id, userRecord, activityLogContext],
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
      bookingRequest={bookingRequest}
      isAccounting={false}
      pinnedCommentsCount={pinnedCommentsCount}
    />
  );
};

export default ActivityLogContainer;
