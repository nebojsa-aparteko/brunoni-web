import React, { useCallback, useContext, useMemo } from 'react';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { flow, isNil, omitBy } from 'lodash/fp';
import { MentionItem } from 'react-mentions';
import ActivityLogView from '../bookings/checklist/ActivityLogView';
import { ActivityType, QuoteActivityModel, QuoteGroupActivityModel } from '../bookings/checklist/ActivityModel';
import UserRecordContext from '../../contexts/UserRecordContext';
import firebase from 'firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import { ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';

interface Props {
  groupId: string;
}

const QuoteGroupActivityLogContainer: React.FC<Props> = ({ groupId }) => {
  const quoteActivityLogCollection = useFirestoreCollection(
    'quotes-group-comments',
    useCallback(
      query => {
        return query.where('groupId', '==', groupId).orderBy('at', 'desc');
      },
      [groupId],
    ),
  );

  const quoteActivityCollection = quoteActivityLogCollection?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as QuoteActivityModel[];

  const normalizedActivityLog = useMemo(() => map(update('at', invoke('toDate')))(quoteActivityCollection), [
    quoteActivityCollection,
  ]);

  const userRecord = useContext(UserRecordContext);

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[]) => {
      const userActivityLogData = {
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData;
      firebase
        .firestore()
        .collection('quotes-group-comments')
        .add(
          flow(omitBy(isNil))({
            type: ActivityType.COMMENT,
            comment: messageBody,
            at: new Date(),
            by: userActivityLogData,
            isInternal: true,
            mentions: mentions,
            groupId: groupId,
          } as QuoteGroupActivityModel),
        )
        .then(_ => {
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [groupId, userRecord],
  );

  return (
    <ActivityLogView activityLog={normalizedActivityLog} onCommentSave={handleCommentSave} quoteActivityLog={true} />
  );
};

export default QuoteGroupActivityLogContainer;
