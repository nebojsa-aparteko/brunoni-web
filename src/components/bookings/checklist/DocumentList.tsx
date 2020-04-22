import React from 'react';
import { orderBy } from 'lodash/fp';
import { ChecklistItem, ChecklistItemValueDocument } from './ChecklistItemModel';
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

const DocumentList = ({ checklistItem, checklistItemValues, bookingId, removalInProgress, deleteFile }: Props) => {
  const classes = useStyles();

  return (
    <List className={classes.documentList}>
      {(orderBy('uploadedAt', 'desc')(checklistItemValues) as ChecklistItemValueDocument[]).map((item, index) => (
        <DocumentListItem
          key={`chklistitem-${index}`}
          item={item}
          bookingId={bookingId}
          index={index}
          removalInProgress={removalInProgress}
          deleteFile={deleteFile}
          checklistItem={checklistItem}
        />
      ))}
    </List>
  );
};

export default DocumentList;

export interface Props {
  checklistItem: ChecklistItem;
  checklistItemValues: ChecklistItemValueDocument[];
  bookingId: string;
  removalInProgress: boolean;
  deleteFile: (item: ChecklistItemValueDocument) => void;
}
