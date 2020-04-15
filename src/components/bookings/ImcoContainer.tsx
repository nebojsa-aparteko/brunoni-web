import React, { Fragment } from 'react';
import { TableRowData } from './ContainerDetails';
import { IMCOField } from '../../model/Booking';
import { makeStyles, TableCell, TableRow } from '@material-ui/core';

interface Prop {
  IMCOs: IMCOField[];
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    verticalAlign: 'top',
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
  },
  tableCell: {
    verticalAlign: 'top',
    border: 'none',
  },
}));

const ImcoContainer: React.FC<Prop> = ({ IMCOs }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.tableCellLabel}>IMCO</TableCell>
      <TableCell className={classes.tableCell}>
        {IMCOs.map(detail => (
          <span>
            {detail.IMOClass || ''} {detail.UNNumber ? `/ ${detail.UNNumber}` : ''}{' '}
            {detail.PackingNumber ? `/ ${detail.PackingNumber}` : ''}{' '}
            {detail.FlashPoint ? `/ ${detail.FlashPoint}` : ''}
            <br />
          </span>
        ))}
      </TableCell>
    </TableRow>
  );
};

export default ImcoContainer;
