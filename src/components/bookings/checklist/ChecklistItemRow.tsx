import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  createStyles,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  makeStyles,
  TableCell,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import { ChecklistItem, ChecklistItemValue, FieldType } from './checklistItemsData';
import { useSnackbar } from 'notistack';
import useClients from '../../../hooks/useClients';
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import ChecklistItemValueComponent, {
  CheckListItemValueFiles,
  ChecklistItemValueText,
} from './ChecklistItemValueComponent';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DirectionsBoatIcon from '@material-ui/icons/DirectionsBoat';
import ListAltIcon from '@material-ui/icons/ListAlt';
import { forEach, uniqBy } from 'lodash/fp';

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

  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [showFiles, setShowFiles] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPrivateFiles, setShowPrivateFiles] = useState(false);

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

  useEffect(() => {
    // const uniqItems = uniqBy('type')(checklistItem?.values);
    checklistItem &&
      checklistItem.values &&
      forEach((item: ChecklistItemValue) => {
        switch (item.type) {
          case FieldType.CHECKMARK:
            setShowNotes(true);
            break;
          case FieldType.TEXT:
            setShowNotes(true);
            break;
          case FieldType.FILE:
            setShowFiles(true);
            break;
        }
      })(checklistItem?.values);
    if (checklistItem && checklistItem?.valuesAdmin && checklistItem?.valuesAdmin.length > 0) {
      setShowPrivateFiles(true);
    }
  }, [checklistItem, booking]);

  const onMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMoreAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setMoreAnchorEl(null);
  };

  const handleAddNote = () => {
    setShowNotes(true);
    handleClose();
  };

  const handleAddFile = () => {
    setShowFiles(true);
    handleClose();
  };

  const handleAddPrivateFile = () => {
    setShowPrivateFiles(true);
    handleClose();
  };

  return (
    <TableRow selected={checklistItem.checked} className={classes.tableRow} key={checklistItem.id}>
      <TableCell>
        <Checkbox checked={checklistItem.checked} disabled={!isAdmin} onChange={event => handleCheckboxChange(event)} />
      </TableCell>

      <TableCell>{checklistItem.label}</TableCell>

      {/*Customer Data*/}
      <TableCell>
        <Grid container spacing={2}>
          <Grid item>
            {showFiles && (
              <CheckListItemValueFiles
                storageBasePath={storageBasePath}
                valuePath={'values'}
                saveChecklistChanges={saveChecklistChanges}
              />
            )}
            {showNotes && <ChecklistItemValueText valuePath={'values'} saveChecklistChanges={saveChecklistChanges} />}

            {checklistItem?.values &&
              checklistItem.values.map(item => (
                <ChecklistItemValueComponent
                  checklistValue={item}
                  saveChecklistChanges={saveChecklistChanges}
                  storageBasePath={storageBasePath}
                  valuePath={'values'}
                />
              ))}

            {/*Admin Data*/}
            {isAdmin && (
              <Fragment>
                <Divider />
                {checklistItem.valuesAdmin?.map(item => (
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
      </TableCell>
    </TableRow>
  );
};

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking | undefined;
}

export default ChecklistItemRow;
