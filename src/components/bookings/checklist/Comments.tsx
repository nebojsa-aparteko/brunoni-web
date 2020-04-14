import React, { Fragment, useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import WriteComment from './WriteComment';
import Comment from './Comment';
import { ActivityLogUserData } from './ChecklistItemModel';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontSize: '1.4em',
      margin: theme.spacing(1),
    },
  }),
);
const Comments = ({ booking, isInternal }: CommentsProps) => {
  const classes = useStyles();
  const [activitiesList, setActivitiesList] = useState<CommentEntity[]>([]);
  useEffect(() => {
    (async () => {
      const activityCollection = await firebase
        .firestore()
        .collection('bookings')
        .doc(booking?.id)
        .collection('activity')
        .orderBy('commentedAt')
        .get();
      activityCollection.query.onSnapshot({
        error: error => console.log(error),
        next: (snapshot: firebase.firestore.QuerySnapshot) => {
          const activityItems = flow(get('docs'))(snapshot).map(
            (doc: any) => doc.data() as CommentEntity,
          ) as CommentEntity[];
          const normalizeActivityItems = map(flow(update('commentedAt', invoke('toDate'))))(activityItems);
          setActivitiesList(normalizeActivityItems.filter(item => item.isInternal === isInternal));
        },
      });
    })();
  }, [booking]);
  return (
    <Fragment>
      <Typography component="h2" className={classes.title}>
        Activity
      </Typography>
      {activitiesList.map(activity => (
        <Comment comment={activity} />
      ))}
      <WriteComment bookingId={booking?.id} isInternal={isInternal} />
    </Fragment>
  );
};

export default Comments;

export interface CommentEntity {
  text: string;
  commentedBy: ActivityLogUserData;
  commentedAt: Date;
  type: ActivityType;
  isInternal: boolean;
}

interface CommentsProps {
  booking: Booking | undefined;
  isInternal: boolean;
}

export enum ActivityType {
  COMMENT,
  ACTIVITY,
}
