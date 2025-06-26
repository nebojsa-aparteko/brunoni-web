import React, { useCallback, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import DeliveryGroupRow from './DeliveryGroupRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@material-ui/core';
import { ADMIN_ROLES, UserRecordMin } from '../../model/UserRecord';
import CloseIcon from '@material-ui/icons/Close';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import { DeliveryGroup } from '../../model/DeliveryGroup';
import PlacesMultiInput from '../inputs/PlacesMultiInput';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    minWidth: 650,
  },
  dialogContent: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  formRow: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
}));

interface AddDeliveryGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedGroups?: UserRecordMin[];
}

const AddGroupDilog: React.FC<AddDeliveryGroupDialogProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [places, setPlaces] = useState<string[]>([]);

  const handlePlacesChange = (selectedPlaces: string[]) => {
    setPlaces(selectedPlaces);
  };

  const handleAddGroup = useCallback(() => {
    const filteredPlaces = places.filter(place => place.trim() !== '');
    console.debug('Adding group:', { name: groupName, places: filteredPlaces });
    setGroupName('');
    setPlaces([]);
    handleClose();
  }, [groupName, places, handleClose]);

  const handleDialogClose = () => {
    setGroupName('');
    setPlaces([]);
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      aria-labelledby="addGroupsDialogTitle"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle disableTypography id="addGroupsDialogTitle">
        <Typography variant="h4">Add new delivery group</Typography>
        <IconButton onClick={handleDialogClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <div className={classes.formRow}>
          <TextField
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            style={{ width: 300 }}
            required
          />

          <div style={{ flex: 1 }}>
            <PlacesMultiInput data={[]} selectedPlaces={places} onChange={handlePlacesChange} />
          </div>
        </div>

        <Button
          color="primary"
          variant="contained"
          onClick={handleAddGroup}
          disabled={!groupName.trim() || places.length === 0}
          style={{ width: 120 }}
        >
          Add Group
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const DeliveryGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isDeliveryGroupDialogOpen, setIsDeliveryGroupDialogOpen] = useState(false);
  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedGroups(prevState =>
        selectedGroups.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedGroups],
  );

  const handleSelectDeselectAll = () => {
    if (selectedGroups.length !== deliveryGroups.length) {
      setSelectedGroups(deliveryGroups.map(group => group.id || ''));
    } else {
      setSelectedGroups([]);
    }
  };

  const deliveryGroups = [
    {
      id: '1',
      name: 'DeliveryGroup 1',
      places: ['Sri Lanka', 'Mogadishu', 'Berlin', 'Moscow'],
    } as DeliveryGroup,
    {
      id: '2',
      name: 'Delivery Group 2',
      places: ['Ulaanbaatar', 'Moscow', 'Berlin', 'Paris', 'London'],
    } as DeliveryGroup,
  ];
  return (
    <Box flexGrow={1}>
      {!deliveryGroups ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedGroups.length}
            handleAdd={() => setIsDeliveryGroupDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
            labelWhenSelected={
              selectedGroups.length === 1
                ? `${selectedGroups.length} group selected`
                : `${selectedGroups.length} groups selected`
            }
            addButtonLabel={'Add delivery group'}
            deleteButtonLabel={selectedGroups.length === 1 ? `Delete admin` : `Delete admins`}
            labelWhenNotSelected={'Delivery groups'}
          />
          <TableContainer>
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedGroups.length === deliveryGroups.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Places</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryGroups?.map((group, index) => (
                  <DeliveryGroupRow
                    deliveryGroup={group}
                    key={`delivery-group-${group.id}-${index}`}
                    selected={group.id ? selectedGroups.includes(group.id) : false}
                    onSelectRow={event => group.id && onSelectRow(event, group.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <AddGroupDilog
        isOpen={isDeliveryGroupDialogOpen}
        handleClose={() => setIsDeliveryGroupDialogOpen(false)}
      />
      {/* <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveAdminRights}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want remove admin rights from selected users?"
      /> */}
    </Box>
  );
};

export default DeliveryGroupsContainer;
