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
import useAdminUsers from '../../hooks/useAdminUsers';
import { Typography } from '@material-ui/core';
const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});
const TeamsAssigneeContainer: React.FC<Props> = () => {
  const classes = useStyles();
  const admins = useAdminUsers();

  return (
    <Typography>Under construction</Typography>
    // <TableContainer component={Paper}>
    //   <Table className={classes.table} aria-label="a dense table">
    //     <colgroup>
    //       <col style={{ width: '20%' }} />
    //       <col style={{ width: '20%' }} />
    //       <col style={{ width: '20%' }} />
    //       <col style={{ width: '20%' }} />
    //       <col style={{ width: '20%' }} />
    //       <col style={{ width: '5%' }} />
    //     </colgroup>
    //     <TableHead>
    //       <TableRow>
    //         <TableCell>Name</TableCell>
    //         <TableCell align="center">Members</TableCell>
    //         <TableCell align="center">Carriers</TableCell>
    //         <TableCell align="center">Categories</TableCell>
    //         <TableCell align="center">Checklist Items</TableCell>
    //         <TableCell padding="none" align="right" />
    //       </TableRow>
    //     </TableHead>
    //     <TableBody>
    //       {/*{teams?.map((team, index) => (*/}
    //       {/*  <TeamTeamRow team={team} key={`teams-${team.id}`} />*/}
    //       {/*))}*/}
    //     </TableBody>
    //   </Table>
    // </TableContainer>
  );
};

export default TeamsAssigneeContainer;

interface Props {}
