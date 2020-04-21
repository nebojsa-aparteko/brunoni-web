import React from 'react';
import { orderBy } from 'lodash/fp';
import { ChecklistItemValueDocument } from './ChecklistItemModel';
import DocumentListItem from './DocumentListItem';
import { createStyles, List, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    documentList: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const DocumentList = ({ checklistItemValues, bookingId, removalInProgress, deleteFile, handleMention }: Props) => {
  const classes = useStyles();

  return (
    <List className={classes.documentList}>
      {(orderBy('uploadedAt', 'desc')(checklistItemValues) as ChecklistItemValueDocument[]).map((item, index) => (
        <DocumentListItem
          item={item}
          bookingId={bookingId}
          index={index}
          removalInProgress={removalInProgress}
          deleteFile={deleteFile}
          handleMention={handleMention}
        />
      ))}
    </List>
  );
};

export default DocumentList;

export interface Props {
  checklistItemValues: ChecklistItemValueDocument[];
  bookingId: string;
  removalInProgress: boolean;
  deleteFile: (item: ChecklistItemValueDocument) => void;
  handleMention: () => void;
}
