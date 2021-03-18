import React, { useContext, useMemo } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import {
  containerTypesLabels,
  containerTypesValues,
  EquipmentImportSummary,
  statusKeys,
  statusLabels,
} from '../../model/EquipmentControl';
import { makeStyles, Theme } from '@material-ui/core';
import theme from '../../theme';
import TableBody from '@material-ui/core/TableBody';
import EquipmentControlImportRow from './EquipmentControlImportRow';
import { get, set } from 'lodash';
import mergeAndSumObjects from '../../utilities/mergeAndSumObjects';
import PickupLocations from '../../contexts/PickupLocations';
import { groupBy } from 'lodash/fp';
import CountryCodes from '../../model/CountryCodes';

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

const getContainerTypeCells = () => (
  <>
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
  </>
);

interface ImportFlowsTableProps {
  summary: EquipmentImportSummary[];
}

const ImportFlowsTable: React.FC<ImportFlowsTableProps> = ({ summary }) => {
  const classes = useStyles();
  const locations = useContext(PickupLocations);
  // const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [locations]);

  const groupedSummary = useMemo(
    () =>
      Object.entries(
        groupBy<EquipmentImportSummary>(s => locations?.find(loc => loc.id === get(s, 'id', '-'))?.countryCode)(
          summary,
        ),
      ),
    [summary, locations],
  );
  const total = useMemo(() => {
    return summary?.reduce((previousValue, currentValue) => {
      const sum = {};
      statusKeys.forEach(key => {
        set(sum, key, mergeAndSumObjects(get(previousValue, key), get(currentValue, key)));
      });
      return sum;
    }, {});
  }, [summary]);

  return (
    <TableContainer>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell style={{ backgroundColor: 'white' }} colSpan={1} />
            {statusLabels.map(status => (
              <TableCell colSpan={8} className={classes.statusCell} key={status}>
                {status}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Depot Location</TableCell>
            {statusLabels.map(() => getContainerTypeCells())}
          </TableRow>
        </TableHead>
        <TableBody>
          {groupedSummary.map(([countryCode, group]) => (
            <>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>{get(CountryCodes, countryCode, '-')}</TableCell>
              </TableRow>
              {group?.map((equipment, index) => (
                <EquipmentControlImportRow equipmentControl={equipment} key={index} />
              ))}
            </>
          ))}
          {summary?.length > 0 && (
            <TableRow hover>
              <TableCell>Total</TableCell>
              {statusKeys.map(key => {
                const status = get(total, `${key}`, {});
                return (
                  <>
                    {containerTypesValues.map(type => {
                      const c = get(status, type, '-');
                      return <TableCell>{c}</TableCell>;
                    })}
                  </>
                );
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ImportFlowsTable;
