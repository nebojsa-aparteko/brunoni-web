import React from 'react';
import { Box, Typography } from '@material-ui/core';
import type UserRecord from '../../model/UserRecord';

interface Props {
  booking: any;
  bookingAgent?: UserRecord;
  editing?: boolean;
}

export const BookingSummary: React.FC<Props> = ({ booking, bookingAgent, editing }) => {
  return (
    <Box>
      <Typography>Booking Summary</Typography>
    </Box>
  );
};

export default BookingSummary;
