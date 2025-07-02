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
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import PortGroupRow from './PortGroupRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import PortsMultiInput from '../inputs/PortsMultiInput';

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

const COLLECTION_NAME = 'opportunity-ports-groups';

interface AddPortGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onAdd: (group: Omit<OpportunityPortsGroup, 'id'>) => void;
}

const AddGroupDialog: React.FC<AddPortGroupDialogProps> = ({ isOpen, handleClose, onAdd }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [portIds, setPortIds] = useState<string[]>([]);

  const handlePortsChange = (selectedPortIds: string[]) => {
    setPortIds(selectedPortIds);
  };

  const handleAddGroup = useCallback(() => {
    onAdd({
      name: groupName,
      portIds: portIds,
    });
    setGroupName('');
    setPortIds([]);
    handleClose();
  }, [groupName, portIds, handleClose, onAdd]);

  const handleDialogClose = () => {
    setGroupName('');
    setPortIds([]);
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      aria-labelledby="addPortGroupsDialogTitle"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle disableTypography id="addPortGroupsDialogTitle">
        <Typography variant="h4">Add new port group</Typography>
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
            <PortsMultiInput selectedPortIds={portIds} onChange={handlePortsChange} />
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

const PortGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();
  const [portGroups, setPortGroups] = useState<OpportunityPortsGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPortGroupDialogOpen, setIsPortGroupDialogOpen] = useState(false);

  // Load port groups from database
  useEffect(() => {
    const loadPortGroups = async () => {
      try {
        const snapshot = await firebase.firestore().collection(COLLECTION_NAME).get();
        const groups = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as OpportunityPortsGroup[];
        setPortGroups(groups);
      } catch (error) {
        console.error('Error loading port groups:', error);
        enqueueSnackbar('Error loading port groups!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPortGroups();
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
    if (selectedGroups.length !== portGroups.length) {
      setSelectedGroups(portGroups.map(group => group.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleAddNew = useCallback(
    async (newGroup: Omit<OpportunityPortsGroup, 'id'>) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        const docRef = await firebase.firestore().collection(COLLECTION_NAME).add(newGroup);
        const createdGroup: OpportunityPortsGroup = {
          id: docRef.id,
          ...newGroup,
        };

        setPortGroups(prev => [...prev, createdGroup]);
        enqueueSnackbar('New port group created!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error creating port group:', error);
        enqueueSnackbar('Error creating port group!', {
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
    async (updatedGroup: OpportunityPortsGroup) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase.firestore().collection(COLLECTION_NAME).doc(updatedGroup.id).update({
          name: updatedGroup.name,
          portIds: updatedGroup.portIds,
        });

        setPortGroups(prev =>
          prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)),
        );

        enqueueSnackbar('Port group updated successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error updating port group:', error);
        enqueueSnackbar('Error updating port group!', {
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
        setPortGroups(prev => prev.filter(group => group.id !== groupId));
        setSelectedGroups(prev => prev.filter(id => id !== groupId));

        enqueueSnackbar('Port group deleted successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error deleting port group:', error);
        enqueueSnackbar('Error deleting port group!', {
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
      setPortGroups(prev => prev.filter(group => !selectedGroups.includes(group.id)));
      setSelectedGroups([]);

      enqueueSnackbar(
        `${selectedGroups.length} port group${selectedGroups.length > 1 ? 's' : ''} deleted successfully!`,
        {
          variant: 'success',
          autoHideDuration: 2000,
        },
      );
    } catch (error) {
      console.error('Error deleting port groups:', error);
      enqueueSnackbar('Error deleting port groups!', {
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
            handleAdd={() => setIsPortGroupDialogOpen(true)}
            handleDelete={handleDeleteSelected}
            labelWhenSelected={
              selectedGroups.length === 1
                ? `${selectedGroups.length} group selected`
                : `${selectedGroups.length} groups selected`
            }
            addButtonLabel={'Add port group'}
            deleteButtonLabel={selectedGroups.length === 1 ? `Delete group` : `Delete groups`}
            labelWhenNotSelected={'Port groups'}
          />
          <TableContainer>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedGroups.length === portGroups.length}
                      onClick={handleSelectDeselectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Ports</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portGroups?.map((group, index) => (
                  <PortGroupRow
                    key={`port-group-${group.id}-${index}`}
                    portGroup={group}
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
        isOpen={isPortGroupDialogOpen}
        handleClose={() => setIsPortGroupDialogOpen(false)}
        onAdd={handleAddNew}
      />
    </Box>
  );
};

export default PortGroupsContainer;
