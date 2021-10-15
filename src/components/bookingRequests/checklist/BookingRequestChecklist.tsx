import React, { useContext } from 'react';
import { ActivityLogProvider } from '../../bookings/checklist/ActivityLogContext';
import {
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { BookingRequest } from '../../../model/BookingRequest';
import BookingRequestChecklistContent from './BookingRequestChecklistContent';
import InternalStorage from '../../bookings/InternalStorage';
import ActingAs from '../../../contexts/ActingAs';
import ActivityLogContainer from './ActivityLogContainer';

interface CheckListProps {
  bookingRequest: BookingRequest;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardAlt: {
      backgroundColor: theme.palette.grey['200'],
    },
    checklist: {
      padding: 0,
    },
  }),
);

const BookingRequestCheckList: React.FC<CheckListProps> = ({ bookingRequest }) => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs)[0];

  return (
    <ActivityLogProvider>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Card id="cardChecklist">
            <CardHeader title={<Typography variant="h5">Request Checklist</Typography>} />
            <Divider />
            <CardContent className={classes.checklist}>
              <BookingRequestChecklistContent bookingRequest={bookingRequest} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card className={classes.cardAlt}>
            {!actingAs && bookingRequest.id && (
              <InternalStorage
                id={bookingRequest.id}
                collection={'bookings-requests'}
                isInternal={true}
                cardMargin={0}
                dndLabel={"Drag 'n' drop internal files or click here"}
                showHeader={true}
                showComparison={true}
              />
            )}
          </Card>
        </Grid>

        <Grid item>
          <Card>
            {bookingRequest.id && (
              <InternalStorage
                id={bookingRequest.id}
                collection={'bookings-requests'}
                isInternal={false}
                label="Storage"
                cardMargin={0}
                showHeader={true}
                showComparison={true}
              />
            )}
          </Card>
        </Grid>
      </Grid>

      <ActivityLogContainer bookingRequest={bookingRequest} isAdmin={!actingAs} />
    </ActivityLogProvider>
  );
};
export default BookingRequestCheckList;
