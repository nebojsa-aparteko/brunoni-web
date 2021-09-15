import React, { Fragment } from 'react';
import { ListItem, ListItemAvatar } from '@material-ui/core';
import { ActivityLogItem } from './ActivityModel';
import ActivityComment from './ActivityComment';
import { Booking } from '../../../model/Booking';
import { ActivityLogAvatar } from './ActivityLogAvatar';
import { getFullName } from '../../../utilities/activityHelper';

const Comment = ({ activity, handleCommentClick, booking, ...other }: CommentProp) => {
  return (
    <Fragment>
      <ListItem
        style={{ cursor: handleCommentClick ? 'pointer' : 'initial' }}
        {...other}
        onClick={handleCommentClick}
        selected={activity.isInternal}
      >
        <ListItemAvatar>
          <ActivityLogAvatar name={getFullName(activity)} />
        </ListItemAvatar>
        <ActivityComment activity={activity} booking={booking} />
      </ListItem>
    </Fragment>
  );
};

export default Comment;

interface CommentProp {
  activity: ActivityLogItem;
  handleCommentClick?: () => void;
  booking?: Booking;
}
