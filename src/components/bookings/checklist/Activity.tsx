import React, { Fragment } from 'react';
import { Box, Link, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ActivityLogItem } from './ActivityModel';
import { capitalCase } from 'change-case';
import { ActivityChangeType, ActivityText } from './ChecklistItemModel';

const makeActivityRepresentation = (activity: ActivityLogItem) => {
  const makeStyledString = (activity: ActivityLogItem, index: number) =>
    activity.documents && index !== activity.documents?.length - 1 ? ', ' : ' ';
  const mapChangeTypeToText = (): ActivityText | undefined => {
    switch (activity.changeType) {
      case ActivityChangeType.CHECKED:
        return activity.checklistItem.checked ? ActivityText.CHECKED : ActivityText.UNCHECKED;
      case ActivityChangeType.ADD_FILE:
        return activity.documents!.length > 1 ? ActivityText.ADD_FILES : ActivityText.ADD_FILE;
      case ActivityChangeType.DELETE_FILE:
        return ActivityText.DELETE_FILE;
      case ActivityChangeType.STAGE_CHECKED:
        return activity.stage!.checked ? ActivityText.CHECKED : ActivityText.UNCHECKED;
    }
  };
  return (
    <Typography>
      <Link href={`mailto:${activity.by.emailAddress}`}>
        {`${capitalCase(activity.by.firstName)} ${capitalCase(activity.by.lastName)}`}
      </Link>
      {mapChangeTypeToText()}
      {activity.stage && ` '${activity.stage?.label}' stage in `}
      {activity.documents &&
        activity.documents.map((doc, index) => {
          return [ActivityChangeType.ADD_FILE].includes(activity.changeType as ActivityChangeType) ? (
            <Fragment>
              <Link href={doc.url}>{doc.name}</Link>
              {makeStyledString(activity, index)}
            </Fragment>
          ) : (
            `${doc.name} `
          );
        })}
      {activity.documents && 'from '}
      <Link href={`#${activity.checklistItem.id}`}>{` ${activity.checklistItem.label}`}</Link> item.
    </Typography>
  );
};

const Activity = ({ activity }: Props) => (
  <Box display="flex" flexDirection="row" mx={1} my={2} alignContent="center">
    <Avatar
      name={`${activity.by.firstName} ${activity.by.lastName}`}
      title={`${activity.by.firstName} ${activity.by.lastName}`}
      size="40"
      round={true}
    />
    <Box display="flex" flexDirection="column" ml={1}>
      {/*<Typography variant="body1">{activity.comment}</Typography>*/}
      {makeActivityRepresentation(activity)}
      <Typography color="textSecondary" variant="caption">{`${formatDistanceToNow(activity.at)} ago`}</Typography>
    </Box>
  </Box>
);

export default Activity;

interface Props {
  activity: ActivityLogItem;
}
