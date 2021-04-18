import React, { Fragment, useMemo } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import { containerTypesLabels, EquipmentExportSummary } from '../../model/EquipmentControl';
import { makeStyles, Theme } from '@material-ui/core';
import theme from '../../theme';
import TableBody from '@material-ui/core/TableBody';
import EquipmentControlExportRow from './EquipmentControlExportRow';
import { groupBy } from 'lodash/fp';

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

const columns = ['WK1', 'WK2', 'WK3', 'EXPORT TOTAL', 'SHIPPED TODAY'];

const ContainerTypeCells: React.FC = () => (
  <Fragment>
    {containerTypesLabels.map((containerType, index) => (
      <TableCell
        key={`${containerType}-${index}`}
        padding="checkbox"
        size="small"
        style={{ border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}
      >
        {containerType}
      </TableCell>
    ))}
  </Fragment>
);

interface ImportFlowsTableProps {
  summary: EquipmentExportSummary[];
}

const ExportFlowsTable: React.FC<ImportFlowsTableProps> = ({ summary }) => {
  const classes = useStyles();
  const groupedSummary = useMemo(() => Object.entries(groupBy<EquipmentExportSummary>(value => value.locId)(summary)), [
    summary,
  ]);
  return (
    <TableContainer>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell style={{ backgroundColor: 'white' }} colSpan={1} />
            {columns.map(status => (
              <TableCell colSpan={8} className={classes.statusCell} key={status}>
                {status}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Depot Location</TableCell>
            {columns.map((_, index) => (
              <ContainerTypeCells key={index} />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {groupedSummary?.map(([locId, equipment], index) => (
            <EquipmentControlExportRow equipmentControl={equipment} key={index} locId={locId} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ExportFlowsTable;
