import React, { useCallback, useContext, useMemo, useState } from 'react';
import { containerTypesValues, EquipmentImportSummary, statusLabels } from '../../model/EquipmentControl';
import TableRow from '@material-ui/core/TableRow';
import { Box, Link, Popover, TableCell, Typography } from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';
import { groupBy } from 'lodash/fp';
import useUser from '../../hooks/useUser';
import { useHistory } from 'react-router';

const getBookingsByEC = async (token: string, containerType: string, equipmentStatus: string, locId: string) => {
  try {
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
  const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [
    locations,
    equipmentControl,
  ]);
  const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLTableHeaderCellElement) | null>(null);
  const [bookings, setBookings] = useState<{ bookingId: string }[]>();
  const handleClose = () => {
    setAnchorEl(null);
  };
  const history = useHistory();

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
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
                  aria-describedby={id}
                  key={`${type}-${s}`}
                  onClick={event => {
                    setAnchorEl(event.currentTarget);
                    setBookings(undefined);
                    user
                      .getIdToken()
                      .then(token => getBookingsByEC(token, type, s === 'TOTAL' ? '-' : s, equipmentControl.id || '-'))
                      .then(response => {
                        setBookings(response);
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

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box display="flex" flexDirection="column" padding={3}>
          {bookings?.map(bkg => (
            <Link
              component="button"
              onClick={() => {
                history.push(`/bookings/${bkg.bookingId}`);
              }}
              style={{ paddingTop: 1, paddingBottom: 1 }}
            >
              {bkg.bookingId}
            </Link>
          ))}
        </Box>
      </Popover>
    </TableRow>
  );
};

export default EquipmentControlImportRow;

interface EquipmentControlRowProps {
  equipmentControl: EquipmentImportSummary;
}
