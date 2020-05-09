import React from 'react';
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
import UserRecord, { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import WatchersChipMultiInput from './WatchersChipMultiInput';
import firebase from '../../firebase';

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

const handleChangeAgent = (id: string, collection: string, user: UserRecord | null) =>
  firebase
    .firestore()
    .collection('bookings')
    .doc(id)
    .set(
      {
        BkgAgentContactEml: user?.emailAddress || '',
        BkgAgentContactTxt: `${user?.firstName} ${user?.lastName}` || '',
        BkgAgentContact: user?.alphacomId || '',
      },
      { merge: true },
    );

const handleChangeWatchers = (id: string, collection: string, watchers: UserRecord | UserRecord[] | null) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .update('watchers', watchers);

const WatchersDialog: React.FC<Props> = ({ id, collection, isOpen, handleClose, watchers }) => {
  const classes = useStyles();
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-watchers" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Quick Search</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box my={1}>
            <UserInput
              label="Assigned Agent"
              users={assignableUsers || []}
              onChange={user => handleChangeAgent(id, collection, user)}
            />
          </Box>
          <Box my={1}>
            <UserInput label="Assigned Client" users={assignableUsers || []} onChange={user => console.log(user)} />
          </Box>
          <Box my={1}>
            <WatchersChipMultiInput
              options={assignableUsers || []}
              onChange={(_, value) => handleChangeWatchers(id, collection, value)}
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
  isOpen: boolean;
  handleClose: () => void;
  id: string;
  collection: string;
  watchers: UserRecord[];
}
