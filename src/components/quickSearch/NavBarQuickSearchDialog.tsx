import React, { useContext } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import QuickSearchBooking from './QuickSearchBooking';
import QuickSearchQuote from './QuickSearchQuote';
import firebase from '../../firebase';
import ActingAs from '../../contexts/ActingAs';
import UserRecordContext from '../../contexts/UserRecordContext';

const useStyles = makeStyles(theme => ({
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
}));

const getBookingIds = async (
  collection: string,
  fieldPath: string,
  inputValue: string,
  opStr: firebase.firestore.WhereFilterOp = '==',
  isAdmin: boolean,
  clientId?: string,
) => {
  if (isAdmin && !clientId)
    return new Promise<string[]>((resolve, reject) => reject('No booking found'));
  const searchRef = isAdmin
    ? firebase.firestore().collection(collection)
    : firebase.firestore().collection(collection).where('clientId', '==', clientId);
  return searchRef
    .where(fieldPath, opStr, inputValue)
    .get()
    .then(result => {
      if (result.docs.length > 0) {
        return result.docs.map(_ => _.data().bookingId as string);
      }
      return [] as string[];
    });
};

const NavBarQuickSearchDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs)[0];
  const userRecord = useContext(UserRecordContext);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="dialog-title-navBar-quick-search"
      maxWidth="xl"
    >
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
          <QuickSearchBooking
            label="File number"
            getBookingChunks={inputValue => {
              return getBookingIds(
                'bookings-search',
                'bookingId',
                inputValue.toLowerCase().trim(),
                '==',
                !actingAs,
                userRecord?.alphacomClientId,
              );
            }}
          />
          <QuickSearchBooking
            label="BL number"
            getBookingChunks={inputValue => {
              return getBookingIds(
                'bookings-search',
                'BL-No',
                inputValue.toLowerCase().trim(),
                '==',
                !actingAs,
                userRecord?.alphacomClientId,
              );
            }}
          />
          <QuickSearchBooking
            label={`${!actingAs ? "Customer's" : 'Your'} reference`}
            getBookingChunks={inputValue => {
              return getBookingIds(
                'bookings-search',
                'Cust-BkgRef',
                inputValue.toLowerCase().trim(),
                '==',
                !actingAs,
                userRecord?.alphacomClientId,
              );
            }}
          />
          <QuickSearchBooking
            label="Container number"
            getBookingChunks={inputValue => {
              return getBookingIds(
                'containers',
                'container',
                inputValue.toUpperCase().trim(),
                '==',
                !actingAs,
                userRecord?.alphacomClientId,
              );
            }}
          />
          <QuickSearchBooking
            label="Delivery reference"
            getBookingChunks={inputValue => {
              return getBookingIds(
                'bookings-search',
                'deliveryRef',
                inputValue.toLowerCase().trim(),
                'array-contains',
                !actingAs,
                userRecord?.alphacomClientId,
              );
            }}
          />
          <QuickSearchBooking
            label="Pickup reference"
            getBookingChunks={inputValue => {
              return getBookingIds(
                'bookings-search',
                'pickupRef',
                inputValue.toLowerCase().trim(),
                'array-contains',
                !actingAs,
                userRecord?.alphacomClientId,
              );
            }}
          />
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
