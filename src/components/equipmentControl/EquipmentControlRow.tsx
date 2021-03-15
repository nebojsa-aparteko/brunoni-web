import React, { useContext, useMemo } from 'react';
import { EquipmentImportSummary } from '../../model/EquipmentControl';
import TableRow from '@material-ui/core/TableRow';
import { TableCell } from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';

const statuses = ['On Water', 'Arrived', 'Gate Out', 'Total', 'Today'];
const containerTypes = ['22G1', '42G1', '45G1', '22R1', '45R1', '22U1', '42U1', '45U1'];

const EquipmentControlRow: React.FC<EquipmentControlRowProps> = ({ equipmentControl }) => {
  const locations = useContext(PickupLocations);
  const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [locations]);
  return (
    <TableRow>
      <TableCell>{location?.name}</TableCell>
      {statuses.map(s => {
        const status = get(equipmentControl, s, {});
        return (
          <>
            {containerTypes.map(type => {
              const c = get(status, type, '-');
              return <TableCell>{c}</TableCell>;
            })}
          </>
        );
      })}
    </TableRow>
  );
};

export default EquipmentControlRow;

interface EquipmentControlRowProps {
  equipmentControl: EquipmentImportSummary;
}
