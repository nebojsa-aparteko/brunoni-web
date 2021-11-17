import React from 'react';
import { Box, CircularProgress, List, ListItem, Paper } from '@material-ui/core';
import { tabStyles } from '../../../pages/TeamManagementPage';
import useTeams from '../../../hooks/useTeams';
import { GroupType } from '../../../model/Teams';
import TeamsTable from './TeamsTable';
import { useTeamsContext } from '../../../providers/TeamsContextProvider';

const TeamsContainer: React.FC = () => {
  const classes = tabStyles();
  const {
    teamContextState: { teamType, groupType },
    setTeamContextState,
  } = useTeamsContext();
  const teams = useTeams(teamType, groupType);

  const handleListItemClick = (groupType: GroupType) => {
    setTeamContextState(prev => {
      return {
        ...prev,
        groupType,
      };
    });
  };

  return (
    <Box className={classes.tabContainer} style={{ overflowY: 'hidden' }}>
      <Box component={Paper}>
        <List component="nav" disablePadding style={{ minWidth: '200px' }}>
          <ListItem
            button
            onClick={() => {
              handleListItemClick(GroupType.BOOKINGS);
            }}
            selected={groupType === GroupType.BOOKINGS}
          >
            Bookings
          </ListItem>
          <ListItem
            button
            onClick={() => {
              handleListItemClick(GroupType.BOOKING_REQUESTS);
            }}
            selected={groupType === GroupType.BOOKING_REQUESTS}
          >
            Booking Requests
          </ListItem>
          <ListItem
            button
            onClick={() => {
              handleListItemClick(GroupType.QUOTES);
            }}
            selected={groupType === GroupType.QUOTES}
          >
            Quotes
          </ListItem>
          <ListItem
            button
            onClick={() => handleListItemClick(GroupType.VESSEL)}
            selected={groupType === GroupType.VESSEL}
          >
            Vessel
          </ListItem>
          <ListItem
            button
            onClick={() => handleListItemClick(GroupType.LAND_TRANSPORT)}
            selected={groupType === GroupType.LAND_TRANSPORT}
          >
            Land Transport
          </ListItem>
        </List>
      </Box>
      <Box display={'flex'} alignItems={'center'} justifyContent={'center'} flexGrow={1}>
        {teams ? <TeamsTable teams={teams} /> : <CircularProgress />}
      </Box>
    </Box>
  );
};

export default TeamsContainer;
