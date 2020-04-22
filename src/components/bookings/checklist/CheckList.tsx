import React, { Fragment, useCallback, useContext, useMemo } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import ChecklistItemRow from './ChecklistItemRow';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { ChecklistItem } from './ChecklistItemModel';
import InternalChecklist from './InternalChecklist';
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
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Typography>
  );
}

const CheckList: React.FC<CheckListProps> = ({ booking }) => {
  const [actingAs, setActingAs] = useContext(ActingAs);
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
          // update('confirmedByCustomer', update('at', invoke('toDate'))),
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
            {!actingAs && <Tab label="Internal" id="simple-tab-1" aria-controls="simple-tabpanel-1" />}
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
          <ActivityLogContainer bookingId={booking.id} isInternal={false} />
        </TabPanel>
        {!actingAs && (
          <TabPanel value={value} index={1}>
            <Card>
              <CardContent>
                <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
                  <InternalChecklist />
                </Box>
              </CardContent>
            </Card>
            <Divider />
            <ActivityLogContainer bookingId={booking.id} isInternal={true} />
          </TabPanel>
        )}
      </ActivityLogProvider>
    </Fragment>
  );
};
export default CheckList;
