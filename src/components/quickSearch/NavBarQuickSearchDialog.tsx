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
import QuickSearchBooking from './QuickSearchBooking';
import QuickSearchQuote from './QuickSearchQuote';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';

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

const searchBookings = async (collection: string, fieldPath: string, inputValue: string) =>
  firebase
    .firestore()
    .collection('bookings')
    .where(fieldPath, '==', inputValue)
    .get()
    .then(result => {
      if (result.docs.length > 0) {
        return new Promise<Booking>(resolve => resolve(result.docs[0].data() as Booking));
      } else {
        return new Promise<Booking>((resolve, reject) => reject('No booking found'));
      }
    })
    .catch(error => {
      return new Promise<Booking>((resolve, reject) => reject(error));
    });

const nestedSearchBookings = async (
  collection: string,
  fieldPath: string,
  inputValue: string,
  opStr: firebase.firestore.WhereFilterOp = '==',
) =>
  firebase
    .firestore()
    .collection(collection)
    .where(fieldPath, opStr, inputValue)
    .get()
    .then(result => {
      if (result.docs.length > 0) {
        const bookingId = result.docs[0].data().bookingId;
        return firebase
          .firestore()
          .collection('bookings')
          .doc(bookingId)
          .get()
          .then(booking => {
            return new Promise<Booking>(resolve => resolve(booking.data() as Booking));
          })
          .catch(error => {
            return new Promise<Booking>((resolve, reject) => reject(error));
          });
      } else return new Promise<Booking>((resolve, reject) => reject('No booking found'));
    })
    .catch(error => {
      return new Promise<Booking>((resolve, reject) => reject(error));
    });

const NavBarQuickSearchDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-navBar-quick-search" maxWidth="md">
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
            handleClose={handleClose}
            searchBookings={inputValue => searchBookings('bookings-search', 'bookingId', inputValue.toLowerCase())}
          />
          <QuickSearchBooking
            label="BL number"
            handleClose={handleClose}
            searchBookings={inputValue => searchBookings('bookings-search', 'BL-No', inputValue.toLowerCase())}
          />
          <QuickSearchBooking
            label="Customer's reference"
            handleClose={handleClose}
            searchBookings={inputValue => searchBookings('bookings-search', 'Cust-BkgRef', inputValue.toLowerCase())}
          />
          <QuickSearchBooking
            label="Container number"
            handleClose={handleClose}
            searchBookings={inputValue => nestedSearchBookings('containers', 'container', inputValue)}
          />
          <QuickSearchBooking
            label="Delivery reference"
            handleClose={handleClose}
            searchBookings={inputValue =>
              nestedSearchBookings('bookings-search', 'deliveryRef', inputValue.toLowerCase(), 'array-contains')
            }
          />
          <QuickSearchBooking
            label="Pickup reference"
            handleClose={handleClose}
            searchBookings={inputValue =>
              nestedSearchBookings('bookings-search', 'pickupRef', inputValue.toLowerCase(), 'array-contains')
            }
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
