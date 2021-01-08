import React, { Fragment } from 'react';
import { Box, Link, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import { ActivityLogItem } from './ActivityModel';
import { capitalCase } from 'change-case';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ActivityText,
  ChecklistItemValueDocumentStatusType,
} from './ChecklistItemModel';
import DateFormattedText from '../../DateFormattedText';

const createUsersRepresentation = (users: ActivityLogUserData[]) => {
  return users.map((user, index) => {
    return (
      <Fragment key={user.alphacomId}>
        {user.emailAddress ? (
          <Link href={`mailto:${user.emailAddress}`}>{`${user.firstName} ${user.lastName}`}</Link>
        ) : (
          user.firstName + ' ' + user.lastName
        )}
        {index === users.length - 1 ? '.' : ', '}
      </Fragment>
    );
  });
};

export const makeActivityRepresentation = (activity: ActivityLogItem) => {
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
      case ActivityChangeType.SELECT_FOR_COMPARISON:
        return ActivityText.SELECT_FOR_COMPARISON;
      case ActivityChangeType.UNSELECT_FOR_COMPARISON:
        return ActivityText.UNSELECT_FOR_COMPARISON;
      case ActivityChangeType.MARK_AS_FINAL:
        return ActivityText.MARK_AS_FINAL;
      case ActivityChangeType.UNMARK_AS_FINAL:
        return ActivityText.UNMARK_AS_FINAL;
      case ActivityChangeType.POSTPONE_PAYMENT:
        return ActivityText.POSTPONE_PAYMENT;
      case ActivityChangeType.APPROVE_PAYMENT:
        return ActivityText.APPROVE_PAYMENT;
      case ActivityChangeType.REVERT_PAYMENT_APPROVAL:
        return ActivityText.REVERT_PAYMENT_APPROVAL;
      case ActivityChangeType.PUT_ON_HOLD:
        return ActivityText.PUT_ON_HOLD;
      case ActivityChangeType.REVERT_PUT_ON_HOLD:
        return ActivityText.REVERT_PUT_ON_HOLD;
      case ActivityChangeType.SET_WATCHING:
        return ActivityText.SET_WATCHING;
      case ActivityChangeType.UNSET_WATCHING:
        return ActivityText.UNSET_WATCHING;
      case ActivityChangeType.ASSIGNED_AGENT:
        return ActivityText.ASSIGNED_AGENT;
      case ActivityChangeType.ASSIGNED_CLIENT:
        return ActivityText.ASSIGNED_CLIENT;
      case ActivityChangeType.SET_WATCHERS:
        return ActivityText.SET_WATCHERS;
      case ActivityChangeType.CLEAR_PAYMENT:
        return ActivityText.CLEAR_PAYMENT;
      case ActivityChangeType.REVERT_CLEAR_PAYMENT:
        return ActivityText.REVERT_CLEAR_PAYMENT;
    }
  };

  return (
    <Typography>
      <Link href={`mailto:${activity.by.emailAddress}`}>
        {`${capitalCase(activity.by.firstName)} ${capitalCase(activity.by.lastName)}`}
      </Link>
      {mapChangeTypeToText()}
      {activity.stage && ` '${activity.stage?.label}' stage `}
      {(activity.changeType === ActivityChangeType.ASSIGNED_AGENT ||
        activity.changeType === ActivityChangeType.ASSIGNED_CLIENT) &&
      activity.addedUsers
        ? createUsersRepresentation(activity.addedUsers)
        : null}
      {activity.changeType === ActivityChangeType.SET_WATCHERS ? (
        activity.addedUsers && activity.addedUsers.length > 0 ? (
          <Fragment>
            <Fragment>
              {'added to watchers '}
              {createUsersRepresentation(activity.addedUsers)}
            </Fragment>

            {activity.removedUsers && activity.removedUsers.length > 0 && (
              <Fragment>
                {' and removed '}
                {createUsersRepresentation(activity.removedUsers)}
              </Fragment>
            )}
          </Fragment>
        ) : (
          activity.removedUsers &&
          activity.removedUsers.length > 0 && (
            <Fragment>
              {'removed from watchers '}
              {createUsersRepresentation(activity.removedUsers)}
            </Fragment>
          )
        )
      ) : null}
      {activity.documents &&
        activity.documents.map((doc, index) => {
          return [
            ActivityChangeType.ADD_FILE,
            ActivityChangeType.SELECT_FOR_COMPARISON,
            ActivityChangeType.UNSELECT_FOR_COMPARISON,
            ActivityChangeType.MARK_AS_FINAL,
            ActivityChangeType.UNMARK_AS_FINAL,
            ActivityChangeType.DOCUMENT_STATUS_CHANGED,
          ].includes(activity.changeType as ActivityChangeType) ? (
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
      {(activity.changeType === ActivityChangeType.SELECT_FOR_COMPARISON ||
        activity.changeType === ActivityChangeType.UNSELECT_FOR_COMPARISON) &&
        ' for comparison'}
      {activity.changeType === ActivityChangeType.APPROVE_PAYMENT ||
      activity.changeType === ActivityChangeType.REVERT_PAYMENT_APPROVAL ||
      activity.changeType === ActivityChangeType.POSTPONE_PAYMENT ||
      activity.changeType === ActivityChangeType.PUT_ON_HOLD ||
      activity.changeType === ActivityChangeType.REVERT_PUT_ON_HOLD ||
      activity.changeType === ActivityChangeType.CLEAR_PAYMENT ||
      activity.changeType === ActivityChangeType.REVERT_CLEAR_PAYMENT
        ? activity.paymentReference
        : null}
      {activity.changeType !== ActivityChangeType.DONE_BY_CUSTOMER &&
      (activity.checklistItem || activity.isInternal || activity.isAccountingActivity)
        ? activity.changeType === ActivityChangeType.ADD_FILE
          ? ' into '
          : ' from '
        : null}

      {activity.checklistItem ? (
        <Fragment>
          <Link href={`#${activity.checklistItem.id}`}>{` ${activity.checklistItem.label}`}</Link> item.
        </Fragment>
      ) : !activity.isAccountingActivity ? (
        activity.isInternal ? (
          'Internal storage.'
        ) : null
      ) : (
        'Accounting.'
      )}
    </Typography>
  );
};

const Activity = ({ activity, ...other }: Props) => {
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
