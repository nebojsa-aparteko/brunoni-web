import React from 'react';
import { createStyles, makeStyles, Grid, Table, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Booking } from '../../../model/Booking';
import ChecklistContent from './ChecklistContent';

interface CheckListProps {
  booking: Booking | undefined;
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles(() =>
  createStyles({
    table: {
      overflowX: 'auto',
      marginBottom: '1.5em',
    },
  }),
);

const CheckList: React.FC<CheckListProps> = ({ booking, showCompanyInfo }) => {
  const classes = useStyles();

  return (
    <Grid container xs spacing={2} direction="column">
      <ChecklistContent isAdmin={showCompanyInfo} booking={booking} />
    </Grid>
  );
};
export default CheckList;
