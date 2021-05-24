import React, { useState } from 'react';
import { Box, Button, createStyles, List, makeStyles, Theme } from '@material-ui/core';
import { ChecklistItemValueDocument } from '../bookings/checklist/ChecklistItemModel';
import useDocuments from '../../hooks/useDocuments';
import BookingRequestDocumentListItem from './BookingRequestDocumentListItem';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { ActivityCreationProps } from '../bookings/checklist/ChecklistItemRow';
import { ActivityLogContextProps } from '../bookings/checklist/ActivityLogContext';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    documentList: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const BookingRequestDocumentList: React.FC<BookingRequestDocumentListProps> = ({
  collectionPath,
  shouldShowAll,
  storageBasePath,
  activityPath,
  documentsCount = 0,
  ...props
}) => {
  const classes = useStyles();
  const [shouldShowPrevious, setShouldShowPrevious] = useState<boolean | undefined>(shouldShowAll);
  const documents = useDocuments<ChecklistItemValueDocument>({
    collectionPath,
    shouldShowAllDocuments: shouldShowPrevious,
  });
  return (
    <List className={classes.documentList}>
      {documents?.map(document => (
        <BookingRequestDocumentListItem
          key={document.id}
          item={document}
          storageBasePath={storageBasePath}
          shouldHaveDeleteAction
          shouldHaveMentionInCommentAction
          collectionPath={collectionPath}
          activityPath={activityPath}
          {...props}
        />
      ))}
      {!shouldShowAll && documentsCount > 1 && (
        <Box display="flex" justifyContent="center">
          <Button
            color="default"
            size="small"
            startIcon={shouldShowPrevious ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            onClick={() => setShouldShowPrevious(prevState => !prevState)}
          >
            {shouldShowPrevious ? 'Show less' : 'Show more'}
          </Button>
        </Box>
      )}
    </List>
  );
};

export default BookingRequestDocumentList;

interface BookingRequestDocumentListProps {
  collectionPath: string;
  storageBasePath: string;
  activityPath: string;
  shouldShowAll?: boolean;
  additionalActivityFields?: Partial<ActivityCreationProps>;
  additionalMentionFields?: Partial<ActivityLogContextProps>;
  documentsCount?: number;
}
