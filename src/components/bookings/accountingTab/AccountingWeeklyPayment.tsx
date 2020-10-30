import WeeklyPayment, { DebitCredit, Status } from '../../../model/WeeklyPayment';
import {
  Box,
  Button,
  Container,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import safeInvoke from '../../../utilities/safeInvoke';
import currencyFormatter from '../../../utilities/currencyFormatter';
import DocumentListItem from '../checklist/DocumentListItem';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItemValueDocumentStatusType,
  DocumentValue,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Booking } from '../../../model/Booking';
import { editRestriction } from '../checklist/CheckList';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { createActivityObject } from '../checklist/ChecklistItemRow';
import firebase from '../../../firebase';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import useAccountingDocuments from '../../../hooks/useAccountingDocuments';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { showCrispChat } from '../../../index';
import ConfirmationDialog from '../../ConfirmationDialog';
import DropZone from '../../DropZone';

const addAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc()
    .set(file);
};

const deleteAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc(file.id)
    .delete();
};

const changeAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc(file.id)
    .update(file);
};

const changeWeeklyPayment = (updatedPayment: WeeklyPayment) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(updatedPayment.reference)
    .update(updatedPayment);
};

interface PostponeMenuProps {
  anchorEl: any;
  handleClose: () => void;
  changePayment: (offset: number) => void;
}

const PostponeMenu: React.FC<PostponeMenuProps> = ({ anchorEl, handleClose, changePayment }) => {
  return (
    <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
      <MenuItem onClick={() => changePayment(-7)}>1 Week Earlier</MenuItem>
      <MenuItem onClick={() => changePayment(7)}>1 Week Later</MenuItem>
    </Menu>
  );
};

const AccountingWeeklyPayment = ({ payment, booking }: AccountingWeeklyPaymentProps) => {
  const userRecord = useContext(UserRecordContext);
  const accountingDocuments = useAccountingDocuments(payment.reference);
  const { enqueueSnackbar } = useSnackbar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClickMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = useCallback(() => {
    showCrispChat(true);
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(() => {
    showCrispChat(false);
    setIsDialogOpen(true);
  }, [setIsDialogOpen]);

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', booking.ForwAdrId, 'bookings', booking.id, 'accounting-documents'].join(
      '/',
    );
  }, [booking]);

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const handleAddFile = useCallback(
    (addedFiles: DocumentValue[]) => {
      return Promise.all(addedFiles.map(file => addAccountingDocument(file, payment.reference)))
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              ActivityChangeType.ADD_FILE,
              getActivityLogUserData(),
              undefined,
              addedFiles,
              undefined,
              undefined,
              true,
            ),
          ),
        )
        .catch(error => console.error('Error saving new document list', error));
    },
    [booking, getActivityLogUserData, payment.reference],
  );

  const handleDeleteFile = useCallback(
    (deletedFile: DocumentValue) => {
      return Promise.resolve(deleteAccountingDocument(deletedFile, payment.reference))
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              ActivityChangeType.DELETE_FILE,
              getActivityLogUserData(),
              undefined,
              [deletedFile],
              undefined,
              undefined,
              true,
            ),
          ),
        )
        .catch(error => console.error('Error during document deletion', error));
    },
    [booking, getActivityLogUserData, payment.reference],
  );

  const storeAccountingActivity = useCallback(
    (accountingActivityHandler: () => Promise<void>) => {
      accountingActivityHandler()
        .then(_ => {
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1500,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        });
    },
    [enqueueSnackbar],
  );

  const handleDocumentStatusChange = useCallback(
    (item: DocumentValue, status: DocumentValueStatus) => {
      if (item.status && !editRestriction(item.status!.at as Date)) {
        return enqueueSnackbar(
          <Typography color="inherit">
            {`Failed to edit item - You cant change status after ${process.env.EDIT_RESTRICTION_TIME} from last change!`}
          </Typography>,
          {
            variant: 'error',
            autoHideDuration: 1000,
          },
        );
      }
      const newItem: DocumentValue = { ...item, status: status };

      storeAccountingActivity(() =>
        changeAccountingDocument(newItem, payment.reference).then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              ActivityChangeType.DOCUMENT_STATUS_CHANGED,
              getActivityLogUserData(),
              undefined,
              [newItem],
              undefined,
              true,
              true,
            ),
          ),
        ),
      );
    },
    [payment.reference, booking, enqueueSnackbar, getActivityLogUserData, storeAccountingActivity],
  );

  const handleChangePayDate = useCallback(
    (offset: number) => {
      const newDate = safeInvoke('toDate')(payment.payDate).getDate() + offset;
      const updatedPayment = { ...payment, payDate: new Date(safeInvoke('toDate')(payment.payDate).setDate(newDate)) };

      return Promise.resolve(changeWeeklyPayment(updatedPayment)).then(_ => {
        handleClose();
        storeAccountingActivity(() =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              ActivityChangeType.POSTPONE_PAYMENT,
              getActivityLogUserData(),
              undefined,
              undefined,
              undefined,
              undefined,
              true,
              payment.reference,
            ),
          ),
        );
      });
    },
    [payment, booking, getActivityLogUserData, storeAccountingActivity],
  );

  const handleChangePaymentStatus = useCallback(
    (newStatus: Status) => {
      const updatedPayment: WeeklyPayment = { ...payment, status: newStatus };
      const activityType: ActivityChangeType =
        newStatus === Status.APPROVED ? ActivityChangeType.APPROVE_PAYMENT : ActivityChangeType.REVERT_PAYMENT_APPROVAL;
      return Promise.resolve(changeWeeklyPayment(updatedPayment)).then(_ => {
        handleDialogClose();
        storeAccountingActivity(() =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              activityType,
              getActivityLogUserData(),
              undefined,
              undefined,
              undefined,
              undefined,
              true,
              payment.reference,
            ),
          ),
        );
      });
    },
    [payment, booking, getActivityLogUserData, storeAccountingActivity, handleDialogClose],
  );

  return (
    <ExpansionPanel key={payment.reference} style={{ margin: 4 }}>
      <ExpansionPanelSummary style={{ backgroundColor: 'rgba(198,238,241,0.24)', display: 'flex' }}>
        <Box flex={1} display="flex" flexDirection="row" justifyContent="space-between">
          <Typography variant={'h5'}>
            {formatDateSafe(safeInvoke('toDate')(payment.payDate), 'd. MMMM yyyy.')}
          </Typography>
          <Typography variant={'h5'}>
            {'Amount: ' +
              (payment.debitCredit === DebitCredit.CREDIT
                ? currencyFormatter(payment.currency)(-payment.amount)
                : currencyFormatter(payment.currency)(payment.amount))}
          </Typography>
          <Typography
            variant={'h5'}
            style={{ fontWeight: 700, color: payment.status === Status.PAID ? 'rgba(0,200,81)' : '#000' }}
          >
            {payment.status}
          </Typography>
        </Box>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Box display="flex" flex={1} flexDirection="column" px={0} style={{ listStyle: 'none' }}>
          <Box p={2}>
            <Typography variant={'h5'}>{'Reference Id: ' + payment.reference}</Typography>
            <Typography variant={'h5'}>{'Type: ' + payment.debitCredit}</Typography>
          </Box>
          {!accountingDocuments ? (
            <Container>
              <ChartsCircularProgress />
            </Container>
          ) : (
            accountingDocuments.map(item => (
              <DocumentListItem
                key={item.id}
                item={item}
                booking={booking}
                storageBasePath={storageBasePath}
                changeStatus={(item: DocumentValue, status: DocumentValueStatus) =>
                  handleDocumentStatusChange(item, status)
                }
                deleteFile={(item: DocumentValue) => handleDeleteFile(item)}
                internal={true}
                isAccountingDocument={true}
                markAsFinal={() => {}}
                comparableDocuments={[]}
                selectForComparison={() => {}}
                paymentStatus={payment.status}
              />
            ))
          )}
          {payment.status === Status.IN_PROGRESS && (
            <DropZone
              storageBasePath={storageBasePath}
              internal={false}
              onUpload={values => storeAccountingActivity(() => handleAddFile(values))}
              onDelete={() => {}}
            />
          )}
        </Box>
      </ExpansionPanelDetails>
      <ExpansionPanelActions>
        {payment.status === Status.IN_PROGRESS && (
          <React.Fragment>
            <Button onClick={handleClickMenu} color="primary" variant="outlined">
              Postpone Payment
            </Button>
            <Button
              onClick={handleDialogOpen}
              color="primary"
              variant="contained"
              disabled={
                payment.status !== Status.IN_PROGRESS ||
                !(accountingDocuments && accountingDocuments.length > 0
                  ? accountingDocuments.every(
                      document => document.status?.type === ChecklistItemValueDocumentStatusType.APPROVED,
                    )
                  : false)
              }
            >
              Approve Payment
            </Button>
          </React.Fragment>
        )}
        {payment.status === Status.APPROVED && (
          <Button onClick={handleDialogOpen} color="primary" variant="outlined">
            Revert Approval
          </Button>
        )}
      </ExpansionPanelActions>
      <PostponeMenu anchorEl={anchorEl} handleClose={handleClose} changePayment={handleChangePayDate} />
      {isDialogOpen && (
        <ConfirmationDialog
          isOpen={isDialogOpen}
          label={
            payment.status === Status.IN_PROGRESS
              ? 'Please confirm payment approval'
              : 'Please confirm approvement reversal'
          }
          handleConfirm={() =>
            handleChangePaymentStatus(payment.status === Status.IN_PROGRESS ? Status.APPROVED : Status.IN_PROGRESS)
          }
          handleClose={handleDialogClose}
        />
      )}
    </ExpansionPanel>
  );
};

interface AccountingWeeklyPaymentProps {
  payment: WeeklyPayment;
  booking: Booking;
}

export default AccountingWeeklyPayment;
