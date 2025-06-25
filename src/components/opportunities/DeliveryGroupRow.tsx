import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { DeliveryGroup } from '../../model/DeliveryGroup';
import { Button, Checkbox, TextField, Typography } from '@material-ui/core';
import set from 'lodash/fp/set';
import asArray from '../../utilities/asArray';
import { ChecklistNames, ChecklistNamesPreview } from '../bookings/checklist/ChecklistItemModel';
import PlacesMultiInput from '../inputs/PlacesMultiInput';
import Carrier from '../../model/Carrier';
import { useSnackbar } from 'notistack';

interface Props extends React.Attributes {
  deliveryGroup: DeliveryGroup;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const DeliveryGroupRow: React.FC<Props> = ({ deliveryGroup, selected, onSelectRow, ...other }) => {
  const [activeDeliveryGroup, setActiveDeliveryGroup] = useState(deliveryGroup);

  const [changed, setChanged] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setActiveDeliveryGroup(deliveryGroup);
  }, [deliveryGroup]);

  const handleCarrierChange = (event: React.ChangeEvent<{}>, value: Carrier | Carrier[] | null) => {
    // setActiveTeam(set('carriers', asArray(value))(activeTeam));
    // setChanged(true);
    console.debug('handleCarrierChange not implemented yet');
  };

  const handleChecklistItemChange = (
    event: React.ChangeEvent<{}>,
    value: string | string[] | null,
  ) => {
    const checklistNamesPreview = Object.entries(ChecklistNamesPreview);

    setActiveDeliveryGroup(
      set(
        'checklistItems',
        asArray(value)
          .map(val => checklistNamesPreview.find(([, name]) => name === val)?.[0])
          .map(val => ChecklistNames[val as keyof typeof ChecklistNames]),
      )(activeDeliveryGroup),
    );
    setChanged(true);
  };

  const onSave = useCallback(() => {
    // const teamsCollection = firebase.firestore().collection('teams');
    console.debug('onSave not implemented yet');

    //     teamsCollection
    //       .doc(activeTeam.id)
    //       .update(activeTeam)
    //       .then(_ => {
    //         setChanged(false);
    //         enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
    //           variant: 'success',
    //           autoHideDuration: 1000,
    //         });
    //       })
    //       .catch(error => {
    //         console.trace(error);
    //         enqueueSnackbar(<Typography color="inherit"> {tryGetErrorMessage(error)}!</Typography>, {
    //           variant: 'error',
    //           autoHideDuration: 3000,
    //         });
    //       });
  }, [activeDeliveryGroup, enqueueSnackbar]);
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
        <PlacesMultiInput
          options={deliveryGroup?.places || []}
          defaultValues={deliveryGroup?.places || []}
        />
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
