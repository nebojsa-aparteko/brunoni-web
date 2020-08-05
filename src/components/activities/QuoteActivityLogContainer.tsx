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
import ActingAs from '../../contexts/ActingAs';
import { Quote } from '../../providers/QuoteGroupsProvider';

interface Props {
  quoteId: string;
  quote: Quote;
}

const QuoteActivityLogContainer: React.FC<Props> = ({ quoteId, quote }) => {
  const [actingAs, setActingAs] = useContext(ActingAs);

  const quoteActivityLogCollection = useFirestoreCollection(
    'quotes',
    useCallback(
      q => {
        let query = q;
        if (actingAs) {
          query = query.where('isInternal', '==', false);
        }
        return query.orderBy('at', 'desc');
      },
      [actingAs],
    ),
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
    (messageBody: string, mentions: MentionItem[], customerMessage: boolean) => {
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
            isInternal: customerMessage,
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
    <ActivityLogView
      activityLog={normalizedActivityLog}
      onCommentSave={handleCommentSave}
      quoteActivityLog={true}
      quote={quote}
    />
  );
};

export default QuoteActivityLogContainer;
