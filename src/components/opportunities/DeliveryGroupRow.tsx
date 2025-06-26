import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useEffect, useState } from 'react';
import { DeliveryGroup } from '../../model/DeliveryGroup';
import { Button, Checkbox, TextField } from '@material-ui/core';
import PlacesMultiInput from '../inputs/PlacesMultiInput';

interface Props extends React.Attributes {
  deliveryGroup: DeliveryGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const DeliveryGroupRow: React.FC<Props> = ({ deliveryGroup, selected, onSelectRow, ...other }) => {
  const [activeDeliveryGroup, setActiveDeliveryGroup] = useState(deliveryGroup);

  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActiveDeliveryGroup(deliveryGroup);
  }, [deliveryGroup]);

  const onSave = useCallback(() => {
    console.debug('onSave not implemented yet');
  }, []);

  return (
    <TableRow {...other}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event)}
          onFocus={event => event.stopPropagation()}
          color="primary"
        />
      </TableCell>
      <TableCell component="th" scope="row" style={{ minWidth: '150px' }}>
        <TextField defaultValue={deliveryGroup?.name} placeholder="Team name" />
      </TableCell>
      <TableCell align="right">
        <PlacesMultiInput data={[]} selectedPlaces={deliveryGroup?.places} />
      </TableCell>

      <TableCell align="right">
        {changed && (
          <Button onClick={onSave} size="small" color="primary" variant="contained">
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DeliveryGroupRow;
