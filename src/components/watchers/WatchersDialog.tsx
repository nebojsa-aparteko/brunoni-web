import React, { useCallback, useContext } from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import UserInput from '../inputs/UserInput';
import useAdminUsers from '../../hooks/useAdminUsers';
import { CUSTOMER_FACING_ROLES, UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import WatchersChipMultiInput from './WatchersChipMultiInput';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';
import useClientUsers from '../../hooks/useClientUsers';
import pick from 'lodash/fp/pick';
import uniqBy from 'lodash/fp/uniqBy';
import asArray from '../../utilities/asArray';
import { GlobalContext } from '../../store/GlobalStore';
import { SHOW_ERROR_SNACKBAR, SHOW_SUCCESS_SNACKBAR } from '../../store/types/globalAppState';

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
      minWidth: theme.spacing(100),
      width: 'auto',
      minHeight: theme.spacing(60),
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      flexDirection: 'column',
    },
    formControl: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& *': {
        margin: `0 ${theme.spacing(1)}`,
      },
    },
    searchInput: {
      flex: 1,
    },
  }),
);

const handleChangeAgent = (id: string, user: UserRecordMin | null, watchers: UserRecordMin[] | null) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(id)
    .set(
      {
        BkgAgentContactEml: user?.emailAddress || '',
        BkgAgentContactTxt: `${user?.firstName} ${user?.lastName}` || '',
        BkgAgentContact: user?.alphacomId || '',
        assignedUser: user ? pick(UserRecordMinProperties)(user) : null,
        watchers: uniqBy((item: UserRecordMin) => item.alphacomId)(
          (watchers || []).concat(user ? (pick(UserRecordMinProperties)(user) as UserRecordMin) : []),
        ),
      },
      { merge: true },
    );

const handleChangeCustomer = (id: string, user: UserRecordMin | null, watchers: UserRecordMin[]) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(id)
    .set(
      {
        ForwPersID: user?.alphacomId || '',
        ForwarderPersTxt: `${user?.firstName || ''} ${user?.lastName || ''}`,
        assignedCustomerUser: user ? pick(UserRecordMinProperties)(user) : null,
        watchers: uniqBy((item: UserRecordMin) => item.alphacomId)(
          (watchers || []).concat(user ? (pick(UserRecordMinProperties)(user) as UserRecordMin) : []),
        ),
      },
      { merge: true },
    );

const handleChangeWatchers = (
  id: string,
  watchers: UserRecordMin | UserRecordMin[] | null,
  assignedUser: UserRecordMin | null,
  assignedCustomerUser: UserRecordMin | null,
) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(id)
    .update(
      'watchers',
      uniqBy((item: UserRecordMin) => item.alphacomId)(
        asArray(watchers)
          .concat(assignedUser || [])
          .concat(assignedCustomerUser || []),
      ).map(item => pick(UserRecordMinProperties)(item)),
    );

const WatchersDialog: React.FC<Props> = ({ booking, isOpen, handleClose }) => {
  const classes = useStyles();
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);
  const assignableCustomers = useClientUsers(booking.ForwAdrId);
  const [, dispatch] = useContext(GlobalContext);

  const watchers = booking.watchers
    ? booking.watchers.filter(
        user => user.alphacomId !== booking.ForwAdrId && user.alphacomId !== booking.BkgAgentContact,
      )
    : [];

  const handleResponse = useCallback(
    (fn: Promise<any>) => {
      fn.then(_ => dispatch({ message: 'Saved user successfully!', type: SHOW_SUCCESS_SNACKBAR })).catch(error =>
        dispatch({ type: SHOW_ERROR_SNACKBAR, message: `There was an error ${error}` }),
      );
    },
    [dispatch],
  );
  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-watchers" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Watchers</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box my={1}>
            <UserInput
              value={
                booking.assignedUser || {
                  alphacomId: booking.BkgAgentContact || '',
                  firstName: booking.BkgAgentContactTxt || '',
                  lastName: '',
                }
              }
              label="Assigned Agent"
              users={assignableUsers || []}
              onChange={(_, user) => handleResponse(handleChangeAgent(booking.id, user, booking.watchers))}
            />
          </Box>
          <Box my={1}>
            <UserInput
              value={
                booking.assignedCustomerUser || {
                  alphacomId: booking.ForwPersID || '',
                  alphacomClientId: booking.ForwAdrId,
                  firstName: booking.ForwarderPersTxt || '',
                  lastName: '',
                }
              }
              label="Assigned Client"
              users={assignableCustomers || []}
              onChange={(_, user) => handleResponse(handleChangeCustomer(booking.id, user, booking.watchers))}
            />
          </Box>
          <Box my={1}>
            <WatchersChipMultiInput
              options={assignableUsers || []}
              onChange={(_, value) => {
                handleResponse(
                  handleChangeWatchers(booking.id, value, booking.assignedUser, booking.assignedCustomerUser),
                );
              }}
              values={watchers}
            />
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default WatchersDialog;

interface Props {
  booking: Booking;
  isOpen: boolean;
  handleClose: () => void;
  id: string;
}
