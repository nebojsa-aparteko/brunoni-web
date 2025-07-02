import React, { useState, useEffect, useCallback, useContext } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import firebase from 'firebase/compat/app';
import { GlobalContext } from '../../store/GlobalStore';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import CommodityGroupRow from './CommodityGroupRow';
import EmptyStatePanel from '../EmptyStatePanel';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  selectedActionsContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
  },
}));

const COLLECTION_NAME = 'opportunity-commodity-groups';

const CommodityGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();
  const [commodityGroups, setCommodityGroups] = useState<OpportunityCommodityGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load commodity groups from database
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
        enqueueSnackbar('Error loading commodity groups from database!', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadCommodityGroups();
  }, [enqueueSnackbar]);

  const handleSelectRow = useCallback((event: React.MouseEvent<HTMLElement>, groupId: string) => {
    event.stopPropagation();
    setSelectedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedGroups.length === commodityGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(commodityGroups.map(group => group.id));
    }
  }, [selectedGroups.length, commodityGroups]);

  const handleAddNew = useCallback(async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      const newGroup: Omit<OpportunityCommodityGroup, 'id'> = {
        name: 'New Commodity Group',
        commodities: [],
      };

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
  }, [dispatch, enqueueSnackbar]);

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

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedGroups.length} commodity group${selectedGroups.length > 1 ? 's' : ''}?`,
    );

    if (!confirmed) return;

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

  if (loading) {
    return (
      <Box className={classes.container}>
        <Paper className={classes.paper}>
          <Typography>Loading commodity groups...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Commodity Groups Configuration
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Configure commodity groups that can be used to categorize opportunities. Each group can
          contain multiple commodities.
        </Typography>

        <Box className={classes.toolbar}>
          <Box className={classes.selectedActionsContainer}>
            {selectedGroups.length > 0 && (
              <>
                <Typography variant="body2">{selectedGroups.length} selected</Typography>
                <Button
                  onClick={handleDeleteSelected}
                  size="small"
                  color="secondary"
                  variant="outlined"
                >
                  Delete Selected
                </Button>
              </>
            )}
          </Box>

          <Button
            onClick={handleAddNew}
            startIcon={<AddIcon />}
            color="primary"
            variant="contained"
          >
            Add New Group
          </Button>
        </Box>

        {commodityGroups.length === 0 ? (
          <EmptyStatePanel
            title="No commodity groups"
            subtitle="Create your first commodity group to get started"
            actionLabel="Add New Group"
            actionIcon={<AddIcon />}
            action={handleAddNew}
          />
        ) : (
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedGroups.length === commodityGroups.length}
                      indeterminate={
                        selectedGroups.length > 0 && selectedGroups.length < commodityGroups.length
                      }
                      onChange={handleSelectAll}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Group Name</TableCell>
                  <TableCell>Commodities</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commodityGroups.map(group => (
                  <CommodityGroupRow
                    key={group.id}
                    commodityGroup={group}
                    selected={selectedGroups.includes(group.id)}
                    onSelectRow={event => handleSelectRow(event, group.id)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CommodityGroupsContainer;
