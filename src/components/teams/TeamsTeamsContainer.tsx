import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import useTeams from '../../hooks/useTeams';
import { Box, Button, Container } from '@material-ui/core';
import { Team } from '../../model/Teams';
import TeamTeamRow from './TeamTeamRow';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const TeamsTeamsContainer: React.FC = () => {
  const classes = useStyles();

  const teams = useTeams();

  const [newItem, setNewItem] = useState<Team>();

  const onAdd = () => {
    setNewItem({} as Team);
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" flexDirection="row-reverse">
        <Button onClick={onAdd} size="small" color="primary" variant="contained">
          Add
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Members</TableCell>
              <TableCell align="right">Carriers</TableCell>
              <TableCell align="right">Categories</TableCell>
              <TableCell align="right">Checklist Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams?.map((team, index) => (
              <TeamTeamRow team={team} key={`teams-${index}`} />
            ))}
            {newItem && <TeamTeamRow team={newItem} key={`teams-new`} />}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TeamsTeamsContainer;
