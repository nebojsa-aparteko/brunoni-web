import React from 'react';
import { Box, createStyles, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { capitalCase } from 'change-case';
import { ActivityLogItem } from './ActivityModel';
import classNames from 'classnames';
import asArray from '../../../utilities/asArray';
import DateFormattedText from '../../DateFormattedText';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rowContainer: {
      display: 'flex',
      flex: 1,
      justifyContent: 'space-between',
    },
    name: {
      marginRight: theme.spacing(1),
    },
    comment: {
      padding: theme.spacing(1),
      flex: 1,
      whiteSpace: 'normal',
    },
    adminMessage: {
      backgroundColor: '#eee',
    },
  }),
);

const ActivityComment = ({ activity }: ActivityWithCommentProp) => {
  const classes = useStyles();
  return (
    <Paper className={classNames(classes.comment, activity.isInternal ? classes.adminMessage : '')}>
      <Box className={classes.rowContainer}>
        <Typography className={classes.name} color="textPrimary">
          {`${capitalCase(activity.by.firstName)} ${capitalCase(activity.by.lastName)}`}
        </Typography>
        <DateFormattedText date={activity.at} />
      </Box>
      {/*<div dangerouslySetInnerHTML={{ __html: htmlComment || comment?.comment! }} style={{ fontSize: 14 }} />*/}
      <Typography style={{ wordBreak: 'break-word' }}>{activity?.comment}</Typography>
      {activity.checklistItem && (
        <Box>
          Ref - <a href={`#${activity.checklistItem?.id}`}>{activity.checklistItem?.label}</a>
        </Box>
      )}
      {activity.documents && (
        <Box>
          Doc -{' '}
          {asArray(activity.documents).map(item => (
            <a href={`${item.url}`} key={`doc-${item.url}`} target="_blank" rel="noopener noreferrer">
              {item.name}
            </a>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ActivityComment;

interface ActivityWithCommentProp {
  activity: ActivityLogItem;
}
