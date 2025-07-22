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
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import CommodityGroupRow from './CommodityGroupRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import CommoditiesMultiInput from '../inputs/CommoditiesMultiInput';

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

const COLLECTION_NAME = 'opportunity-commodity-groups';

interface AddCommodityGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  onAdd: (group: Omit<OpportunityCommodityGroup, 'id'>) => void;
}

const AddGroupDialog: React.FC<AddCommodityGroupDialogProps> = ({ isOpen, handleClose, onAdd }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [commodities, setCommodities] = useState<string[]>([]);

  const handleCommoditiesChange = (selectedCommodities: string[]) => {
    setCommodities(selectedCommodities);
  };

  const handleAddGroup = useCallback(() => {
    const filteredCommodities = commodities.filter(commodity => commodity.trim() !== '');
    onAdd({
      name: groupName,
      commodities: filteredCommodities,
    });
    setGroupName('');
    setCommodities([]);
    handleClose();
  }, [groupName, commodities, handleClose, onAdd]);

  const handleDialogClose = () => {
    setGroupName('');
    setCommodities([]);
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      aria-labelledby="addCommodityGroupsDialogTitle"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle disableTypography id="addCommodityGroupsDialogTitle">
        <Typography variant="h4">Add new commodity group</Typography>
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
            <CommoditiesMultiInput
              selectedCommodities={commodities}
              onChange={handleCommoditiesChange}
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

const CommodityGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();
  const [commodityGroups, setCommodityGroups] = useState<OpportunityCommodityGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCommodityGroupDialogOpen, setIsCommodityGroupDialogOpen] = useState(false);

  useEffect(() => {
    const loadCommodityGroups = async () => {
      try {
        const snapshot = await firebase.firestore().collection(COLLECTION_NAME).get();
        const groups = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as OpportunityCommodityGroup[];
        setCommodityGroups(groups);
      } catch (error) {
        console.error('Error loading commodity groups:', error);
        enqueueSnackbar('Error loading commodity groups!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCommodityGroups();
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
    if (selectedGroups.length !== commodityGroups.length) {
      setSelectedGroups(commodityGroups.map(group => group.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleAddNew = useCallback(
    async (newGroup: Omit<OpportunityCommodityGroup, 'id'>) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        const docRef = await firebase.firestore().collection(COLLECTION_NAME).add(newGroup);
        const createdGroup: OpportunityCommodityGroup = {
          id: docRef.id,
          ...newGroup,
        };

        setCommodityGroups(prev => [...prev, createdGroup]);
        enqueueSnackbar('New commodity group created!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error creating commodity group:', error);
        enqueueSnackbar('Error creating commodity group!', {
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
    async (updatedGroup: OpportunityCommodityGroup) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase.firestore().collection(COLLECTION_NAME).doc(updatedGroup.id).update({
          name: updatedGroup.name,
          commodities: updatedGroup.commodities,
        });

        setCommodityGroups(prev =>
          prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)),
        );

        enqueueSnackbar('Commodity group updated successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error updating commodity group:', error);
        enqueueSnackbar('Error updating commodity group!', {
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
        setCommodityGroups(prev => prev.filter(group => group.id !== groupId));
        setSelectedGroups(prev => prev.filter(id => id !== groupId));

        enqueueSnackbar('Commodity group deleted successfully!', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error('Error deleting commodity group:', error);
        enqueueSnackbar('Error deleting commodity group!', {
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
      setCommodityGroups(prev => prev.filter(group => !selectedGroups.includes(group.id)));
      setSelectedGroups([]);

      enqueueSnackbar(
        `${selectedGroups.length} commodity group${selectedGroups.length > 1 ? 's' : ''} deleted successfully!`,
        {
          variant: 'success',
          autoHideDuration: 2000,
        },
      );
    } catch (error) {
      console.error('Error deleting commodity groups:', error);
      enqueueSnackbar('Error deleting commodity groups!', {
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
            handleAdd={() => setIsCommodityGroupDialogOpen(true)}
            handleDelete={handleDeleteSelected}
            labelWhenSelected={
              selectedGroups.length === 1
                ? `${selectedGroups.length} group selected`
                : `${selectedGroups.length} groups selected`
            }
            addButtonLabel={'Add commodity group'}
            deleteButtonLabel={selectedGroups.length === 1 ? `Delete group` : `Delete groups`}
            labelWhenNotSelected={'Commodity groups'}
          />
          <TableContainer>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedGroups.length === commodityGroups.length}
                      onClick={handleSelectDeselectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Commodities</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commodityGroups?.map((group, index) => (
                  <CommodityGroupRow
                    key={`commodity-group-${group.id}-${index}`}
                    commodityGroup={group}
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
        isOpen={isCommodityGroupDialogOpen}
        handleClose={() => setIsCommodityGroupDialogOpen(false)}
        onAdd={handleAddNew}
      />
    </Box>
  );
};

export default CommodityGroupsContainer;
