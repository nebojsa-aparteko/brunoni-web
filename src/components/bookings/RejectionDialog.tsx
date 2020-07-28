import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Booking } from '../../model/Booking';
import { MentionItem } from 'react-mentions';
import CommentInput from '../CommentInput';
import {
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatus,
  ChecklistItemValueDocumentStatusType,
} from './checklist/ChecklistItemModel';
import firebase from '../../firebase';
import { flow, isNil, omitBy } from 'lodash/fp';
import { ActivityLogItem, ActivityType } from './checklist/ActivityModel';
import { shortenedChecklist, shortenedDocumentValue } from '../../utilities/shortenedModel';
import UserRecordContext from '../../contexts/UserRecordContext';
import { addActivityItem } from './checklist/ActivityLogContainer';
import ActingAs from '../../contexts/ActingAs';

const useStyles = makeStyles(theme =>
  createStyles({
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
    dialogBody: {
      width: theme.spacing(100),
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
    },
    rejectionButton: {
      // color: '#fff',
      // backgroundColor: '#CA0B00',
    },
  }),
);

const RejectionDialog: React.FC<Props> = ({ isOpen, booking, handleClose, checklistItem, document, changeStatus }) => {
  const classes = useStyles();
  const [rejectionInput, setRejectionInput] = useState<RejectionInput | undefined>(undefined);
  const actingAs = useContext(ActingAs)[0];
  const onRejectionInputChange = useCallback((input: RejectionInput) => {
    setRejectionInput(input);
  }, []);
  const onReject = useCallback(() => {
    console.log(rejectionInput);
    handleCommentSave(rejectionInput!.message, rejectionInput!.mentions, !actingAs);
  }, [rejectionInput, actingAs]);
  const userRecord = useContext(UserRecordContext);

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], internal: boolean) => {
      const userActivityLogData = {
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData;

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
          changeStatus(document, {
            type: ChecklistItemValueDocumentStatusType.REJECTED,
            by: userActivityLogData,
            at: new Date(),
          });
          handleClose();
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [booking.id, userRecord, checklistItem, document],
  );
  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
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
            className={classes.rejectionButton}
            variant="contained"
            color="primary"
            disabled={!rejectionInput || rejectionInput?.messagePlain.length < 1}
          >
            Request amendment
          </Button>
        </DialogActions>
      </Box>
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
