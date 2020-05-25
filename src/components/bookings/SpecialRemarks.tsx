import React from 'react';
import { Table, TableCell, TableRow, makeStyles } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { Remark } from '../../model/Booking';

interface Props {
  remarks: Remark[];
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
    verticalAlign: 'top',
    maxWidth: '8em',
  },
  tableRow: {
    ['@media not print']: {
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),

        '& td': {
          display: 'block',
          padding: theme.spacing(0),
        },
      },
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
  },
  tableCell: {
    border: 'none',
  },
}));

const SpecialRemarks: React.FC<Props> = ({ remarks }) => {
  const classes = useStyles();

  const remarkTexts = remarks
    .map(remark => {
      return remark.RemarkTxt?.split('<br/><br/>')
        .map(remark => remark?.split('<br/>').join(''))
        .join('<br/><br/>');
    })
    .join('<br />');

  return (
    <Table size="small" aria-label="a dense table">
      <colgroup>
        <col style={{ width: '14%' }} />
        <col style={{ width: '86%' }} />
      </colgroup>
      <TableBody>
        <TableRow className={classes.tableRow}>
          <TableCell className={classes.tableCellLabel}>Special Remarks</TableCell>
          <TableCell
            className={classes.tableCell}
            dangerouslySetInnerHTML={{ __html: remarkTexts.replace(/\*/g, '') }}
            style={{ paddingBottom: '20px', textAlign: 'justify' }}
          />
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default SpecialRemarks;
