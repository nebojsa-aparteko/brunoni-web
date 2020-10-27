import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TeamTeamRow from './TeamTeamRow';
import TableContainer from '@material-ui/core/TableContainer';
import { makeStyles } from '@material-ui/core/styles';
import { Team } from '../../model/Teams';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const OperationsTeamsTable = ({ teams }: Props) => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} style={{ flex: 1, display: 'flex' }}>
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
          {teams?.map(team => (
            <TeamTeamRow team={team} key={`teams-${team.id}`} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface Props {
  teams: Team[];
}

export default OperationsTeamsTable;
