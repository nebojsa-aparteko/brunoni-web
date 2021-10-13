import React from 'react';
import { Team } from '../../../model/Teams';
import TeamRow from './TeamRow';
import { TableContainer } from '@material-ui/core';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';

const useStyles = makeStyles({
  tableContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  table: {
    minWidth: 650,
  },
});

interface Props {
  teams: Team[];
}

const TeamsTable: React.FC<Props> = ({ teams }) => {
  const classes = useStyles();

  return teams ? (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} aria-label="a dense table">
        <colgroup>
          <col style={{ width: '33%' }} />
          <col style={{ width: '33%' }} />
          <col style={{ width: '33%' }} />
        </colgroup>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Carriers</TableCell>
            <TableCell>Collection</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {teams?.map(team => (
            <TeamRow team={team} key={`teams-${team.id}`} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <ChartsCircularProgress />
  );
};

export default TeamsTable;
