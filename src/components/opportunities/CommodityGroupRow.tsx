import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useEffect, useState } from 'react';
import { CommodityGroup } from '../../model/CommodityGroup';
import { Button, Checkbox, TextField } from '@material-ui/core';
import CommoditiesMultiInput from '../inputs/CommoditiesMultiInput';

interface Props extends React.Attributes {
  commodityGroup: CommodityGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const CommodityGroupRow: React.FC<Props> = ({
  commodityGroup,
  selected,
  onSelectRow,
  ...other
}) => {
  const [activeCommodityGroup, setActiveCommodityGroup] = useState(commodityGroup);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setActiveCommodityGroup(commodityGroup);
  }, [commodityGroup]);

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
        <TextField defaultValue={commodityGroup?.name} placeholder="Group name" />
      </TableCell>
      <TableCell align="right">
        <CommoditiesMultiInput data={[]} selectedCommodities={commodityGroup?.commodities} />
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

export default CommodityGroupRow;
