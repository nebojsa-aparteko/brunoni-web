import React from 'react';
import {
  Checkbox,
  createStyles,
  Theme,
  Table,
  TableHead,
  TableCell,
  TableRow,
  makeStyles
} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';

interface Props {
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      marginTop: theme.spacing(3),
      width: '100%',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
    },
    table: {
      overflowX: 'auto',
    },
    tableHead: {
      fontWeight: theme.typography.fontWeightBold,
    },
    costUnitCell: {
      paddingLeft: 0,
      minWidth: '150px',
    },
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
    tableWrapper: {
      overflowX: 'auto',
    },
    textEmphasized: {
      color: 'red'
    }
  }),
);

const ExportChecklist: React.FC<Props> = ({ showCompanyInfo }) => {
  const classes = useStyles();

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    console.log('handleCheckboxChange');
    // onChange(checked ? [true, defaultItemValue] : [false]);
  };

  return (
    <Table className={classes.table} size="small">
      <TableHead className={classes.tableHead}>
        <TableRow className={classes.tableRow}>
          <TableCell>&nbsp;</TableCell>
          <TableCell align="center">CHECK LIST</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>Depot Out</TableCell>
          <TableCell align="center">
            <Checkbox checked={true} onChange={handleCheckboxChange} disabled={true} />
          </TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>Gate In Terminal</TableCell>
          <TableCell align="center">
            <Checkbox checked={true} onChange={handleCheckboxChange} disabled={false} />
          </TableCell>
        </TableRow>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>VGM Submission</TableCell>
          <TableCell align="center">
            <Checkbox checked={true} onChange={handleCheckboxChange} disabled={!showCompanyInfo} />
          </TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>Shipping Instructions</TableCell>
          <TableCell align="center">
            <Checkbox checked={true} onChange={handleCheckboxChange} disabled={!showCompanyInfo} />
          </TableCell>
        </TableRow>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>B/L Draft Received</TableCell>
          <TableCell align="center">
            <Checkbox checked={true} onChange={handleCheckboxChange} disabled={!showCompanyInfo} />
          </TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>B/L Draft Approved</TableCell>
          <TableCell align="center">
            <Checkbox checked={true} onChange={handleCheckboxChange} disabled={!showCompanyInfo} />
          </TableCell>
        </TableRow>
        <TableRow selected={false} className={classes.tableRow}>
          <TableCell>Shipped on Board</TableCell>
          <TableCell align="center" className={classes.textEmphasized}>PENDING</TableCell>
        </TableRow>
        <TableRow selected={true} className={classes.tableRow}>
          <TableCell>Final B/L Copy</TableCell>
          <TableCell align="center" className={classes.textEmphasized}>PENDING</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ExportChecklist;
