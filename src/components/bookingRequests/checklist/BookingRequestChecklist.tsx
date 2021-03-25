import React, { Fragment } from 'react';
import { ActivityLogProvider } from '../../bookings/checklist/ActivityLogContext';
import { Card, CardContent, CardHeader, Divider, Typography } from '@material-ui/core';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestChecklistContent from './BookingRequestCheclistContent';

interface CheckListProps {
  bookingRequest: BookingRequest;
}

const BookingRequestCheckList: React.FC<CheckListProps> = ({ bookingRequest }) => {
  return (
    <Fragment>
      <ActivityLogProvider>
        <Card id="cardChecklist">
          <CardHeader title={<Typography variant="h4">Request Checklist</Typography>} />
          <Divider />
          <CardContent
            style={{
              padding: 24,
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            <BookingRequestChecklistContent bookingRequest={bookingRequest} />
          </CardContent>
        </Card>
      </ActivityLogProvider>
    </Fragment>
  );
};
export default BookingRequestCheckList;
