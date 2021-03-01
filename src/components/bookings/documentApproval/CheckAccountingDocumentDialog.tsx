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
import { Booking } from '../../../model/Booking';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  DocumentValue,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import { RejectionInput } from './RejectionModal';
import ComparisonDialogContent from './ComparisonDialogContent';
import PaymentApprovalButton from '../accountingTab/PaymentApprovalButton';
import WeeklyPayment, { WeeklyPaymentStatus } from '../../../model/WeeklyPayment';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { MentionItem } from 'react-mentions';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { flow, isNil, omitBy } from 'lodash/fp';
import { ActivityLogItem, ActivityType } from '../checklist/ActivityModel';
import { shortenedDocumentValue } from '../../../utilities/shortenedModel';
import ActingAs from '../../../contexts/ActingAs';
import MarkThatSomethingIsWrongButton from '../../MarkThatSomethingIsWrongButton';

const useStyles = makeStyles(theme => ({
  dialogPaper: {
    minHeight: '100vh',
    maxHeight: '100vh',
    minWidth: '100vw',
    maxWidth: '100vw',
  },
  dialogTitleBar: {
    height: '48px',
  },
  fileNumber: {
    alignSelf: 'baseline',
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogContent: {
    display: 'flex',
    flexFlow: 'column',
  },
  dialogActions: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formControl: {
    marginTop: -4,
    marginRight: theme.spacing(4),
    minWidth: 400,
    height: 40,
  },
  button: {
    margin: '0px 8px',
    height: '36px',
  },
}));

const CheckAccountingDocumentDialog: React.FC<Props> = ({
  document,
  isOpen,
  booking,
  payment,
  handleClose,
  accountingDocuments,
  changeStatus,
  updateComponent,
}) => {
  const classes = useStyles();
  const [amendmentRequested, setAmendmentRequested] = useState<boolean>(false);
  const userRecord = useContext(UserRecordContext);
  const actingAs = useContext(ActingAs)[0];
  const [rejectionInput, setRejectionInput] = useState<RejectionInput | undefined>(undefined);

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

  const handleApproveDocument = () => {
    updateComponent?.();
    updateDocumentStatus(ChecklistItemValueDocumentStatusType.APPROVED);
  };

  const updateDocumentStatus = useCallback(
    (newStatus: ChecklistItemValueDocumentStatusType, dontCreateActivity?: boolean) => {
      changeStatus(
        document,
        {
          type: newStatus,
          by: userActivityLogData,
          at: new Date(),
        },
        dontCreateActivity,
      );
      updateComponent?.();
      handleClose();
    },
    [document, changeStatus, handleClose, userActivityLogData, updateComponent],
  );

  const handleCommentSave = useCallback(
    (messageBody: string, mentions: MentionItem[], internal: boolean) => {
      addActivityItem(
        booking.id,
        omitBy(isNil)({
          type: ActivityType.ACTIVITY_WITH_COMMENT,
          comment: messageBody,
          changeType: ActivityChangeType.DOCUMENT_STATUS_CHANGED,
          at: new Date(),
          by: userActivityLogData,
          isInternal: internal,
          isAccountingActivity: true,
          documents: [shortenedDocumentValue(document)],
          mentions: mentions,
        }) as ActivityLogItem,
      )
        .then(_ => {
          updateComponent?.();
          updateDocumentStatus(ChecklistItemValueDocumentStatusType.REJECTED, true);
          console.log('Success saving message');
        })
        .catch(err => console.log(err));
    },
    [booking.id, document, updateDocumentStatus, userActivityLogData, updateComponent],
  );

  const onReject = useCallback(() => {
    handleCommentSave(rejectionInput!.messagePlain, rejectionInput!.mentions, !actingAs);
  }, [rejectionInput, actingAs, handleCommentSave]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-check-list"
      maxWidth="xl"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle
        disableTypography
        id="dialog-title-check-list"
        className={classes.dialogTitleBar}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}
      >
        <Typography variant="h4" className={classes.fileNumber}>{`File No: ${booking.id}`}</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <ComparisonDialogContent
          booking={booking}
          document={document}
          leftDocument={undefined}
          rightDocument={document}
          onRejectionInputChange={onRejectionInputChange}
          amendmentRequested={amendmentRequested}
          isAccountingDialog={true}
        />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Grid container direction="row" style={{ display: 'flex' }}>
          <Grid
            item
            spacing={1}
            xs={amendmentRequested ? 12 : 9}
            style={{ display: 'flex', alignItems: 'top', justifyContent: 'center' }}
          >
            {payment && payment.status === WeeklyPaymentStatus.IN_PROGRESS && (
              <Box style={{ alignSelf: 'center' }}>
                <MarkThatSomethingIsWrongButton payment={payment} booking={booking} />
              </Box>
            )}
            {amendmentRequested ? (
              <React.Fragment>
                <Button
                  onClick={() => setAmendmentRequested(false)}
                  color="primary"
                  variant="outlined"
                  autoFocus
                  className={classes.button}
                >
                  Cancel amendment
                </Button>
                <Button
                  onClick={onReject}
                  variant="contained"
                  color="primary"
                  disabled={!rejectionInput || rejectionInput.messagePlain.trim() === ''}
                  className={classes.button}
                >
                  Send request
                </Button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Button onClick={handleClose} color="primary" variant="outlined" autoFocus className={classes.button}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setAmendmentRequested(true)}
                  variant="contained"
                  disabled={payment.status !== WeeklyPaymentStatus.IN_PROGRESS}
                  style={{
                    backgroundColor:
                      payment.status !== WeeklyPaymentStatus.IN_PROGRESS ? 'lightgray' : 'rgb(200,74,77)',
                    color: 'white',
                  }}
                  className={classes.button}
                >
                  Request amendment
                </Button>
                <Button
                  onClick={handleApproveDocument}
                  variant="contained"
                  autoFocus
                  disabled={payment.status !== WeeklyPaymentStatus.IN_PROGRESS}
                  style={{
                    backgroundColor:
                      payment.status !== WeeklyPaymentStatus.IN_PROGRESS ? 'lightgray' : 'rgba(0,200,81, 1)',
                    color: 'white',
                  }}
                  className={classes.button}
                >
                  Approve File
                </Button>
              </React.Fragment>
            )}
          </Grid>
          {!amendmentRequested ? (
            <Grid item xs={3}>
              <PaymentApprovalButton
                payment={payment}
                booking={booking}
                accountingDocuments={accountingDocuments}
                updateComponent={updateComponent}
              />
            </Grid>
          ) : null}
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default CheckAccountingDocumentDialog;

interface Props {
  document: ChecklistItemValueDocument;
  isOpen: boolean;
  handleClose: () => void;
  booking: Booking;
  payment: WeeklyPayment;
  accountingDocuments: DocumentValue[];
  changeStatus: (item: ChecklistItemValueDocument, status: DocumentValueStatus, dontCreateActivity?: boolean) => void;
  isAccountingDialog?: boolean;
  updateComponent?: () => void;
}
