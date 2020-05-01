import React from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import QuickSearchBooking from './QuickSearchBooking';
import QuickSearchContainer from './QuickSearchContainer';
import QuickSearchQuote from './QuickSearchQuote';

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

const NavBarQuickSearchDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Quick Search</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography>Find quote by:</Typography>
          <QuickSearchQuote label="Quote Id" fieldPath="id" handleClose={handleClose} />
          <Typography>Find booking by:</Typography>
          <QuickSearchBooking label="File number" fieldPath="ERP-BkgRef" handleClose={handleClose} />
          <QuickSearchBooking label="BL number" fieldPath="BL-No" handleClose={handleClose} />
          <QuickSearchBooking label="Customer's reference" fieldPath="StatClientRef" handleClose={handleClose} />
          <QuickSearchContainer label="Container number" fieldPath="container" handleClose={handleClose} />
          <QuickSearchContainer label="Delivery reference" fieldPath="deliveryRef" handleClose={handleClose} />
          <QuickSearchContainer label="Pickup reference" fieldPath="pickupRef" handleClose={handleClose} />
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default NavBarQuickSearchDialog;

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}
