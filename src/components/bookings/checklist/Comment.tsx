import React from 'react';
import { Box, createStyles, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import { capitalCase } from 'change-case';
import { ActivityLogItem } from './ActivityModel';
import classNames from 'classnames';
import asArray from '../../../utilities/asArray';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      padding: theme.spacing(1),
    },
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

/*const wrapTags = (text: string, regex: RegExp) => {
  const textArray = text.split(regex);
  let identifier;
  let name;
  return textArray.map((str, index) => {
    if (regex.test(str)) {
      identifier = str.match(/\((.*)\)/i);
      name = str.match(/\[(.*)\]/i);

      console.log('IDENTIFIER', name);
      return identifier && identifier[0]?.indexOf('@') === -1 ? (
        <Typography key={`typ-${index}`} style={{ fontWeight: 'bold' }}>{`@${name && name[1]}`}</Typography>
      ) : (
        <Link key={`commentid-${index}`} href={`mailto:${identifier && identifier[1]}`}>{`@${name && name[1]}`}</Link>
      );
    }
    return str;
  });
};*/

const Comment = ({ comment, ...other }: CommentProp) => {
  const classes = useStyles();
  return (
    <Box className={classes.container} {...other}>
      <Box className={classes.rowContainer}>
        <Avatar
          name={`${comment.by?.firstName} ${comment.by?.lastName}`}
          title={`${comment.by?.firstName} ${comment.by?.lastName}`}
          size="30"
          round={true}
        />
        <Box display="flex" flexDirection="column" flex={1} ml={1}>
          <Paper className={classNames(classes.comment, comment.isInternal ? classes.adminMessage : '')}>
            <Box className={classes.rowContainer}>
              <Typography className={classes.name} color="textPrimary">
                {`${capitalCase(comment.by.firstName)} ${capitalCase(comment.by.lastName)}`}
              </Typography>
              <Typography color="textSecondary" variant="caption">{`${formatDistanceToNowConfigured(
                comment.at,
              )}`}</Typography>
            </Box>
            <Typography style={{ wordBreak: 'break-word' }}>
              {/*{comment?.comment && wrapTags(comment!.comment, /(@\[.*\]\([a-zA-Z.0-9 ]*@[a-zA-Z ]*.\w*\))/)}*/}
              {comment?.comment} {/*&& wrapTags(comment!.comment, /(@\[.*\]\(.*\))/)*/}
            </Typography>
            {comment.checklistItem && (
              <Box>
                Ref - <a href={`#${comment.checklistItem?.id}`}>{comment.checklistItem?.label}</a>
              </Box>
            )}
            {comment.documents && (
              <Box>
                Doc -{' '}
                {asArray(comment.documents).map(item => (
                  <a href={`${item.url}`} key={`doc-${item.url}`} target="_blank" rel="noopener noreferrer">
                    {item.name}
                  </a>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Comment;

interface CommentProp {
  comment: ActivityLogItem;
  handleEdit?: () => void;
  handleDelete?: () => void;
}
