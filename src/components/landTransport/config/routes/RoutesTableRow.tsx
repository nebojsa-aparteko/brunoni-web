import { AutomaticProviderRoute } from '../../../../model/land-transport/providers/ProviderRoutes';
import React from 'react';
import { Checkbox, TableCell, TableRow } from '@material-ui/core';
import { format } from 'date-fns';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

interface RoutesTableRowProps {
  route: AutomaticProviderRoute;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const RoutesTableRow: React.FC<RoutesTableRowProps> = ({ route, selected, onSelectRow }) => {
  return (
    <TableRow>
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
    </TableRow>
  );
};

export default RoutesTableRow;
