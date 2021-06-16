import React, { useContext, useEffect } from 'react';
import SpecialRemarksInput from '../inputs/SpecialRemarksInput';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import SpecialRemark from '../../model/SpecialRemark';
import { set } from 'lodash/fp';
import { BookingRequest } from '../../model/BookingRequest';
import { isDashboardUser } from '../../model/UserRecord';
import UserRecordContext from '../../contexts/UserRecordContext';
import theme from '../../theme';

const useStyles = makeStyles(() => ({
  specialRemarkLabel: {
    fontWeight: 700,
  },
  specialRemark: {
    whiteSpace: 'pre-wrap',
  },
}));

const BookingRequestSpecialRemarks: React.FC = () => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();
  const [specialRemarksState, setSpecialRemarksState] = React.useState<SpecialRemark[] | undefined>(
    bookingRequest?.specialRemarks,
  );
  const userRecord = useContext(UserRecordContext);
  useEffect(() => {
    setSpecialRemarksState(bookingRequest?.specialRemarks);
  }, [bookingRequest?.specialRemarks]);

  const handleChangeSpecialRemarks = (specialRemarks: SpecialRemark[]) => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest(set('specialRemarks', specialRemarks)(bookingRequest) as BookingRequest);
  };

  return bookingRequest && setBookingRequest ? (
    <React.Fragment>
      {editing && isDashboardUser(userRecord) ? (
        <SpecialRemarksInput specialRemarks={specialRemarksState} handleChange={handleChangeSpecialRemarks} />
      ) : specialRemarksState && specialRemarksState.length > 0 ? (
        <Grid
          container
          direction="row"
          style={{ border: '1px solid #00b0ff', borderRadius: 5, padding: theme.spacing(1) }}
        >
          <Grid item xs={2} style={{ paddingRight: 5 }}>
            <Typography className={classes.specialRemarkLabel}>Special Remarks</Typography>
          </Grid>
          <Grid item container xs={10}>
            {specialRemarksState?.map(remark => (
              <Grid key={remark.id + '_' + remark.text} item xs={12}>
                <Typography className={classes.specialRemark}>{remark.text}</Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ) : null}
    </React.Fragment>
  ) : null;
};

export default BookingRequestSpecialRemarks;
