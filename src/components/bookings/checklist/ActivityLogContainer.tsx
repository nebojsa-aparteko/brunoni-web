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
import { flow, omitBy, isNil } from 'lodash/fp';
import { shortenedChecklist, shortenedDocumentValue } from '../../../utilities/shortenedModel';
import { MentionItem } from 'react-mentions';

interface Props {
  bookingId: string;
  isAdmin: boolean;
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

const ActivityLogContainer: React.FC<Props> = ({ bookingId, isAdmin }) => {
  const [showMore, setShowMore] = useState(false);
  const activityLogContext = useActivityLogState();

  const activityLogCollection = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        const queryByItemFilter = showMore ? query : query.where('type', '==', ActivityType.COMMENT);
        const queryByAdminRole = isAdmin ? query : queryByItemFilter.where('isInternal', '==', isAdmin);
        return queryByAdminRole.orderBy('at', 'desc');
      },
      [isAdmin, showMore],
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
    return normalizedActivityLog?.filter((item: ActivityLogItem) =>
      showMore ? true : item.type === ActivityType.COMMENT,
    );
  }, [showMore, normalizedActivityLog]);

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
        .doc(bookingId)
        .collection('activity')
        .add(
          flow(omitBy(isNil))({
            type: ActivityType.COMMENT,
            comment: messageBody,
            at: new Date(),
            by: userActivityLogData,
            isInternal: internal,
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
    [bookingId, userRecord, isAdmin, activityLogContext],
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
