import React, { Fragment, useEffect } from 'react';
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import WriteComment from './WriteComment';
import Comment from './Comment';
import { ActivityLogUserData, ChecklistItem } from './ChecklistItemModel';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontSize: '1.4em',
      margin: theme.spacing(1),
    },
  }),
);
const Comments = ({ booking }: CommentsProps) => {
  const classes = useStyles();
  useEffect(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(booking?.id)
      .collection('activity')
      .get()
      .then(activity => {
        const activityItems = flow(get('docs'))(activity).map(
          (doc: any) => doc.data() as CommentEntity,
        ) as CommentEntity[];
        console.log('Activity items', activityItems);
      })
      .catch(err => console.log(err));
  }, [booking]);
  return (
    <Fragment>
      <Typography component="h2" className={classes.title}>
        Activity
      </Typography>
      <WriteComment bookingId={booking?.id} />
      {/*<Comment comment={{} as CommentEntity} />*/}
    </Fragment>
  );
};

export default Comments;

export interface CommentEntity {
  text: string;
  uploadedBy: ActivityLogUserData;
  commentedAt: Date;
}

interface CommentsProps {
  booking: Booking | undefined;
}
