import React, { Fragment, useMemo, useState } from 'react';
import { orderBy } from 'lodash/fp';
import { ChecklistItemValueDocument } from './ChecklistItemModel';
import DocumentListItem, { DocumentListItemPropsBase } from './DocumentListItem';
import { Button, createStyles, List, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    documentList: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const DocumentList: React.FC<Props> = ({
  checklistItem,
  checklistItemValues,
  booking,
  storageBasePath,
  changeStatus,
  internal,
  markAsFinal,
  comparableDocuments,
  selectForComparison,
}) => {
  const classes = useStyles();
  const [shouldShowPrevious, setShouldShowPrevious] = useState<boolean>(false);
  const sortedList = useMemo(() => orderBy('uploadedAt', 'desc')(checklistItemValues) as ChecklistItemValueDocument[], [
    checklistItemValues,
  ]);
  return (
    <List className={classes.documentList}>
      {internal || shouldShowPrevious ? (
        sortedList.map(item => (
          <DocumentListItem
            key={item.storedName}
            item={item}
            booking={booking}
            storageBasePath={storageBasePath}
            checklistItem={checklistItem}
            changeStatus={changeStatus}
            internal={internal}
            markAsFinal={markAsFinal}
            comparableDocuments={comparableDocuments}
            selectForComparison={selectForComparison}
          />
        ))
      ) : sortedList[0] ? (
        <Fragment>
          <DocumentListItem
            key={sortedList[0].storedName}
            item={sortedList[0]}
            booking={booking}
            storageBasePath={storageBasePath}
            checklistItem={checklistItem}
            changeStatus={changeStatus}
            internal={internal}
            markAsFinal={markAsFinal}
            comparableDocuments={comparableDocuments}
            selectForComparison={selectForComparison}
          />
        </Fragment>
      ) : null}
      {!internal && sortedList.length > 1 && (
        <Button
          size="small"
          color="primary"
          // startIcon={shouldShowPrevious ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          onClick={() => setShouldShowPrevious(prevState => !prevState)}
        >
          {shouldShowPrevious ? 'Show less' : 'Show more'}
        </Button>
      )}
    </List>
  );
};

export default DocumentList;

export interface Props extends DocumentListItemPropsBase {
  checklistItemValues: ChecklistItemValueDocument[];
}
