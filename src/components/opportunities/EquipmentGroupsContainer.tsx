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
import firebase from '../../firebase';
import { GlobalContext } from '../../store/GlobalStore';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import EquipmentGroupRow from './EquipmentGroupRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import EquipmentMultiInput from '../inputs/EquipmentMultiInput';

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

const COLLECTION_NAME = 'opportunity-equipments-groups';

interface AddEquipmentGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onAdd: (group: Omit<OpportunityEquipmentGroup, 'id'>) => void;
}

const AddGroupDialog: React.FC<AddEquipmentGroupDialogProps> = ({ isOpen, handleClose, onAdd }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [equipmentTypeId, setEquipmentTypeId] = useState<string[]>([]);

  const handleEquipmentChange = (selectedEquipmentIds: string[]) => {
    setEquipmentTypeId(selectedEquipmentIds);
  };

  const handleAddGroup = useCallback(() => {
    onAdd({
      name: groupName,
      equipmentTypeId: equipmentTypeId,
    });
    // Reset form
    setGroupName('');
    setEquipmentTypeId([]);
    handleClose();
  }, [groupName, equipmentTypeId, handleClose, onAdd]);

  const handleDialogClose = () => {
    setGroupName('');
    setEquipmentTypeId([]);
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      aria-labelledby="addEquipmentGroupsDialogTitle"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle disableTypography id="addEquipmentGroupsDialogTitle">
        <Typography variant="h4">Add new equipment group</Typography>
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
            <EquipmentMultiInput
              selectedEquipmentIds={equipmentTypeId}
              onChange={handleEquipmentChange}
            />
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

const EquipmentGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();
  const [equipmentGroups, setEquipmentGroups] = useState<OpportunityEquipmentGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEquipmentGroupDialogOpen, setIsEquipmentGroupDialogOpen] = useState(false);

  // Load equipment groups from database
  useEffect(() => {
    const loadEquipmentGroups = async () => {
      try {
        const snapshot = await firebase.firestore().collection(COLLECTION_NAME).get();
        const groups = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as OpportunityEquipmentGroup[];
        setEquipmentGroups(groups);
      } catch (error) {
        console.error('Error loading equipment groups:', error);
        enqueueSnackbar('Error loading equipment groups!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadEquipmentGroups();
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
    if (selectedGroups.length !== equipmentGroups.length) {
      setSelectedGroups(equipmentGroups.map(group => group.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleAddNew = useCallback(
    async (newGroup: Omit<OpportunityEquipmentGroup, 'id'>) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        const docRef = await firebase.firestore().collection(COLLECTION_NAME).add(newGroup);
        const createdGroup: OpportunityEquipmentGroup = {
          id: docRef.id,
          ...newGroup,
        };

        setEquipmentGroups(prev => [...prev, createdGroup]);
        enqueueSnackbar('New equipment group created!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error creating equipment group:', error);
        enqueueSnackbar('Error creating equipment group!', {
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
    async (updatedGroup: OpportunityEquipmentGroup) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase.firestore().collection(COLLECTION_NAME).doc(updatedGroup.id).update({
          name: updatedGroup.name,
          equipmentTypeId: updatedGroup.equipmentTypeId,
        });

        setEquipmentGroups(prev =>
          prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)),
        );

        enqueueSnackbar('Equipment group updated successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error updating equipment group:', error);
        enqueueSnackbar('Error updating equipment group!', {
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
        setEquipmentGroups(prev => prev.filter(group => group.id !== groupId));
        setSelectedGroups(prev => prev.filter(id => id !== groupId));

        enqueueSnackbar('Equipment group deleted successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error deleting equipment group:', error);
        enqueueSnackbar('Error deleting equipment group!', {
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
      setEquipmentGroups(prev => prev.filter(group => !selectedGroups.includes(group.id)));
      setSelectedGroups([]);

      enqueueSnackbar(
        `${selectedGroups.length} equipment group${selectedGroups.length > 1 ? 's' : ''} deleted successfully!`,
        {
          variant: 'success',
          autoHideDuration: 2000,
        },
      );
    } catch (error) {
      console.error('Error deleting equipment groups:', error);
      enqueueSnackbar('Error deleting equipment groups!', {
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
            handleAdd={() => setIsEquipmentGroupDialogOpen(true)}
            handleDelete={handleDeleteSelected}
            labelWhenSelected={
              selectedGroups.length === 1
                ? `${selectedGroups.length} group selected`
                : `${selectedGroups.length} groups selected`
            }
            addButtonLabel={'Add equipment group'}
            deleteButtonLabel={selectedGroups.length === 1 ? `Delete group` : `Delete groups`}
            labelWhenNotSelected={'Equipment groups'}
          />
          <TableContainer>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedGroups.length === equipmentGroups.length}
                      onClick={handleSelectDeselectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentGroups?.map((group, index) => (
                  <EquipmentGroupRow
                    key={`equipment-group-${group.id}-${index}`}
                    equipmentGroup={group}
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
        isOpen={isEquipmentGroupDialogOpen}
        handleClose={() => setIsEquipmentGroupDialogOpen(false)}
        onAdd={handleAddNew}
      />
    </Box>
  );
};

export default EquipmentGroupsContainer;
