import React, { useEffect, useState } from 'react';
import { Container, Paper, CardHeader, Box, Typography, CardContent, Card, CardActions } from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import ChecklistItemRow from './ChecklistItemRow';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { ShipmentProgress } from '../BookingsTable';
import { ChecklistItem } from './ChecklistItemModel';

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
}

const CheckList: React.FC<CheckListProps> = ({ booking, showCompanyInfo }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    firebase
      .firestore()
      .collection('bookings')
      .doc(booking?.id)
      .collection('checklist')
      .orderBy('order')
      .get()
      .then(checklist => {
        const checklistItems = flow(get('docs'))(checklist).map(
          (doc: any) => doc.data() as ChecklistItem,
        ) as ChecklistItem[];
        const normalizeChecklistItems = map(
          flow(
            update('confirmedByCustomer', update('at', invoke('toDate'))),
            update('values', map(update('uploadedAt', invoke('toDate')))),
          ),
        );
        setChecklistItems(normalizeChecklistItems(checklistItems));
      });
  }, [booking]);

  if (checklistItems.length === 0) {
    return (
      <Container>
        <Paper>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex">
            <Typography variant="subtitle1" display="inline">
              Checklist
            </Typography>
            <Box flex={1} />
            <ShipmentProgress booking={booking!} />
          </Box>
        }
      />
      <CardContent>
        <Box display="flex" flexDirection="column">
          {checklistItems.map((item, index) => (
            <ChecklistItemRow
              key={`chkitem-${booking?.id}-${index}`}
              checklistItem={item}
              isAdmin={showCompanyInfo}
              booking={booking}
            />
          ))}
        </Box>
      </CardContent>
      <CardActions>Hint: you can drag files onto the checklist items to attach them</CardActions>
    </Card>
  );
};
export default CheckList;
