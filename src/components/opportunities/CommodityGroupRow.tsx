import React, { useState, useCallback, useEffect } from 'react';
import { TableRow, TableCell, Checkbox, TextField, Button, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import CommoditiesMultiInput from '../inputs/CommoditiesMultiInput';
import { isEqual } from 'lodash/fp';

interface Props extends React.Attributes {
  commodityGroup: OpportunityCommodityGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  onSave?: (commodityGroup: OpportunityCommodityGroup) => void;
  onDelete?: (id: string) => void;
}

const useStyles = makeStyles({
  nameField: {
    minWidth: '200px',
  },
  commoditiesCell: {
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

const CommodityGroupRow: React.FC<Props> = ({
  commodityGroup,
  selected,
  onSelectRow,
  onSave,
  onDelete,
  ...other
}) => {
  const classes = useStyles();
  const [activeCommodityGroup, setActiveCommodityGroup] =
    useState<OpportunityCommodityGroup>(commodityGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActiveCommodityGroup(commodityGroup);
    setChanged(false);
  }, [commodityGroup]);

  useEffect(() => {
    const hasChanges = !isEqual(commodityGroup, activeCommodityGroup);
    setChanged(hasChanges);
  }, [commodityGroup, activeCommodityGroup]);

  const handleNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setActiveCommodityGroup(prev => ({
      ...prev,
      name: newName,
    }));
  }, []);

  const handleCommoditiesChange = useCallback((commodities: string[]) => {
    setActiveCommodityGroup(prev => ({
      ...prev,
      commodities,
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (onSave && changed) {
      onSave(activeCommodityGroup);
    }
  }, [onSave, activeCommodityGroup, changed]);

  const handleReset = useCallback(() => {
    setActiveCommodityGroup(commodityGroup);
    setChanged(false);
  }, [commodityGroup]);

  const handleDelete = useCallback(() => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${commodityGroup.name}"?`)) {
      onDelete(commodityGroup.id);
    }
  }, [onDelete, commodityGroup]);

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
        <TextField
          value={activeCommodityGroup.name}
          onChange={handleNameChange}
          placeholder="Group name"
          size="small"
          fullWidth
        />
      </TableCell>

      <TableCell className={classes.commoditiesCell}>
        <CommoditiesMultiInput
          selectedCommodities={activeCommodityGroup.commodities}
          onChange={handleCommoditiesChange}
          label=""
          placeholder="Add commodity..."
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
          <Button
            onClick={handleReset}
            size="small"
            color="default"
            variant="outlined"
            disabled={!changed}
          >
            Reset
          </Button>
          <Button onClick={handleDelete} size="small" color="secondary" variant="outlined">
            Delete
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default CommodityGroupRow;
