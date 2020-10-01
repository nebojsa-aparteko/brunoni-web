import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
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

const useStyles = makeStyles(theme =>
  createStyles({
    dialogPaper: {
      minHeight: '100vh',
      maxHeight: '100vh',
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
      paddingBottom: theme.spacing(3),
    },
  }),
);

const RejectionDialog: React.FC<Props> = ({ isOpen, booking, handleClose, checklistItem, document, changeStatus }) => {
  const classes = useStyles();
  const [amendmentRequested, setAmendmentRequested] = useState<boolean>(false);
  const [rejectionInput, setRejectionInput] = useState<RejectionInput | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  const userRecord = useContext(UserRecordContext);

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
  return !actingAs ? (
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
      className={classes.dialogPaper}
    >
      <DialogTitle disableTypography id="dialog-title-check-list" className={classes.dialogTitleBar}>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Grid container direction="column" spacing={1}>
          <Grid item xs={12}>
            <Grid container direction="row" spacing={1}>
              <Grid item xs={12} md={6}>
                <object data={document.url} type="application/pdf" width="100%" height="420">
                  <embed src={document.url} type="application/pdf" />
                </object>
              </Grid>
              <Grid item xs={12} md={6}>
                <object data={document.url} type="application/pdf" width="100%" height="420">
                  <embed src={document.url} type="application/pdf" />
                </object>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={12}>
            {amendmentRequested ? (
              <CommentInput booking={booking} onInputChange={onRejectionInputChange} />
            ) : (
              filteredActivities?.map((activity: ActivityLogItem) => (
                <Box id={activity.id} key={`act-${activity.id}`}>
                  <ActivityLogItemView activityItem={normalizeActivity(activity)} />
                </Box>
              ))
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
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
}

export interface RejectionInput {
  message: string;
  messagePlain: string;
  mentions: MentionItem[];
}
