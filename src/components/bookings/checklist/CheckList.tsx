import React, { Fragment, useContext } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Paper,
  Typography,
} from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import ChecklistItemRow from './ChecklistItemRow';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { differenceInMilliseconds } from 'date-fns';
import ActivityLogContainer from './ActivityLogContainer';
import ActingAs from '../../../contexts/ActingAs';
import { ActivityLogProvider } from './ActivityLogContext';
import useChecklist from '../../../hooks/useChecklist';
import InternalStorage from '../InternalStorage';

interface CheckListProps {
  booking: Booking;
}

export const editRestriction = (date: Date) =>
  differenceInMilliseconds(new Date(), date) <= Number(process.env.EDIT_RESTRICTION_TIME) || 600000;

const CheckList: React.FC<CheckListProps> = ({ booking }) => {
  const actingAs = useContext(ActingAs)[0];

  const checklistItems = useChecklist(booking.id);

  if (!checklistItems) {
    return (
      <Container>
        <Paper>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Fragment>
      <ActivityLogProvider>
        <Card>
          <CardHeader
            title={
              <Typography component="h2" variant="h2">
                Checklist
              </Typography>
            }
          />
          <Divider />
          <CardContent>
            <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
              {checklistItems.map(item => (
                <ChecklistItemRow
                  key={`chkitem-${booking.id}-${item.id}`}
                  checklistItem={item}
                  isAdmin={!actingAs}
                  booking={booking}
                />
              ))}
            </Box>
          </CardContent>
          <CardActions>Hint: you can drag files onto the checklist items to attach them</CardActions>
        </Card>
        {!actingAs && <InternalStorage bookingId={booking!.id} />}
        <ActivityLogContainer bookingId={booking.id} isAdmin={!actingAs} />
      </ActivityLogProvider>
    </Fragment>
  );
};
export default CheckList;
