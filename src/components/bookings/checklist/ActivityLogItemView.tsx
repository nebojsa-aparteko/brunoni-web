import React, { Fragment } from 'react';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import Comment from './Comment';
import Activity from './Activity';

export interface ActivityLogItemViewProps {
  activityItem: ActivityLogItem;
}

const ActivityLogItemView: React.FC<ActivityLogItemViewProps> = ({ activityItem, ...other }) => {
  return (
    <Fragment {...other}>
      {activityItem.type === ActivityType.COMMENT ? (
        <Comment comment={activityItem} />
      ) : (
        <Activity activity={activityItem} />
      )}
    </Fragment>
  );
};

export default ActivityLogItemView;
