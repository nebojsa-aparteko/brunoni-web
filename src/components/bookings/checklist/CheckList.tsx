import React, { Fragment, useCallback, useContext, useMemo } from 'react';
import { AppBar, Box, Card, CardActions, CardContent, Container, Paper, Tab, Tabs } from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import ChecklistItemRow from './ChecklistItemRow';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { ChecklistItem } from './ChecklistItemModel';
import { differenceInMilliseconds } from 'date-fns';
import ActivityLogContainer from './ActivityLogContainer';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
import ActingAs from '../../../contexts/ActingAs';
import { ActivityLogProvider } from './ActivityLogContext';

interface CheckListProps {
  booking: Booking;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

const safeInvoke = (method: string) => (object: any) => (object ? invoke(method)(object) : null);

export const editRestriction = (date: Date) =>
  differenceInMilliseconds(new Date(), date) <= Number(process.env.EDIT_RESTRICTION_TIME) || 600000;

const CheckList: React.FC<CheckListProps> = ({ booking }) => {
  const actingAs = useContext(ActingAs)[0];
  const checklistCollection = useFirestoreCollection(
    'bookings',
    useCallback(query => query.orderBy('order', 'asc'), []),
    booking.id,
    'checklist',
  );
  const checklistItems = checklistCollection?.docs.map(doc => doc.data()) as ChecklistItem[];
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const normalizedChecklistItems = useMemo(
    () =>
      map(
        flow(
          update('status', map(update('at', safeInvoke('toDate')))),
          // update('customerAction', update('at', safeInvoke('toDate'))),
          update('values', map(update('uploadedAt', invoke('toDate')))),
          update('valuesAdmin', map(update('uploadedAt', invoke('toDate')))),
        ),
      )(checklistItems),
    [checklistItems],
  );
  if (normalizedChecklistItems.length === 0) {
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
        <AppBar position="static">
          <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Checklist" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
                {normalizedChecklistItems.map((item, index) => (
                  <ChecklistItemRow
                    key={`chkitem-${booking.id}-${index}`}
                    checklistItem={item}
                    isAdmin={!actingAs}
                    booking={booking}
                  />
                ))}
              </Box>
            </CardContent>
            <CardActions>Hint: you can drag files onto the checklist items to attach them</CardActions>
          </Card>
          <ActivityLogContainer bookingId={booking.id} isAdmin={!actingAs} />
        </TabPanel>
      </ActivityLogProvider>
    </Fragment>
  );
};
export default CheckList;
