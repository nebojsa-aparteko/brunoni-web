import React, { useContext, useMemo } from 'react';
import { containerTypesValues, EquipmentImportSummary, statusKeys } from '../../model/EquipmentControl';
import TableRow from '@material-ui/core/TableRow';
import { TableCell } from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';

const EquipmentControlImportRow: React.FC<EquipmentControlRowProps> = ({ equipmentControl }) => {
  const locations = useContext(PickupLocations);
  const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [locations]);
  return (
    <TableRow>
      <TableCell>{location?.name}</TableCell>
      {statusKeys.map(s => {
        const status = get(equipmentControl, s, {});
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
  );
};

export default EquipmentControlImportRow;

interface EquipmentControlRowProps {
  equipmentControl: EquipmentImportSummary;
}
