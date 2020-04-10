import React, { Fragment, useCallback, useMemo, useState } from 'react';
import {
  Checkbox,
  createStyles,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { ChecklistItem, ChecklistItemValue, FieldType } from './checklistItemsData';
import { useSnackbar } from 'notistack';
import useClients from '../../../hooks/useClients';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import ChecklistItemValueComponent from './ChecklistItemValueComponent';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import ListAltIcon from '@material-ui/icons/ListAlt';
import set from 'lodash/fp/set';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 6px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
          width: '10%',
        },
      },
    },
    itemLabel: {
      whiteSpace: 'normal',
      ['@media print']: {
        whiteSpace: 'nowrap',
      },
    },
    hidePrint: {
      ['@media print']: {
        display: 'none',
      },
    },
  }),
);
const ChecklistItemRow = ({ booking, checklistItem, isAdmin }: ChecklistItemRowProp) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const clients = useClients();
  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLButtonElement | null>(null);

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', `${client?.id}`, 'bookings', `${booking?.id}`].join('/');
  }, [booking, client]);

  const [checklistItemValues, setCheckListItemValues] = useState(checklistItem?.values || []);
  const [checklistItemValuesAdmin, setCheckListItemValuesAdmin] = useState(checklistItem?.valuesAdmin || []);
  const [cheklistItemChecked, setCheklistItemChecked] = useState(checklistItem?.checked || false);

  const saveChecklistChanges = useCallback(
    (field: string, value: ChecklistItemValue[] | undefined | boolean) => {
      firebase
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
    },
    [checklistItem, booking],
  );

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCheklistItemChecked(event.target.checked);
      saveChecklistChanges('checked', event.target.checked);
    },
    [saveChecklistChanges],
  );

  const saveItemValue = useCallback(
    (isPrivate: boolean) => {
      saveChecklistChanges(
        isPrivate ? 'values' : 'valuesAdmin',
        isPrivate ? checklistItem.values : checklistItem.valuesAdmin,
      );
    },
    [checklistItem],
  );

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  const handleAddNote = () => {
    setCheckListItemValues([...checklistItemValues, { type: FieldType.TEXT } as ChecklistItemValue]);
    handleClose();
  };

  const handleAddFile = () => {
    setCheckListItemValues([...checklistItemValues, { type: FieldType.FILE } as ChecklistItemValue]);
    handleClose();
  };

  const handleAddPrivateFile = () => {
    setCheckListItemValuesAdmin([...checklistItemValuesAdmin, { type: FieldType.FILE } as ChecklistItemValue]);
    handleClose();
  };

  return (
    <Grid container spacing={2} className={classes.root}>
      <Grid item>
        <Checkbox checked={cheklistItemChecked} disabled={!isAdmin} onChange={event => handleCheckboxChange(event)} />
      </Grid>
      <Grid item>
        <Typography variant="subtitle1">{checklistItem.label}</Typography>
      </Grid>
      {/*Customer Data*/}
      <Grid item container spacing={2}>
        <Grid item xs>
          {checklistItemValues &&
            checklistItemValues.map(item => (
              <ChecklistItemValueComponent
                checklistValue={item}
                saveChecklistChanges={saveChecklistChanges}
                storageBasePath={storageBasePath}
                valuePath={'values'}
              />
            ))}

          {/*Admin Data*/}
          {isAdmin && checklistItemValuesAdmin && checklistItemValuesAdmin.length > 0 && (
            <Fragment>
              <Divider />
              {checklistItemValuesAdmin.map(item => (
                <ChecklistItemValueComponent
                  checklistValue={item}
                  saveChecklistChanges={saveChecklistChanges}
                  storageBasePath={storageBasePath}
                  valuePath={'valuesAdmin'}
                />
              ))}
            </Fragment>
          )}
        </Grid>
        <Grid item>
          <IconButton aria-label="actions" onClick={onMoreButtonClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu id="actions" anchorEl={moreAnchorEl} keepMounted open={Boolean(moreAnchorEl)} onClose={handleClose}>
            <MenuItem onClick={handleAddNote}>
              <ListItemIcon>
                <DirectionsBoatIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Add Note" />
            </MenuItem>
            <MenuItem onClick={handleAddFile}>
              <ListItemIcon>
                <ListAltIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Add File" />
            </MenuItem>
            {isAdmin && (
              <MenuItem onClick={handleAddPrivateFile}>
                <ListItemIcon>
                  <ListAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Add Private File" />
              </MenuItem>
            )}
          </Menu>
        </Grid>
      </Grid>
    </Grid>
  );
};

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking | undefined;
}

export default ChecklistItemRow;
