import React, { Fragment, useContext } from 'react';
import { Card, CardActions, CardContent, CardHeader, Divider, Tab, Tabs } from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import { differenceInMilliseconds } from 'date-fns';
import ActivityLogContainer from './ActivityLogContainer';
import ActingAs from '../../../contexts/ActingAs';
import { ActivityLogProvider } from './ActivityLogContext';
import InternalStorage from '../InternalStorage';
import TabPanel from '../../TabPanel';
import ChecklistContent from './ChecklistContent';
import AccountingTabContent from '../accountingTab/AccountingTabContent';

interface CheckListProps {
  booking: Booking;
}

export const editRestriction = (date: Date) =>
  differenceInMilliseconds(new Date(), date) <= Number(process.env.EDIT_RESTRICTION_TIME) || 600000;

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const CheckList: React.FC<CheckListProps> = ({ booking }) => {
  const actingAs = useContext(ActingAs)[0];

  const [tabValue, setTabValue] = React.useState(0);

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Fragment>
      <ActivityLogProvider>
        <Card>
          <CardHeader
            title={
              <Tabs value={tabValue} onChange={handleChangeTab}>
                <Tab label="Checklist" {...a11yProps(0)} />
                <Tab label="Accounting" {...a11yProps(1)} />
              </Tabs>
            }
          />
          <Divider />
          <CardContent>
            <TabPanel index={0} value={tabValue}>
              <ChecklistContent booking={booking} />
            </TabPanel>
            <TabPanel index={1} value={tabValue}>
              <AccountingTabContent booking={booking} />
            </TabPanel>
          </CardContent>
          {tabValue === 0 && (
            <CardActions>Hint: you can drag files onto the checklist items to attach them</CardActions>
          )}
        </Card>
        {!actingAs && tabValue === 0 && <InternalStorage id={booking!.id} collection={'bookings'} />}
        <ActivityLogContainer booking={booking} isAdmin={!actingAs} />
      </ActivityLogProvider>
    </Fragment>
  );
};
export default CheckList;
