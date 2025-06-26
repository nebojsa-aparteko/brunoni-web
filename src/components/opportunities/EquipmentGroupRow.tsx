import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useEffect, useState } from 'react';
import { EquipmentGroup } from '../../model/EquipmentGroup';
import { Button, Checkbox, TextField } from '@material-ui/core';
import EquipmentMultiInput from '../inputs/EquipmentMultiInput';

interface Props extends React.Attributes {
  equipmentGroup: EquipmentGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const EquipmentGroupRow: React.FC<Props> = ({
  equipmentGroup,
  selected,
  onSelectRow,
  ...other
}) => {
  const [activeEquipmentGroup, setActiveEquipmentGroup] = useState(equipmentGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActiveEquipmentGroup(equipmentGroup);
  }, [equipmentGroup]);

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
        <TextField defaultValue={equipmentGroup?.name} placeholder="Group name" />
      </TableCell>
      <TableCell align="right">
        <EquipmentMultiInput selectedEquipment={equipmentGroup?.equipment} />
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

export default EquipmentGroupRow;
