import React, { useState, useEffect, useCallback, useContext } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Button,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import firebase from 'firebase/compat/app';
import { GlobalContext } from '../../store/GlobalStore';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import PlacesGroupRow from './PlacesGroupRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
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

const COLLECTION_NAME = 'opportunity-places-groups';

interface AddPlacesGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onAdd: (group: Omit<OpportunityPlacesGroup, 'id'>) => void;
}

const AddGroupDialog: React.FC<AddPlacesGroupDialogProps> = ({ isOpen, handleClose, onAdd }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [places, setPlaces] = useState<string[]>([]);

  const handlePlacesChange = (selectedPlaces: string[]) => {
    setPlaces(selectedPlaces);
  };

  const handleAddGroup = useCallback(() => {
    const filteredPlaces = places.filter(place => place.trim() !== '');
    onAdd({
      name: groupName,
      places: filteredPlaces,
    });
    setGroupName('');
    setPlaces([]);
    handleClose();
  }, [groupName, places, handleClose, onAdd]);

  const handleDialogClose = () => {
    setGroupName('');
    setPlaces([]);
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      aria-labelledby="addPlacesGroupsDialogTitle"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle disableTypography id="addPlacesGroupsDialogTitle">
        <Typography variant="h4">Add new places group</Typography>
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
            <PlacesMultiInput selectedPlaces={places} onChange={handlePlacesChange} />
          </div>

          <Button
            color="primary"
            variant="contained"
            onClick={handleAddGroup}
            disabled={!groupName.trim()}
            style={{ width: 120 }}
          >
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PlacesGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();
  const [placesGroups, setPlacesGroups] = useState<OpportunityPlacesGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlacesGroupDialogOpen, setIsPlacesGroupDialogOpen] = useState(false);

  useEffect(() => {
    const loadPlacesGroups = async () => {
      try {
        const snapshot = await firebase.firestore().collection(COLLECTION_NAME).get();
        const groups = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as OpportunityPlacesGroup[];
        setPlacesGroups(groups);
      } catch (error) {
        console.error('Error loading places groups:', error);
        enqueueSnackbar('Error loading places groups!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlacesGroups();
  }, [enqueueSnackbar]);

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, groupId: string) => {
      event.stopPropagation();
      setSelectedGroups(prevState =>
        selectedGroups.includes(groupId)
          ? [...prevState.filter(t => t !== groupId)]
          : [...prevState, groupId],
      );
    },
    [selectedGroups],
  );

  const handleSelectDeselectAll = () => {
    if (selectedGroups.length !== placesGroups.length) {
      setSelectedGroups(placesGroups.map(group => group.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleAddNew = useCallback(
    async (newGroup: Omit<OpportunityPlacesGroup, 'id'>) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        const docRef = await firebase.firestore().collection(COLLECTION_NAME).add(newGroup);
        const createdGroup: OpportunityPlacesGroup = {
          id: docRef.id,
          ...newGroup,
        };

        setPlacesGroups(prev => [...prev, createdGroup]);
        enqueueSnackbar('New places group created!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error creating places group:', error);
        enqueueSnackbar('Error creating places group!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    },
    [dispatch, enqueueSnackbar],
  );

  const handleSave = useCallback(
    async (updatedGroup: OpportunityPlacesGroup) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase.firestore().collection(COLLECTION_NAME).doc(updatedGroup.id).update({
          name: updatedGroup.name,
          places: updatedGroup.places,
        });

        setPlacesGroups(prev =>
          prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)),
        );

        enqueueSnackbar('Places group updated successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error updating places group:', error);
        enqueueSnackbar('Error updating places group!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    },
    [dispatch, enqueueSnackbar],
  );

  const handleDelete = useCallback(
    async (groupId: string) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase.firestore().collection(COLLECTION_NAME).doc(groupId).delete();
        setPlacesGroups(prev => prev.filter(group => group.id !== groupId));
        setSelectedGroups(prev => prev.filter(id => id !== groupId));

        enqueueSnackbar('Places group deleted successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error deleting places group:', error);
        enqueueSnackbar('Error deleting places group!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    },
    [dispatch, enqueueSnackbar],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedGroups.length === 0) return;

    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      const deletePromises = selectedGroups.map(groupId =>
        firebase.firestore().collection(COLLECTION_NAME).doc(groupId).delete(),
      );

      await Promise.all(deletePromises);
      setPlacesGroups(prev => prev.filter(group => !selectedGroups.includes(group.id)));
      setSelectedGroups([]);

      enqueueSnackbar(
        `${selectedGroups.length} places group${selectedGroups.length > 1 ? 's' : ''} deleted successfully!`,
        {
          variant: 'success',
          autoHideDuration: 2000,
        },
      );
    } catch (error) {
      console.error('Error deleting places groups:', error);
      enqueueSnackbar('Error deleting places groups!', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  }, [selectedGroups, dispatch, enqueueSnackbar]);

  return (
    <Box flexGrow={1}>
      {loading ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedGroups.length}
            handleAdd={() => setIsPlacesGroupDialogOpen(true)}
            handleDelete={handleDeleteSelected}
            labelWhenSelected={
              selectedGroups.length === 1
                ? `${selectedGroups.length} group selected`
                : `${selectedGroups.length} groups selected`
            }
            addButtonLabel={'Add places group'}
            deleteButtonLabel={selectedGroups.length === 1 ? `Delete group` : `Delete groups`}
            labelWhenNotSelected={'Places of receipt / delivery groups'}
          />
          <TableContainer>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedGroups.length === placesGroups.length}
                      onClick={handleSelectDeselectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Places</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {placesGroups?.map((group, index) => (
                  <PlacesGroupRow
                    key={`places-group-${group.id}-${index}`}
                    placesGroup={group}
                    selected={group.id ? selectedGroups.includes(group.id) : false}
                    onSelectRow={event => group.id && onSelectRow(event, group.id)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <AddGroupDialog
        isOpen={isPlacesGroupDialogOpen}
        handleClose={() => setIsPlacesGroupDialogOpen(false)}
        onAdd={handleAddNew}
      />
    </Box>
  );
};

export default PlacesGroupsContainer;
