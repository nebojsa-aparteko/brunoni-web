import React, { useContext, useMemo, useState } from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import PickupLocations from '../../contexts/PickupLocations';
import { EquipmentSummary } from '../../model/EquipmentSummary';
import PickupLocation from '../../model/PickupLocation';
import { makeStyles, Theme } from '@material-ui/core';
import theme from '../../theme';

const useStyles = makeStyles((theme: Theme) => ({
  defaultCell: {
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'white',
  },
  statusCell: {
    borderLeft: `1px solid black`,
    alignItems: 'center',
  },
}));

const statuses = ['ON WATER', 'ARRIVED', 'GATE OUT'];
const containerTypes = ['20DC', '40DC', '40HC', '20RF', '40RH', '20OT', '40OT', '40OH'];

const getContainerTypeCells = () => (
  <>
    {containerTypes.map(containerType => (
      <TableCell style={{ border: `1px solid ${theme.palette.divider}`, backgroundColor: 'white' }}>
        {containerType}
      </TableCell>
    ))}
  </>
);

//TODO replace EquipmentSummary[] with container counts depending on the structure
interface ImportFlowsTableProps {
  equipment: EquipmentSummary[];
}

const ImportFlowsTable: React.FC<ImportFlowsTableProps> = ({ equipment }) => {
  const classes = useStyles();
  const pickupLocations = useContext(PickupLocations);
  const [filteredPickupLocations, setFilteredLocations] = useState<PickupLocation[] | undefined>();

  //TODO display only CH depots if "show more" isn't enabled
  useMemo(() => {
    setFilteredLocations(
      pickupLocations
        ? pickupLocations.filter(
            location => location.countryCode === 'CH' && equipment.some(e => e.locId === location.id),
          )
        : undefined,
    );
  }, [pickupLocations, equipment]);

  return (
    <TableContainer>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell colSpan={1} style={{ backgroundColor: 'white' }} />
            {statuses.map(status => (
              <TableCell colSpan={8} className={classes.statusCell}>
                {status}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Depot Location / C. Type</TableCell>
            {statuses.map(() => getContainerTypeCells())}
          </TableRow>
          {filteredPickupLocations &&
            filteredPickupLocations?.map(location => (
              <TableRow>
                <TableCell align="left">{location.name}</TableCell>
              </TableRow>
            ))}
        </TableHead>
      </Table>
    </TableContainer>
  );
};

export default ImportFlowsTable;
