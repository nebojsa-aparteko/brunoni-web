import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useEffect, useState } from 'react';
import { PortGroup } from '../../model/PortGroup';
import { Button, Checkbox, TextField } from '@material-ui/core';
import PortsMultiInput from '../inputs/PortsMultiInput';

interface Props extends React.Attributes {
  portGroup: PortGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const PortGroupRow: React.FC<Props> = ({ portGroup, selected, onSelectRow, ...other }) => {
  const [activePortGroup, setActivePortGroup] = useState(portGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActivePortGroup(portGroup);
  }, [portGroup]);

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
        <TextField defaultValue={portGroup?.name} placeholder="Group name" />
      </TableCell>
      <TableCell align="right">
        <PortsMultiInput selectedPorts={portGroup?.ports} />
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

export default PortGroupRow;
