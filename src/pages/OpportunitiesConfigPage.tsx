import React, { Fragment, useState } from 'react';
import Meta from '../components/Meta';
import { Box, makeStyles, Paper, Tab, Tabs, Theme } from '@material-ui/core';
import { TabPanel } from './BookingsPage';
import PinDropIcon from '@material-ui/icons/PinDrop';
import ExploreIcon from '@material-ui/icons/Explore';
import ReceiptIcon from '@material-ui/icons/Receipt';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import DeliveryGroupsContainer from '../components/opportunities/DeliveryGroupsContainer';
import CommodityGroupsContainer from '../components/opportunities/CommodityGroupsContainer';
import PortGroupsContainer from '../components/opportunities/PortGroupsContainer';
import TagsContainer from '../components/opportunities/TagsContainer';
import { useNavigate } from 'react-router-dom';
import queryString from 'query-string';
const useStyles = makeStyles((theme: Theme) => ({
  tabContainer: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    width: '100%',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const OpportunitiesConfigPage: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const params = queryString.parse(window.location.search.replace('?', ''));
  const tab = params.tab as string | undefined;

  const tabToIndex: any = {
    users: 1,
    'reassign-users': 2,
    'payment-confirmation': 3,
  };

  const [selectedTab, setSelectedTab] = useState(tab && tabToIndex[tab] ? tabToIndex[tab] : 0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    switch (newValue) {
      case 0:
        navigate('/opportunities-config');
        break;
      case 1:
        navigate('/opportunities-config?tab=ports');
        break;
      case 2:
        navigate('/opportunities-config?tab=commodities');
        break;
      case 3:
        navigate('/opportunities-config?tab=equipments');
        break;
      case 4:
        navigate('/opportunities-config?tab=tags');
        break;
      default:
        break;
    }
  };
  return (
    <Fragment>
      <Meta title="Opportunities config" />
      <Box className={classes.tabContainer} style={{ overflowY: 'hidden' }}>
        <Paper square>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            orientation="vertical"
            className={classes.tabs}
            aria-label="Opportunities config tabs"
          >
            <Tab label="Delivery Groups" icon={<PinDropIcon />} />
            <Tab label="Ports Groups" icon={<ExploreIcon />} />
            <Tab label="Commodities Groups" icon={<RecentActorsIcon />} />
            <Tab label="Equipments Groups" icon={<ReceiptIcon />} />
            <Tab label="Tags" icon={<LocalOfferIcon />} />
          </Tabs>
        </Paper>
        <TabPanel value={selectedTab} index={0}>
          <DeliveryGroupsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <PortGroupsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <CommodityGroupsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          Equipments
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <TagsContainer />
        </TabPanel>
      </Box>
    </Fragment>
  );
};

export default OpportunitiesConfigPage;
