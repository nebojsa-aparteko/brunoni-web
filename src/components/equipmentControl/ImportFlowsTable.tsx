import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import { EquipmentImportSummary } from '../../model/EquipmentControl';
import { makeStyles, Theme } from '@material-ui/core';
import theme from '../../theme';
import TableBody from '@material-ui/core/TableBody';
import EquipmentControlRow from './EquipmentControlRow';

const useStyles = makeStyles((theme: Theme) => ({
  defaultCell: {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'white',
  },
  statusCell: {
    border: `1px solid black`,
    alignItems: 'center',
  },
}));

const statuses = ['ON WATER', 'ARRIVED', 'GATE OUT', 'TOTAL', 'TODAY'];
const containerTypes = ['20DC', '40DC', '40HC', '20RF', '40RH', '20OT', '40OT', '40OH'];
// const containerTypes = ['20DC', '15G12', '45G1', '40HC', '20RF', '40RH', '20OT', '40OT'];

const getContainerTypeCells = () => (
  <>
    {containerTypes.map((containerType, index) => (
      <TableCell
        key={`${containerType}-${index}`}
        padding="checkbox"
        size="small"
        style={{ border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}
      >
        {containerType}
      </TableCell>
    ))}
  </>
);

interface ImportFlowsTableProps {
  summary: EquipmentImportSummary[];
}

const ImportFlowsTable: React.FC<ImportFlowsTableProps> = ({ summary }) => {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell style={{ backgroundColor: 'white' }} colSpan={1} />
            {statuses.map(status => (
              <TableCell colSpan={8} className={classes.statusCell} key={status}>
                {status}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Depot Location</TableCell>
            {statuses.map(() => getContainerTypeCells())}
          </TableRow>
        </TableHead>
        <TableBody>
          {summary?.map((equipment, index) => (
            <EquipmentControlRow equipmentControl={equipment} key={index} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ImportFlowsTable;
