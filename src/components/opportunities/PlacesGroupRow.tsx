import React, { useState, useCallback, useEffect } from 'react';
import { TableRow, TableCell, Checkbox, TextField, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import PlacesMultiInput from '../inputs/PlacesMultiInput';
import { isEqual } from 'lodash/fp';

interface Props extends React.Attributes {
  placesGroup: OpportunityPlacesGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  onSave?: (placesGroup: OpportunityPlacesGroup) => void;
  onDelete?: (id: string) => void;
}

const useStyles = makeStyles({
  nameField: {
    minWidth: '200px',
  },
  placesCell: {
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

const PlacesGroupRow: React.FC<Props> = ({
  placesGroup,
  selected,
  onSelectRow,
  onSave,
  onDelete,
  ...other
}) => {
  const classes = useStyles();
  const [activePlacesGroup, setActivePlacesGroup] = useState<OpportunityPlacesGroup>(placesGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActivePlacesGroup(placesGroup);
    setChanged(false);
  }, [placesGroup]);

  useEffect(() => {
    const hasChanges = !isEqual(placesGroup, activePlacesGroup);
    setChanged(hasChanges);
  }, [placesGroup, activePlacesGroup]);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setActivePlacesGroup(prev => ({
      ...prev,
      name: newName,
    }));
  }, []);

  const handlePlacesChange = useCallback((places: string[]) => {
    setActivePlacesGroup(prev => ({
      ...prev,
      places,
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (onSave && changed) {
      onSave(activePlacesGroup);
    }
  }, [onSave, activePlacesGroup, changed]);

  const handleReset = useCallback(() => {
    setActivePlacesGroup(placesGroup);
    setChanged(false);
  }, [placesGroup]);

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${placesGroup.name}"?`)) {
      onDelete(placesGroup.id);
    }
  }, [onDelete, placesGroup]);

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
          value={activePlacesGroup.name}
          onChange={handleNameChange}
          placeholder="Group name"
          variant="outlined"
          size="small"
          fullWidth
        />
      </TableCell>

      <TableCell className={classes.placesCell}>
        <PlacesMultiInput
          selectedPlaces={activePlacesGroup.places}
          onChange={handlePlacesChange}
          label=""
          placeholder="Add place..."
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

export default PlacesGroupRow;
