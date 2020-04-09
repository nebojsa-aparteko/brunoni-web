import React, { useCallback, useMemo } from 'react';
import { Checkbox, createStyles, makeStyles, TableCell, TableRow, Theme, Typography } from '@material-ui/core';
import { ChecklistItem, ChecklistItemValue } from './checklistItemsData';
import { useSnackbar } from 'notistack';
import useClients from '../../../hooks/useClients';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import ChecklistItemValueComponent from './ChecklistItemValueComponent';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRow: {
      height: '55px',
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 12px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
  }),
);
const ChecklistItemRow = ({ booking, checklistItem, isAdmin }: ChecklistItemRowProp) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const clients = useClients();
  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', `${client?.id}`, 'bookings', `${booking?.id}`].join('/');
  }, [booking, client]);

  const saveChecklistChanges = useCallback(
    async (field: string, value: ChecklistItemValue | boolean) => {
      try {
        await firebase
          .firestore()
          .collection('bookings')
          .doc(booking?.id)
          .collection('checklist')
          .doc(checklistItem.id)
          .update(field, value)
          .then(() =>
            enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
              variant: 'success',
              autoHideDuration: 1000,
            }),
          )
          .catch((error: any) => console.log(error));
      } catch (e) {
        console.log(e);
      }
    },
    [checklistItem, booking],
  );

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      saveChecklistChanges('checked', event.target.checked);
    },
    [saveChecklistChanges],
  );

  return (
    <TableRow selected={checklistItem.checked} className={classes.tableRow} key={checklistItem.id}>
      <TableCell>
        <Checkbox checked={checklistItem.checked} disabled={!isAdmin} onChange={event => handleCheckboxChange(event)} />
      </TableCell>

      <TableCell>{checklistItem.label}</TableCell>

      {/*Customer Data*/}

      {checklistItem.valueCustomer ? (
        <ChecklistItemValueComponent
          checklistValue={checklistItem.valueCustomer}
          saveChecklistChanges={saveChecklistChanges}
          storageBasePath={storageBasePath}
          valuePath={'valueCustomer'}
        />
      ) : (
        <TableCell>&nbsp; </TableCell>
      )}

      {/*Admin Data*/}
      {isAdmin && checklistItem.valueAdmin ? (
        <ChecklistItemValueComponent
          checklistValue={checklistItem.valueAdmin}
          saveChecklistChanges={saveChecklistChanges}
          storageBasePath={storageBasePath}
          valuePath={'valueAdmin'}
        />
      ) : (
        <TableCell>&nbsp; </TableCell>
      )}
    </TableRow>
  );
};

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking | undefined;
}

export default ChecklistItemRow;
