import React, { Fragment, useContext, useMemo } from 'react';
import { EquipmentExportSummary } from '../../model/EquipmentControl';
import TableRow from '@material-ui/core/TableRow';
import { TableCell } from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';
import mergeAndSumObjects from '../../utilities/mergeAndSumObjects';
import { nth } from 'lodash/fp';

const columns = ['WK1', 'WK2', 'WK3'];
const containerTypes = ['22G1', '42G1', '45G1', '22R1', '45R1', '22U1', '42U1', '45U1'];

const EquipmentControlExportRow: React.FC<EquipmentControlRowProps> = ({ locId, equipmentControl }) => {
  const locations = useContext(PickupLocations);
  const location = useMemo(() => locations?.find(loc => loc.id === locId), [locId, locations]);
  const totalByContainers = useMemo(
    () =>
      equipmentControl
        .map(ec => ec.containers)
        .reduce((previousValue, currentValue) => {
          return mergeAndSumObjects(previousValue, currentValue);
        }, {}),
    [equipmentControl],
  );

  return (
    <TableRow>
      <TableCell>{location?.name}</TableCell>
      {columns.map((s, index) => {
        const containers = get(nth(index)(equipmentControl), 'containers', {});
        return (
          <Fragment key={index}>
            {containerTypes.map((type, index) => {
              const c = get(containers, type, '-');
              return <TableCell key={index}>{c}</TableCell>;
            })}
          </Fragment>
        );
      })}
      <>
        {containerTypes.map((type, index) => {
          const c = get(totalByContainers, type, '-');
          return <TableCell key={index}>{c}</TableCell>;
        })}
      </>
    </TableRow>
  );
};

export default EquipmentControlExportRow;

interface EquipmentControlRowProps {
  locId: string;
  equipmentControl: EquipmentExportSummary[];
}
