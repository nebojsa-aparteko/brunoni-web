import React, { Fragment, useContext } from 'react';
import { ActivityLogProvider } from '../../bookings/checklist/ActivityLogContext';
import { Card, CardContent, CardHeader, Divider, Typography } from '@material-ui/core';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestChecklistContent from './BookingRequestChecklistContent';
import InternalStorage from '../../bookings/InternalStorage';
import ActingAs from '../../../contexts/ActingAs';
import ActivityLogContainer from './ActivityLogContainer';

interface CheckListProps {
  bookingRequest: BookingRequest;
}

const BookingRequestCheckList: React.FC<CheckListProps> = ({ bookingRequest }) => {
  const actingAs = useContext(ActingAs)[0];

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
        <Card style={{ backgroundColor: '#eee', marginTop: 16, marginBottom: 16 }}>
          {!actingAs && bookingRequest.id && (
            <InternalStorage
              id={bookingRequest.id}
              collection={'bookings-requests'}
              isInternal={true}
              cardMargin={0}
              dndLabel={"Drag 'n' drop internal files or click here"}
              showHeader={true}
            />
          )}
        </Card>
        <Card style={{ backgroundColor: '#fff', marginTop: 16, marginBottom: 16 }}>
          {bookingRequest.id && (
            <InternalStorage
              id={bookingRequest.id}
              collection={'bookings-requests'}
              isInternal={false}
              label="Storage"
              cardMargin={0}
              showHeader={true}
            />
          )}
        </Card>
        <ActivityLogContainer bookingRequest={bookingRequest} isAdmin={!actingAs} />
      </ActivityLogProvider>
    </Fragment>
  );
};
export default BookingRequestCheckList;
