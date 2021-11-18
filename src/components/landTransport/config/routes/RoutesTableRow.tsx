import { AutomaticProviderRoute } from '../../../../model/land-transport/providers/ProviderRoutes';
import React, { useState } from 'react';
import { Checkbox, TableCell, TableRow } from '@material-ui/core';
import { format } from 'date-fns';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import RouteDetailsModal from './RouteDetailsModal';
import { makeStyles, Theme } from '@material-ui/core/styles';
import palette from '../../../../theme/palette';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: palette.background.hover,
    },
  },
}));

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
      <TableCell>{format(route.addedAt.toDate(), 'dd-MM-yyyy HH:mm')}</TableCell>
      <TableCell>
        {route.active ? (
          <FiberManualRecordIcon style={{ fill: 'lightgreen' }} />
        ) : (
          <FiberManualRecordIcon color={'error'} />
        )}
      </TableCell>
      <TableCell style={{ display: 'none' }}>
        <RouteDetailsModal provider={provider} route={route} open={open} setOpen={setOpen} />
      </TableCell>
    </TableRow>
  );
};

export default RoutesTableRow;
