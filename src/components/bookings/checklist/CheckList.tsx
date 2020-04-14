import React, { useEffect, useState } from 'react';
import { AppBar, Box, Card, CardActions, Container, Divider, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import ChecklistItemRow from './ChecklistItemRow';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { ChecklistItem } from './ChecklistItemModel';
import InternalChecklist from './InternalChecklist';
import Comments from './Comments';

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
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
const CheckList: React.FC<CheckListProps> = ({ booking, showCompanyInfo }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
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
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Checklist" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
          <Tab label="Internal" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
          {checklistItems.map((item, index) => (
            <ChecklistItemRow
              key={`chkitem-${booking?.id}-${index}`}
              checklistItem={item}
              isAdmin={showCompanyInfo}
              booking={booking}
            />
          ))}
        </Box>
        <CardActions>Hint: you can drag files onto the checklist items to attach them</CardActions>
        <Divider />
        <Comments booking={booking} isInternal={false} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box display="flex" flexDirection="column" style={{ flex: 1 }}>
          <InternalChecklist />
        </Box>
        <Divider />
        <Comments booking={booking} isInternal={true} />
      </TabPanel>
    </Card>
  );
};
export default CheckList;
