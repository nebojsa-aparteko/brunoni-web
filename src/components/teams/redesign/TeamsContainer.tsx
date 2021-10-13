import React, { useState } from 'react';
import { Box, Collapse, List, ListItem, Paper } from '@material-ui/core';
import { tabStyles } from '../../../pages/TeamManagementPage';
import useTeams from '../../../hooks/useTeams';
import { TeamType } from '../../../model/Teams';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import theme from '../../../theme';
import TeamsTable from './TeamsTable';

interface Props {
  type: TeamType;
}

const TeamsContainer: React.FC<Props> = ({ type }) => {
  const classes = tabStyles();
  const teams = useTeams(type);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('bookings');

  const handleListItemClick = (name: string) => {
    setSelected(name);
  };

  return (
    <Box className={classes.tabContainer} style={{ overflowY: 'hidden' }}>
      <Paper square>
        <List component="nav" disablePadding>
          <ListItem
            button
            onClick={() => {
              setOpen(prev => !prev);
              handleListItemClick('bookings');
            }}
            selected={selected === 'bookings'}
          >
            Bookings
            <Box ml={theme.spacing(1)}>{open ? <ExpandLess /> : <ExpandMore />}</Box>
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" className={classes.subList} disablePadding>
              <ListItem button onClick={() => handleListItemClick('checklist')} selected={selected === 'checklist'}>
                Checklist
              </ListItem>
              <ListItem button onClick={() => handleListItemClick('task')} selected={selected === 'task'}>
                Task
              </ListItem>
              <ListItem button onClick={() => handleListItemClick('carrier')} selected={selected === 'carrier'}>
                Carrier
              </ListItem>
            </List>
          </Collapse>
          <ListItem button onClick={() => handleListItemClick('vessel')} selected={selected === 'vessel'}>
            Vessel
          </ListItem>
          <ListItem
            button
            onClick={() => handleListItemClick('land transport')}
            selected={selected === 'land transport'}
          >
            Land Transport
          </ListItem>
        </List>
      </Paper>
      <Box display={'flex'} alignItems={'center'} justifyContent={'center'} flexGrow={1}>
        <TeamsTable teams={teams} />
      </Box>
    </Box>
  );
};

export default TeamsContainer;
