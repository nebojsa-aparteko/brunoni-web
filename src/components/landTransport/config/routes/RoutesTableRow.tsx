import { AutomaticProviderRoute } from '../../../../model/land-transport/providers/ProviderRoutes';
import React, { useState } from 'react';
import { Checkbox, TableCell, TableRow, Typography } from '@material-ui/core';
import { format } from 'date-fns';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import RouteDetailsModal from './RouteDetailsModal';
import { makeStyles } from '@material-ui/core/styles';
import palette from '../../../../theme/palette';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import green from '@material-ui/core/colors/green';

const useStyles = makeStyles({
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: palette.background.hover,
    },
  },
});

interface RoutesTableRowProps {
  route: AutomaticProviderRoute;
  provider: ProviderEntity;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const RoutesTableRow: React.FC<RoutesTableRowProps> = ({ route, provider, selected, onSelectRow }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <TableRow className={classes.tableRow} onClick={() => setOpen(true)}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event)}
          onFocus={event => event.stopPropagation()}
          color="primary"
        />
      </TableCell>
      <TableCell>{route.version}</TableCell>
      <TableCell>
        <Typography>
          {`
                  ${route.dateRange.startDate ? format(route.dateRange.startDate, 'dd-MM-yyyy') : 'Not defined'}
                  -
                  ${route.dateRange.endDate ? format(route.dateRange.endDate, 'dd-MM-yyyy') : 'Not defined'}
        `}
        </Typography>
      </TableCell>
      <TableCell>{format(route.createdAt, 'dd-MM-yyyy HH:mm')}</TableCell>
      <TableCell>{format(route.updatedAt, 'dd-MM-yyyy HH:mm')}</TableCell>
      <TableCell>
        {route.active ? (
          <FiberManualRecordIcon style={{ color: green[500], verticalAlign: 'middle' }} />
        ) : (
          <FiberManualRecordIcon color={'error'} style={{ verticalAlign: 'middle' }} />
        )}
      </TableCell>
      <TableCell style={{ display: 'none' }}>
        <RouteDetailsModal provider={provider} route={route} open={open} setOpen={setOpen} />
      </TableCell>
    </TableRow>
  );
};

export default RoutesTableRow;
