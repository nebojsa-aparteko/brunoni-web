import React, { Fragment, useContext, useMemo, useState } from 'react';
import {
  containerTypesLabels,
  containerTypesValues,
  EquipmentExportSummary,
  weeksColumns,
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
  Tooltip,
} from '@material-ui/core';
import { get } from 'lodash';
import PickupLocations from '../../contexts/PickupLocations';
import { groupBy } from 'lodash/fp';
import clsx from 'clsx';
import { importFlowsStyles } from './ImportFlowsTable';
import { useEquipmentControlFilterProviderContext } from '../../providers/EquipmentControlFilterProvider';
import useUser from '../../hooks/useUser';
import truncateString from '../../utilities/truncateString';

const getBookingsByEC = async (
  token: string,
  containerType: string,
  week: string,
  locId: string,
  carrierId: string,
) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/equipmentControl/getBookingsByEC?containerType=${containerType}&week=${week}&locId=${locId}&carrierId=${carrierId}`,
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
const EquipmentControlExportRow: React.FC<EquipmentControlRowProps> = ({ equipmentControl }) => {
  const locations = useContext(PickupLocations);
  const location = useMemo(() => locations?.find(loc => loc.id === get(equipmentControl, 'id', '-')), [
    locations,
    equipmentControl,
  ]);
  const classes = importFlowsStyles();
  const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLTableHeaderCellElement) | null>(null);
  const [bookings, setBookings] = useState<{ bookingId: string; count: number; bookingStatus: string }[]>();
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [filters] = useEquipmentControlFilterProviderContext();
  const [user] = useUser();
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <Fragment>
      <Tooltip title={location?.name || equipmentControl.id!}>
        <TableCell
          style={{ whiteSpace: 'nowrap' }}
          className={clsx(classes.stickySide, classes.hoverColorControl, classes.borderRight, classes.cityCell)}
        >
          {truncateString(location?.name || equipmentControl.id!, 13)}
        </TableCell>
      </Tooltip>
      {weeksColumns.map(s => {
        const status = get(equipmentControl, s, {});
        const groupedStatus = groupBy<any>(sa => sa.containerType)(status);
        return (
          <Fragment key={`${location?.id}-${s}`}>
            {containerTypesValues.map((type, index) => {
              const c = get(groupedStatus, type, []);
              const data = c.pop();
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
                          get(data, 'week', '-1'),
                          equipmentControl.id || '-',
                          filters.carrier?.id === 'HSG' ? 'Hamburg Süd' : filters.carrier?.id!,
                        ),
                      )
                      .then(response => {
                        setBookings(response);
                      });
                  }}
                >
                  {get(data, 'count', '-')}
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

export default EquipmentControlExportRow;

interface EquipmentControlRowProps {
  equipmentControl: EquipmentExportSummary;
}
