import React, { useCallback } from 'react';
import { flow, isNil, omitBy } from 'lodash/fp';
import { MentionItem } from 'react-mentions';
import ActivityLogView from '../bookings/checklist/ActivityLogView';
import { ActivityType, QuoteActivityModel } from '../bookings/checklist/ActivityModel';
import { Quote } from '../../providers/QuoteGroupsProvider';
import firebase from '../../firebase';
import useActivities from '../../hooks/useActivities';
import useUser from '../../hooks/useUser';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';

interface Props {
  quoteId: string;
  quote: Quote;
}

const QuoteActivityLogContainer: React.FC<Props> = ({ quoteId, quote }) => {
  const [, , isAdmin] = useUser();
  const activities = useActivities(
    `/quotes/${quoteId}/activity`,
    useCallback(
      query => {
        let q = query;
        if (!isAdmin) {
          q = q.where('isInternal', '==', false);
        }
        return q.orderBy('at', 'desc');
      },
      [isAdmin],
    ),
  );

  const userActivityLogData = useActivityLogUserData();

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], customerMessage: boolean) => {
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
    [quoteId, userActivityLogData],
  );

  return (
    <ActivityLogView activityLog={activities} onCommentSave={handleCommentSave} quoteActivityLog={true} quote={quote} />
  );
};

export default QuoteActivityLogContainer;
