import React from 'react';
import { EquipmentImportSummary } from '../../model/EquipmentControl';
import TableRow from '@material-ui/core/TableRow';
import { TableCell } from '@material-ui/core';
import { get } from 'lodash';

const statuses = ['On Water', 'Arrived', 'Gate Out', 'Total', 'Today'];
const containerTypes = ['20DC', '15G12', '45G1', '40HC', '20RF', '40RH', '20OT', '40OT'];

const EquipmentControlRow: React.FC<EquipmentControlRowProps> = ({ equipmentControl }) => {
  return (
    <TableRow>
      <TableCell>{get(equipmentControl, 'id', '-')}</TableCell>
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
