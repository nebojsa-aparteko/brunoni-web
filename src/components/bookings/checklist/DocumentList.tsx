import React from 'react';
import { orderBy } from 'lodash/fp';
import { ChecklistItemValueDocument } from './ChecklistItemModel';
import DocumentListItem, { DocumentListItemPropsBase } from './DocumentListItem';
import { createStyles, List, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    documentList: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const DocumentList = ({
  checklistItem,
  checklistItemValues,
  bookingId,
  storageBasePath,
  changeStatus,
  internal,
}: Props) => {
  const classes = useStyles();

  return (
    <List className={classes.documentList}>
      {(orderBy('uploadedAt', 'desc')(checklistItemValues) as ChecklistItemValueDocument[]).map((item, index) => (
        <DocumentListItem
          key={item.storedName}
          item={item}
          bookingId={bookingId}
          storageBasePath={storageBasePath}
          checklistItem={checklistItem}
          changeStatus={changeStatus}
          internal={internal}
        />
      ))}
    </List>
  );
};

export default DocumentList;

export interface Props extends DocumentListItemPropsBase {
  checklistItemValues: ChecklistItemValueDocument[];
}
