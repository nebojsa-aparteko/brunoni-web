import React, { Fragment } from 'react';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import Comment from './Comment';
import Activity from './Activity';

export interface ActivityLogItemViewProps {
  activityItem: ActivityLogItem;
}

const ActivityLogItemView: React.FC<ActivityLogItemViewProps> = ({ activityItem }) => {
  return (
    <Fragment>
      {activityItem.type === ActivityType.COMMENT ? (
        <Comment comment={activityItem} key={activityItem.id} />
      ) : (
        <Activity activity={activityItem} key={activityItem.id} />
      )}
    </Fragment>
  );
};

export default ActivityLogItemView;
