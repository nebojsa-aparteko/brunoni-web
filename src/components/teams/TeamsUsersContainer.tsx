import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamUserRow from './TeamUserRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const TeamsUsersContainer: React.FC = () => {
  const classes = useStyles();
  const adminUsers = useAdminUsers();

  return (
    <Fragment>
      {!adminUsers ? (
        <ChartsCircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Email</TableCell>
                <TableCell align="right">Role</TableCell>
                <TableCell align="right">Last Login</TableCell>
                <TableCell align="center">Vacation</TableCell>
                <TableCell align="center">Redirect To</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminUsers?.map(user => (
                <TeamUserRow user={user} key={`adminuser-${user.alphacomId}`} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Fragment>
  );
};

export default TeamsUsersContainer;
