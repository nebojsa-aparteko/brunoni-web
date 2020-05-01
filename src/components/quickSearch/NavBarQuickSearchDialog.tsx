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
      width: theme.spacing(100),
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
          <QuickSearchQuote label="Quote Id" fieldPath="id" />
          <Typography>Find booking by:</Typography>
          <QuickSearchBooking label="File number" fieldPath="ERP-BkgRef" />
          <QuickSearchBooking label="BL number" fieldPath="BL-No" />
          <QuickSearchBooking label="Customer's reference" fieldPath="StatClientRef" />
          <QuickSearchContainer label="Container number" fieldPath="container" />
          <QuickSearchContainer label="Delivery reference" fieldPath="deliveryRef" />

          <FormControl className={classes.formControl}>
            <TextField
              id="input-pickup-ref"
              label="Pickup reference"
              margin="normal"
              variant="outlined"
              className={classes.searchInput}
            />
            <IconButton aria-label="delete" color="primary">
              <SearchIcon />
            </IconButton>
          </FormControl>
          <FormControl className={classes.formControl}>
            <TextField
              id="input-voyage-vessel"
              label="Vessel including Voyage"
              margin="normal"
              variant="outlined"
              className={classes.searchInput}
            />
            <IconButton aria-label="delete" color="primary">
              <SearchIcon />
            </IconButton>
          </FormControl>
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
