import React, { useCallback, useContext, useMemo } from 'react';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { flow, isNil, omitBy } from 'lodash/fp';
import { MentionItem } from 'react-mentions';
import ActivityLogView from '../bookings/checklist/ActivityLogView';
import { ActivityType, QuoteActivityModel } from '../bookings/checklist/ActivityModel';
import UserRecordContext from '../../contexts/UserRecordContext';
import firebase from 'firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import { ActivityLogUserData } from '../bookings/checklist/ChecklistItemModel';

interface Props {
  quoteId: string;
}

const QuoteActivityLogContainer: React.FC<Props> = ({ quoteId }) => {
  const quoteActivityLogCollection = useFirestoreCollection(
    'quotes',
    useCallback(query => {
      return query.orderBy('at', 'desc');
    }, []),
    quoteId,
    'activity',
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
        .collection('quotes')
        .doc(quoteId)
        .collection('activity')
        .add(
          flow(omitBy(isNil))({
            type: ActivityType.COMMENT,
            comment: messageBody,
            at: new Date(),
            by: userActivityLogData,
            isInternal: true,
            mentions: mentions,
          } as QuoteActivityModel),
        )
        .then(_ => {
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [quoteId, userRecord],
  );

  return (
    <ActivityLogView activityLog={normalizedActivityLog} onCommentSave={handleCommentSave} quoteActivityLog={true} />
  );
};

export default QuoteActivityLogContainer;
