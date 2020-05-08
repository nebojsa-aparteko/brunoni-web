import React from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import QuickSearchQuote from '../quickSearch/QuickSearchQuote';
import QuickSearchBooking from '../quickSearch/QuickSearchBooking';
import UserInput from '../inputs/UserInput';
import useAdminUsers from '../../hooks/useAdminUsers';
import { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import TeamsTeamsChipMultiInput from '../teams/TeamsTeamsChipMultiInput';
import WatchersChipMultiInput from './WatchersChipMultiInput';

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

const WatchersDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
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
            <UserInput label="Assigned Agent" users={assignableUsers || []} onChange={user => console.log(user)} />
          </Box>
          <Box my={1}>
            <UserInput label="Assigned Client" users={assignableUsers || []} onChange={user => console.log(user)} />
          </Box>
          <Box my={1}>
            <WatchersChipMultiInput options={assignableUsers || []} onChange={event => console.log(event)} />
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
}
