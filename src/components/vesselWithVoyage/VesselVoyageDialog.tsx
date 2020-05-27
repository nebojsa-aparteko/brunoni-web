import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import VesselWithVoyage from '../../model/VesselWithVoyage';
import { chunk } from 'lodash/fp';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { normalizeBooking } from '../../providers/BookingsProvider';
import { useHistory } from 'react-router';

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
    },
  }),
);
const CHUNK_SIZE = 10;

const getBookings = (bookings: string[]) => {
  return firebase
    .firestore()
    .collection('bookings')
    .where('ERP-BkgRef', 'in', bookings)
    .get();
};

const VesselVoyageDialog: React.FC<Props> = ({ isOpen, handleClose, vesselItems, vessel }) => {
  const classes = useStyles();
  const bookingsIds = useMemo(() => chunk(CHUNK_SIZE)(vesselItems?.map(v => v.bookingId)), [vesselItems, CHUNK_SIZE]);
  const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);
  const history = useHistory();
  useEffect(() => {
    let didCancel = false;
    (async () => {
      if (!didCancel && bookingsIds && isOpen) {
        let bkgs: any[] = [];
        for (const id of bookingsIds) {
          bkgs = [...bkgs, ...(await getBookings(id)).docs.map(bkg => normalizeBooking(bkg.data()))];
        }

        setBookings(bkgs);
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [bookingsIds, normalizeBooking, getBookings, isOpen]);

  const handleBookingClick = (bookingId: string) => {
    window.open(`/bookings/${bookingId}`);
    // handleClose();
  };
  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="xl">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">{vessel}</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box display="flex" flexDirection="column">
            {bookings ? (
              <Box display="flex" flexDirection="column">
                {bookings.map((booking, index) => (
                  <Box
                    my={1}
                    onClick={() => handleBookingClick(booking.id)}
                    component={Paper}
                    key={`${booking['ERP-BkgRef']}-${index}`}
                  >
                    <BookingRow booking={booking} />
                  </Box>
                ))}
              </Box>
            ) : (
              <ChartsCircularProgress />
            )}
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default VesselVoyageDialog;

interface Props {
  vesselItems: VesselWithVoyage[] | undefined;
  isOpen: boolean;
  handleClose: () => void;
  vessel: string;
}
