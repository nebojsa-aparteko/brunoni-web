import React, { Fragment } from 'react';
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
import TeamTeamRow from './TeamTeamRow';
import { firestore } from 'firebase';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const TeamsTeamsContainer: React.FC = () => {
  const classes = useStyles();

  const teams = useTeams();

  const onAdd = () => {
    firestore()
      .collection('teams')
      .add({ name: '' })
      .then(docRef => console.log('Added doc ref ', docRef.id))
      .catch(err => console.error('Failed to add new item ', err));
  };

  return (
    <div style={{ overflowY: 'hidden' }}>
      {!teams ? (
        <ChartsCircularProgress />
      ) : (
        <div>
          <Box display="flex" flexDirection="row">
            <Button onClick={onAdd} size="small" color="primary" variant="contained">
              Add
            </Button>
          </Box>

          <TableContainer component={Paper} style={{ overflowY: 'auto' }}>
            <Table className={classes.table} aria-label="a dense table">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '5%' }} />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Members</TableCell>
                  <TableCell align="center">Carriers</TableCell>
                  <TableCell align="center">Categories</TableCell>
                  <TableCell align="center">Checklist Items</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {teams?.map((team, index) => (
                  <TeamTeamRow team={team} key={`teams-${team.id}`} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default TeamsTeamsContainer;
