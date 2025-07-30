import React, { useState, useCallback, useEffect } from 'react';
import { TableRow, TableCell, Checkbox, TextField, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import EquipmentMultiInput from '../inputs/EquipmentMultiInput';
import { isEqual } from 'lodash/fp';

interface Props extends React.Attributes {
  equipmentGroup: OpportunityEquipmentGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  onSave?: (equipmentGroup: OpportunityEquipmentGroup) => void;
  onDelete?: (id: string) => void;
}

const useStyles = makeStyles({
  nameField: {
    minWidth: '200px',
  },
  equipmentCell: {
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

const EquipmentGroupRow: React.FC<Props> = ({
  equipmentGroup,
  selected,
  onSelectRow,
  onSave,
  onDelete,
  ...other
}) => {
  const classes = useStyles();
  const [activeEquipmentGroup, setActiveEquipmentGroup] =
    useState<OpportunityEquipmentGroup>(equipmentGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActiveEquipmentGroup(equipmentGroup);
    setChanged(false);
  }, [equipmentGroup]);

  useEffect(() => {
    const hasChanges = !isEqual(equipmentGroup, activeEquipmentGroup);
    setChanged(hasChanges);
  }, [equipmentGroup, activeEquipmentGroup]);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setActiveEquipmentGroup(prev => ({
      ...prev,
      name: newName,
    }));
  }, []);

  const handleEquipmentChange = useCallback(
    (equipmentTypeId: string[], equipmentTypeNames: string[]) => {
      setActiveEquipmentGroup(prev => ({
        ...prev,
        equipmentTypeId,
        equipmentTypeNames,
      }));
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (onSave && changed) {
      onSave(activeEquipmentGroup);
    }
  }, [onSave, activeEquipmentGroup, changed]);

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
          value={activeEquipmentGroup.name}
          onChange={handleNameChange}
          placeholder="Group name"
          variant="outlined"
          size="small"
          fullWidth
        />
      </TableCell>

      <TableCell className={classes.equipmentCell}>
        <EquipmentMultiInput
          selectedEquipmentNames={activeEquipmentGroup.equipmentTypeNames}
          selectedEquipmentIds={activeEquipmentGroup.equipmentTypeId}
          onChange={handleEquipmentChange}
          label=""
          placeholder="Select equipment..."
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

export default EquipmentGroupRow;
