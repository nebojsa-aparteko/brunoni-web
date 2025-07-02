import React, { useState, useCallback, useEffect } from 'react';
import { TableRow, TableCell, Checkbox, TextField, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import PortsMultiInput from '../inputs/PortsMultiInput';
import { isEqual } from 'lodash/fp';

interface Props extends React.Attributes {
  portGroup: OpportunityPortsGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  onSave?: (portGroup: OpportunityPortsGroup) => void;
  onDelete?: (id: string) => void;
}

const useStyles = makeStyles({
  nameField: {
    minWidth: '200px',
  },
  portsCell: {
    minWidth: '300px',
    maxWidth: '400px',
  },
  actionsCell: {
    minWidth: '120px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '8px',
  },
});

const PortGroupRow: React.FC<Props> = ({
  portGroup,
  selected,
  onSelectRow,
  onSave,
  onDelete,
  ...other
}) => {
  const classes = useStyles();
  const [activePortGroup, setActivePortGroup] = useState<OpportunityPortsGroup>(portGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActivePortGroup(portGroup);
    setChanged(false);
  }, [portGroup]);

  useEffect(() => {
    const hasChanges = !isEqual(portGroup, activePortGroup);
    setChanged(hasChanges);
  }, [portGroup, activePortGroup]);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setActivePortGroup(prev => ({
      ...prev,
      name: newName,
    }));
  }, []);

  const handlePortsChange = useCallback((portIds: string[]) => {
    setActivePortGroup(prev => ({
      ...prev,
      portIds,
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (onSave && changed) {
      onSave(activePortGroup);
    }
  }, [onSave, activePortGroup, changed]);

  const handleReset = useCallback(() => {
    setActivePortGroup(portGroup);
    setChanged(false);
  }, [portGroup]);

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${portGroup.name}"?`)) {
      onDelete(portGroup.id);
    }
  }, [onDelete, portGroup]);

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

      <TableCell component="th" scope="row" className={classes.nameField}>
        <TextField
          value={activePortGroup.name}
          onChange={handleNameChange}
          placeholder="Group name"
          variant="outlined"
          size="small"
          fullWidth
        />
      </TableCell>

      <TableCell className={classes.portsCell}>
        <PortsMultiInput
          selectedPortIds={activePortGroup.portIds}
          onChange={handlePortsChange}
          label=""
        />
      </TableCell>

      <TableCell className={classes.actionsCell}>
        <Box className={classes.buttonContainer}>
          <Button
            onClick={handleSave}
            size="small"
            color="primary"
            variant="contained"
            disabled={!changed}
          >
            Save
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default PortGroupRow;
