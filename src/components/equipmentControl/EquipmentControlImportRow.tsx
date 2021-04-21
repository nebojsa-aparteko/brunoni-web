import React, { Fragment, useContext, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  containerTypesLabels,
  containerTypesValues,
  EquipmentImportSummary,
  statusLabels,
} from '../../model/EquipmentControl';
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Popover,
  TableCell,
} from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';
import { groupBy } from 'lodash/fp';
import useUser from '../../hooks/useUser';
import { importFlowsStyles } from './ImportFlowsTable';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';

const getBookingsByEC = async (
  token: string,
  containerType: string,
  equipmentStatus: string,
  locId: string,
  carrierId: string,
) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/equipmentControl/getBookingsByEC?containerType=${containerType}&equipmentStatus=${equipmentStatus}&locId=${locId}&carrierId=${carrierId}`,
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
  const classes = importFlowsStyles();
  const [user] = useUser();
  const locations = useContext(PickupLocations);
  const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [
    locations,
    equipmentControl,
  ]);
  const [filters] = useEquipmentControlFilterProviderContext();
  const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLTableHeaderCellElement) | null>(null);
  const [bookings, setBookings] = useState<{ bookingId: string; count: number }[]>();
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <Fragment>
      <TableCell
        style={{ whiteSpace: 'nowrap' }}
        className={clsx(classes.stickySide, classes.hoverColorControl, classes.borderRight)}
      >
        {location?.name || equipmentControl.id}
      </TableCell>
      {statusLabels.map((s, index) => {
        const status = get(equipmentControl, s, {});
        const groupedStatus = groupBy<any>(sa => sa.containerType)(status);
        return (
          <Fragment key={`${location?.id}-${s}`}>
            {containerTypesValues.map((type, index) => {
              const c = get(groupedStatus, type, []);
              return (
                <TableCell
                  aria-describedby={id}
                  key={`${type}-${s}`}
                  className={clsx({ [classes.borderRight]: containerTypesLabels.length === index + 1 })}
                  onClick={event => {
                    setAnchorEl(event.currentTarget);
                    setBookings(undefined);
                    user
                      .getIdToken()
                      .then(token =>
                        getBookingsByEC(
                          token,
                          type,
                          s === 'TOTAL' ? '-' : s,
                          equipmentControl.id || '-',
                          filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id!,
                        ),
                      )
                      .then(response => {
                        setBookings(response);
                      });
                  }}
                >
                  {get(c.pop(), 'count', '-')}
                </TableCell>
              );
            })}
          </Fragment>
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
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader component="div" id="nested-list-subheader" disableSticky>
              Bookings
            </ListSubheader>
          }
          className={classes.list}
        >
          {bookings?.map(bkg => (
            <ListItem
              key={bkg.bookingId}
              button
              onClick={() => {
                window.open(`/bookings/${bkg.bookingId}`, '_blank');
              }}
            >
              <ListItemText primary={`${bkg.bookingId} (${bkg.count || 0})`} />
            </ListItem>
          )) || (
            <Box pb={4} width={1} display="flex" alignItems="center" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
        </List>
      </Popover>
    </Fragment>
  );
};

export default EquipmentControlImportRow;

interface EquipmentControlRowProps {
  equipmentControl: EquipmentImportSummary;
}
