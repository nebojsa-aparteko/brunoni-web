import React from 'react';
import SpecialRemarkInput from './SpecialRemarkInput';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';

const useStyles = makeStyles(() => ({
  specialRemarkLabel: {
    fontWeight: 700,
  },
  specialRemark: {
    whiteSpace: 'pre-wrap',
  },
}));

const BookingRequestSpecialRemark: React.FC<Props> = ({ editing }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useBookingRequestContext();
  const handleChangeSpecialRemark = (specialRemarkId: string | undefined, specialRemarkText: string | undefined) => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest({ ...bookingRequest, specialRemarkId: specialRemarkId, specialRemarkText: specialRemarkText });
  };

  return bookingRequest && setBookingRequest ? (
    <React.Fragment>
      {editing ? (
        <SpecialRemarkInput
          specialRemark={bookingRequest.specialRemarkId}
          specialRemarkText={bookingRequest.specialRemarkText}
          handleChange={handleChangeSpecialRemark}
        />
      ) : bookingRequest.specialRemarkText ? (
        <Grid container direction="row">
          <Grid item xs={2}>
            <Typography className={classes.specialRemarkLabel}>Special Remarks</Typography>
          </Grid>
          <Grid item xs={10}>
            <Typography className={classes.specialRemark}>{bookingRequest.specialRemarkText}</Typography>
          </Grid>
        </Grid>
      ) : null}
    </React.Fragment>
  ) : null;
};

interface Props {
  editing?: boolean;
}

export default BookingRequestSpecialRemark;
