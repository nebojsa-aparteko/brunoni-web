import React from 'react';
import { TableCell, TableRow } from '@material-ui/core';
import { Team } from '../../../model/Teams';
import { tabStyles } from '../../../pages/TeamManagementPage';
import TeamsRowInputDialog from './TeamsRowInputDialog';

const TeamRow: React.FC<Props> = ({ team }) => {
  const classes = tabStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <TableRow className={classes.row} onClick={handleOpen}>
      <TableCell>Bookings</TableCell>
      <TableCell>Carrier1, Carrier2...</TableCell>
      <TableCell>FREIGHT COLLECTION</TableCell>

      {/*Hack around div under tr warning*/}
      <TableCell style={{ display: 'none' }}>
        <TeamsRowInputDialog open={open} setOpen={setOpen} />
      </TableCell>
    </TableRow>
  );
};

interface Props {
  team: Team;
}

export default TeamRow;
