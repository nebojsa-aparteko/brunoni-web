import React, { Fragment, useState } from 'react';
import { Box, Link, Tooltip, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import { ActivityLogItem } from './ActivityModel';
import { capitalCase } from 'change-case';
import { ActivityChangeType, ActivityText, ChecklistItemValueDocumentStatusType } from './ChecklistItemModel';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';
import formatDate from 'date-fns/format';
import DateFormattedText from '../../DateFormattedText';

const makeActivityRepresentation = (activity: ActivityLogItem) => {
  const makeStyledString = (activity: ActivityLogItem, index: number) =>
    activity.documents && index !== activity.documents?.length - 1 ? ', ' : ' ';
  const mapChangeTypeToText = (): ActivityText | undefined => {
    switch (activity.changeType) {
      case ActivityChangeType.CHECKED:
        return activity?.checklistItem?.checked ? ActivityText.CHECKED : ActivityText.UNCHECKED;
      case ActivityChangeType.ADD_FILE:
        return activity.documents!.length > 1 ? ActivityText.ADD_FILES : ActivityText.ADD_FILE;
      case ActivityChangeType.DELETE_FILE:
        return ActivityText.DELETE_FILE;
      case ActivityChangeType.STAGE_CHECKED:
        return activity.stage!.checked ? ActivityText.CHECKED : ActivityText.UNCHECKED;
      case ActivityChangeType.DOCUMENT_STATUS_CHANGED:
        return activity.documents?.[0]?.status?.type === ChecklistItemValueDocumentStatusType.DEFAULT
          ? ActivityText.DEFAULTED_FILE
          : activity.documents?.[0]?.status?.type === ChecklistItemValueDocumentStatusType.APPROVED
          ? ActivityText.APPROVED_FILE
          : ActivityText.REJECTED_FILE;
      case ActivityChangeType.DONE_BY_CUSTOMER:
        return ActivityText.DONE_BY_CUSTOMER;
      case ActivityChangeType.UNDO_COMPLETED_CUSTOMER:
        return ActivityText.UNDO_COMPLETED_CUSTOMER;
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
            <Fragment key={doc.url}>
              <Link href={doc.url} target="_blank">
                {doc.name}
              </Link>
              {makeStyledString(activity, index)}
            </Fragment>
          ) : (
            `${doc.name} `
          );
        })}
      {activity.documents ? (activity.changeType === ActivityChangeType.ADD_FILE ? ' into ' : 'from ') : null}
      {activity.checklistItem ? (
        <Fragment>
          <Link href={`#${activity.checklistItem.id}`}>{` ${activity.checklistItem.label}`}</Link> item.
        </Fragment>
      ) : (
        'Internal storage.'
      )}
    </Typography>
  );
};

const Activity = ({ activity, ...other }: Props) => {
  const [isFullDateFormat, setIsFullDateFormat] = useState(false);
  return (
    <Box display="flex" flexDirection="row" mx={1} my={2} alignContent="center" {...other}>
      <Avatar
        name={`${activity.by.firstName} ${activity.by.lastName}`}
        title={`${activity.by.firstName} ${activity.by.lastName}`}
        size="40"
        round={true}
      />
      <Box display="flex" flexDirection="column" ml={1}>
        {makeActivityRepresentation(activity)}
        <DateFormattedText date={activity.at} />
      </Box>
    </Box>
  );
};

export default Activity;

interface Props {
  activity: ActivityLogItem;
}
