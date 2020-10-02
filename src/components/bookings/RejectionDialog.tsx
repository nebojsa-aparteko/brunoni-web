import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  makeStyles,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloseIcon from '@material-ui/icons/Close';
import { Booking } from '../../model/Booking';
import { MentionItem } from 'react-mentions';
import {
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatus,
  ChecklistItemValueDocumentStatusType,
} from './checklist/ChecklistItemModel';
import { flow, isNil, omitBy } from 'lodash/fp';
import { ActivityLogItem, ActivityType } from './checklist/ActivityModel';
import { shortenedChecklist, shortenedDocumentValue } from '../../utilities/shortenedModel';
import UserRecordContext from '../../contexts/UserRecordContext';
import { addActivityItem } from './checklist/ActivityLogContainer';
import ActingAs from '../../contexts/ActingAs';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import ActivityLogItemView from './checklist/ActivityLogItemView';
import CommentInput from '../CommentInput';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import { formatDateSafe } from '../../utilities/formattingHelpers';

const useStyles = makeStyles(theme =>
  createStyles({
    dialogPaper: {
      minHeight: '100vh',
      maxHeight: '100vh',
      minWidth: '100vw',
      maxWidth: '100vw',
    },
    dialogTitleBar: {
      height: '48px',
    },
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogContent: {
      flex: 1,
      alignContent: 'stretch',
    },
    dialogActions: {
      height: '48px',
    },
    expansionPanelHeading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    expansionPanelContent: {
      flexDirection: 'column',
    },
    activityList: {
      maxHeight: '15vh',
      overflow: 'auto',
    },
    formControl: {
      marginTop: -4,
      marginRight: theme.spacing(4),
      minWidth: 400,
      height: 40,
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const sortByDate = (a: ChecklistItemValueDocument, b: ChecklistItemValueDocument) => {
  return b.uploadedAt.getTime() - a.uploadedAt.getTime();
};

const RejectionDialog: React.FC<Props> = ({
  isOpen,
  booking,
  handleClose,
  checklistItem,
  document,
  changeStatus,
  allDocuments,
  isComparisonDialog,
}) => {
  const classes = useStyles();
  const [amendmentRequested, setAmendmentRequested] = useState<boolean>(false);
  const [rejectionInput, setRejectionInput] = useState<RejectionInput | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  const userRecord = useContext(UserRecordContext);
  const [sortedDocuments, setSortedDocuments] = useState<ChecklistItemValueDocument[]>(
    allDocuments && allDocuments.length > 0 ? allDocuments.sort(sortByDate) : [],
  );

  useEffect(() => {
    setSortedDocuments(allDocuments && allDocuments.length > 0 ? allDocuments?.sort(sortByDate) : []);
  }, [allDocuments]);

  const [leftDocument, serLeftDocument] = useState<ChecklistItemValueDocument | undefined>(
    sortedDocuments && sortedDocuments.length > 0 ? sortedDocuments[0] : undefined,
  );
  const [rightDocument, serRightDocument] = useState<ChecklistItemValueDocument | undefined>(
    sortedDocuments && sortedDocuments.length > 0
      ? sortedDocuments.length > 1
        ? sortedDocuments[1]
        : sortedDocuments[0]
      : undefined,
  );

  const userActivityLogData = {
    firstName: userRecord?.firstName,
    lastName: userRecord?.lastName,
    alphacomClientId: userRecord?.alphacomClientId,
    alphacomId: userRecord?.alphacomId,
    emailAddress: userRecord?.emailAddress,
  } as ActivityLogUserData;

  const onRejectionInputChange = useCallback((input: RejectionInput) => {
    setRejectionInput(input);
  }, []);

  const onReject = useCallback(() => {
    handleCommentSave(rejectionInput!.message, rejectionInput!.mentions, !actingAs);
  }, [rejectionInput, actingAs]);

  const activityLogCollection = useFirestoreCollection(
    'bookings',
    useCallback(
      query => {
        const queryByItemFilter = query.where('type', '==', ActivityType.COMMENT);
        const queryByAdminRole = queryByItemFilter.where('isInternal', '==', false);
        return queryByAdminRole.orderBy('at', 'desc');
      },
      [actingAs],
    ),
    booking.id,
    'activity',
  );

  const normalizeActivity = flow(update('at', invoke('toDate')));

  const activityCollection = activityLogCollection?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityLogItem[];

  const filteredActivities = activityCollection?.filter(activity => activity.documents && activity.documents);

  const updateDocumentStatus = (newStatus: ChecklistItemValueDocumentStatusType) => {
    changeStatus(document, {
      type: newStatus,
      by: userActivityLogData,
      at: new Date(),
    });
    handleClose();
  };

  const handleApproveDocument = () => {
    updateDocumentStatus(ChecklistItemValueDocumentStatusType.APPROVED);
  };

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], internal: boolean) => {
      addActivityItem(
        booking.id,
        flow(omitBy(isNil))({
          type: ActivityType.COMMENT,
          comment: messageBody,
          at: new Date(),
          by: userActivityLogData,
          isInternal: internal,
          checklistItem: shortenedChecklist(checklistItem),
          documents: shortenedDocumentValue(document),
          mentions: mentions,
        } as ActivityLogItem),
      )
        .then(_ => {
          updateDocumentStatus(ChecklistItemValueDocumentStatusType.REJECTED);
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [booking.id, userRecord, checklistItem, document],
  );

  const handleChangeLeftDocument = (event: React.ChangeEvent<{ value: unknown }>) => {
    serLeftDocument(allDocuments?.find(doc => doc.url === (event.target.value as string)) || leftDocument);
  };

  const handleChangeRightDocument = (event: React.ChangeEvent<{ value: unknown }>) => {
    serRightDocument(allDocuments?.find(doc => doc.url === (event.target.value as string)) || rightDocument);
  };

  //TODO separate this into two components, one for each dialog
  return !isComparisonDialog ? (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md" fullWidth>
      <Box>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">{`Please enter needed correction on ${checklistItem.label} document`}</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <CommentInput booking={booking} onInputChange={onRejectionInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined" autoFocus>
            Cancel
          </Button>
          <Button
            onClick={onReject}
            variant="contained"
            color="primary"
            disabled={!rejectionInput || rejectionInput?.messagePlain.length < 1}
          >
            Request amendment
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  ) : (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-check-list"
      maxWidth="xl"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle disableTypography id="dialog-title-check-list" className={classes.dialogTitleBar}>
        {leftDocument && allDocuments ? (
          <FormControl className={classes.formControl}>
            <InputLabel>Left Document</InputLabel>
            <Select value={leftDocument?.url} onChange={handleChangeLeftDocument} MenuProps={MenuProps}>
              {allDocuments
                .filter(document => document.url !== rightDocument?.url)
                .map(document => (
                  <MenuItem key={document.url} value={document.url}>
                    {(document.name || document.storedName) +
                      ' (' +
                      formatDateSafe(document.uploadedAt, 'HH:MM - dd.MM.yyyy') +
                      ')'}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        ) : null}
        {rightDocument && allDocuments ? (
          <FormControl className={classes.formControl}>
            <InputLabel>Right Document</InputLabel>
            <Select value={rightDocument?.url} onChange={handleChangeRightDocument} MenuProps={MenuProps}>
              {allDocuments
                .filter(document => document.url !== leftDocument?.url)
                .map(document => (
                  <MenuItem key={document.url} value={document.url}>
                    {(document.name || document.storedName) +
                      ' (' +
                      formatDateSafe(document.uploadedAt, 'HH:MM - dd.MM.yyyy') +
                      ')'}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        ) : null}
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Grid
        container
        direction="column"
        spacing={1}
        className={classes.dialogContent}
        style={{ padding: 16, paddingLeft: 22 }}
      >
        <Grid container direction="row" spacing={1} style={{ flex: 1, width: '100%' }}>
          {leftDocument ? (
            <Grid item xs={12} md={6}>
              {leftDocument?.name
                .split('.')
                .pop()
                ?.toLowerCase() === 'pdf' ? (
                <object data={leftDocument.url} type="application/pdf" width="100%" height="100%">
                  <embed src={leftDocument.url} type="application/pdf" />
                </object>
              ) : (
                <Box style={{ height: '100%' }}>
                  <Typography style={{ marginTop: '45%' }}>
                    The comparing option is currently only available for PDF files. The same functionality for other
                    document types will be available soon.
                  </Typography>
                </Box>
              )}
            </Grid>
          ) : null}
          {rightDocument ? (
            <Grid item xs={12} md={6}>
              {rightDocument?.name
                .split('.')
                .pop()
                ?.toLowerCase() === 'pdf' ? (
                <object data={rightDocument.url} type="application/pdf" width="100%" height="100%">
                  <embed src={rightDocument.url} type="application/pdf" />
                </object>
              ) : (
                <Box style={{ height: '100%' }}>
                  <Typography style={{ marginTop: '45%' }}>
                    The comparing option is currently only available for PDF files. The same functionality for other
                    document types will be available soon.
                  </Typography>
                </Box>
              )}
            </Grid>
          ) : null}
        </Grid>
        <Grid item xs={12} md={12}>
          {amendmentRequested ? (
            <CommentInput booking={booking} onInputChange={onRejectionInputChange} />
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.expansionPanelHeading}>
                  {'Amendment comments (' + filteredActivities.length + ')'}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.expansionPanelContent}>
                <List className={classes.activityList}>
                  {filteredActivities?.map((activity: ActivityLogItem) => (
                    <ListItem key={`act-${activity.id}`} id={activity.id}>
                      <ActivityLogItemView activityItem={normalizeActivity(activity)} />
                    </ListItem>
                  ))}
                </List>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ) : null}
        </Grid>
      </Grid>
      <DialogActions className={classes.dialogActions}>
        {amendmentRequested ? (
          <React.Fragment>
            <Button onClick={() => setAmendmentRequested(false)} color="primary" variant="outlined" autoFocus>
              Cancel amendment
            </Button>
            <Button
              onClick={onReject}
              variant="contained"
              color="primary"
              disabled={!rejectionInput || rejectionInput?.messagePlain.length < 1}
            >
              Send request
            </Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Button onClick={handleClose} color="primary" variant="outlined" autoFocus>
              Cancel
            </Button>
            <Button onClick={() => setAmendmentRequested(true)} variant="contained" color="primary">
              Request amendment
            </Button>
            <Button onClick={handleApproveDocument} color="primary" variant="contained" autoFocus>
              Approve
            </Button>
          </React.Fragment>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RejectionDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  booking: Booking;
  document: ChecklistItemValueDocument;
  checklistItem: ChecklistItem;
  changeStatus: (item: ChecklistItemValueDocument, status: ChecklistItemValueDocumentStatus) => void;
  allDocuments?: ChecklistItemValueDocument[];
  isComparisonDialog: boolean;
}

export interface RejectionInput {
  message: string;
  messagePlain: string;
  mentions: MentionItem[];
}
