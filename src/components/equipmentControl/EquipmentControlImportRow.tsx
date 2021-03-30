import React, { useContext, useMemo } from 'react';
import { containerTypesValues, EquipmentImportSummary, statusLabels } from '../../model/EquipmentControl';
import TableRow from '@material-ui/core/TableRow';
import { TableCell } from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';
import { groupBy } from 'lodash/fp';
import useUser from '../../hooks/useUser';

const getBookingsByEC = async (token: string, containerType: string, equipmentStatus: string, locId: string) => {
  try {
    console.log(`?containerType=${containerType}&equipmentStatus=${equipmentStatus}&locId=${locId}`);
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/equipmentControl/getBookingsByEC?containerType=${containerType}&equipmentStatus=${equipmentStatus}&locId=${locId}`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      const body = await response.json();
      console.log('Body', body);
      return body;
    } else {
      const body = await response.json();
      console.error(`Failed to request`, response, body);
      return body;
    }
  } catch (e) {
    console.error('Failed to perform request', e);
  } finally {
  }
};

const EquipmentControlImportRow: React.FC<EquipmentControlRowProps> = ({ equipmentControl }) => {
  const [user] = useUser();
  const locations = useContext(PickupLocations);
  const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [locations]);
  return (
    <TableRow hover>
      <TableCell>{location?.name || equipmentControl.id}</TableCell>
      {statusLabels.map(s => {
        const status = get(equipmentControl, s, {});
        const groupedStatus = groupBy<any>(sa => sa.containerType)(status);
        return (
          <>
            {containerTypesValues.map(type => {
              const c = get(groupedStatus, type, []);
              return (
                <TableCell
                  onClick={event => {
                    user
                      .getIdToken()
                      .then(token => getBookingsByEC(token, type, s === 'TOTAL' ? '-' : s, equipmentControl.id || '-'))
                      .then(response => {
                        console.log(response);
                      });
                  }}
                >
                  {get(c.pop(), 'count', '-')}
                </TableCell>
              );
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
