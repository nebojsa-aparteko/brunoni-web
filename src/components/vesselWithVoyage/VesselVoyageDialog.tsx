import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import LoadListContainerModel from '../../model/LoadListContainerModel';
import VesselWithVoyage from '../../model/VesselWithVoyage';
import { chunk } from 'lodash/fp';
import firebase from '../../firebase';
import { Booking } from '../../model/Booking';
import { BookingRow } from '../bookings/BookingsTable';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { normalizeBooking } from '../../providers/BookingsProvider';

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
    },
  }),
);
const CHUNK_SIZE = 10;

const getBookings = (bookings: string[]) =>
  firebase
    .firestore()
    .collection('bookings')
    .where('ERP-BkgRef', 'in', bookings)
    .get();

const VesselVoyageDialog: React.FC<Props> = ({ isOpen, handleClose, vesselItems }) => {
  const classes = useStyles();
  const bookingsIds = useMemo(() => chunk(CHUNK_SIZE)(vesselItems?.map(v => v.bookingId)), [vesselItems]);
  const [bookings, setBookings] = useState<Booking[] | undefined>(undefined);
  useEffect(() => {
    (async () => {
      if (vesselItems) {
        setBookings(
          (await getBookings(bookingsIds[(bookings?.length || 0) / CHUNK_SIZE])).docs.map(bkg =>
            normalizeBooking(bkg.data()),
          ),
        );
      }
    })();
  }, [bookingsIds, normalizeBooking]);
  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="dialog-title-check-list" maxWidth="md">
      <Box className={classes.dialogBody}>
        <DialogTitle disableTypography id="dialog-title-check-list">
          <Typography variant="h4">Update Load List</Typography>
          <IconButton onClick={handleClose} className={classes.closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Box display="flex" flexDirection="column">
            {bookings ? (
              <Box display="flex" flexDirection="column">
                {bookings.map((booking, index) => (
                  <BookingRow booking={booking} key={`${booking['ERP-BkgRef']}-${index}`} />
                ))}
                {/*{bookings && (bookingsIds.length - 1) * CHUNK_SIZE > bookings.length && (*/}
                {/*  <Button color="primary" onClick={handleSeeMore}>*/}
                {/*    See more...*/}
                {/*  </Button>*/}
                {/*)}*/}
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
}
