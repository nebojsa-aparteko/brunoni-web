import React, { useCallback, useContext, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import useAdminUsers from '../../hooks/useAdminUsers';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@material-ui/core';
import UserInput from '../inputs/UserInput';
import UserRecord from '../../model/UserRecord';
import firebase from '../../firebase';
import CloseIcon from '@material-ui/icons/Close';
import ConfirmationDialog from '../ConfirmationDialog';
import { GlobalContext } from '../../store/GlobalStore';
import { useSnackbar } from 'notistack';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import useReassignmentRules from '../../hooks/useReassignmentRules';
import { ReassignmentRule } from '../../model/ReassignmentRule';
import ReassignUserRow from './ReassignUsersRow';
import CarrierInput from '../inputs/CarrierInput';
import Carrier from '../../model/Carrier';
import Carriers from '../../contexts/Carriers';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      minWidth: 650,
    },
    dialogContent: {
      paddingBottom: theme.spacing(3),
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 4,
    },
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
  }),
);

interface AddRuleDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedRule?: ReassignmentRule[];
  adminUsers: UserRecord[];
}

const AddRuleDialog: React.FC<AddRuleDialogProps> = ({ isOpen, handleClose, adminUsers }) => {
  const classes = useStyles();
  const availableCarriers = useContext(Carriers);

  const [selectedUser, setSelectedUser] = useState<UserRecord | undefined>(undefined);
  const [reassignToUser, setReassignToUser] = useState<UserRecord | undefined>(undefined);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const [, dispatch] = useContext(GlobalContext);

  const handleAddReassignmentRule = useCallback(() => {
    if (selectedUser && reassignToUser && selectedCarrier) {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      firebase
        .firestore()
        .collection('reassignment-rules')
        .doc()
        .set(
          {
            agentId: selectedUser.alphacomId,
            carrier: selectedCarrier.name,
            reassignedClientId: reassignToUser.alphacomId,
          },
          { merge: true },
        )
        .then(_ => {
          console.log('Saved');
          setSelectedUser(undefined);
          handleClose();
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
        })
        .finally(() => {
          setSelectedUser(undefined);
          setSelectedCarrier(undefined);
          setReassignToUser(undefined);
        });
    }
  }, [selectedUser, selectedCarrier, reassignToUser, handleClose, dispatch]);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="ReassignmentRulesDialogTitle" maxWidth="md">
      <DialogTitle disableTypography id="ReassignmentRulesDialogTitle">
        <Typography variant="h4">Add new reassignment rule</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box minWidth={250} maxWidth={400} margin={1} paddingRight={1}>
          <UserInput
            label="Select user"
            users={
              (reassignToUser
                ? adminUsers.filter(user => user.alphacomId !== reassignToUser.alphacomId)
                : adminUsers) || []
            }
            onChange={(_, user) => setSelectedUser(user || undefined)}
            value={selectedUser}
          />
        </Box>
        <Box minWidth={250} maxWidth={400} margin={1} paddingRight={1}>
          <CarrierInput
            label="Carrier"
            onChange={carrier => setSelectedCarrier(carrier || undefined)}
            carriers={availableCarriers}
            value={selectedCarrier}
          />
        </Box>
        <Box minWidth={250} maxWidth={400} margin={1}>
          <UserInput
            label="Reassign to:"
            users={
              (selectedUser ? adminUsers.filter(user => user.alphacomId !== selectedUser.alphacomId) : adminUsers) || []
            }
            onChange={(_, user) => setReassignToUser(user || undefined)}
            value={reassignToUser}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleAddReassignmentRule} style={{ minWidth: 80 }}>
          Add rule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const removeReassignmentRules = async (ruleIds: string[]): Promise<any> => {
  const removeReassignmentRule = async (ruleId: string): Promise<any> => {
    return firebase
      .firestore()
      .collection('reassignment-rules')
      .doc(ruleId)
      .delete();
  };

  const requests = ruleIds.map((ruleId: string) => {
    return removeReassignmentRule(ruleId).then(rule => {
      return rule;
    });
  });

  return Promise.all(requests);
};

const ReassignUsersContainer: React.FC = () => {
  const classes = useStyles();
  const adminUsers = useAdminUsers();
  const reassignmentRules = useReassignmentRules();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedRules(prevState =>
        selectedRules.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedRules],
  );

  const handleSelectDeselectAll = () => {
    if (selectedRules.length !== reassignmentRules.length) {
      setSelectedRules(reassignmentRules.map(rule => rule.id || ''));
    } else {
      setSelectedRules([]);
    }
  };
  const handleRemoveReassignmentRule = useCallback(() => {
    dispatch({ type: 'START_GLOBAL_LOADING' });

    return Promise.resolve(removeReassignmentRules(selectedRules))
      .then(_ => {
        setIsConfirmationDialogOpen(false);
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 1500,
        });
      })
      .catch(error => {
        console.error('error storing activity', error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      })
      .finally(() => setSelectedRules([]));
  }, [selectedRules, enqueueSnackbar, dispatch]);

  return (
    <Box flexGrow={1}>
      {!adminUsers || !reassignmentRules ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedRules.length}
            handleAdd={() => setIsAdminDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
            labelWhenSelected={
              selectedRules.length === 1
                ? `${selectedRules.length} rule selected`
                : `${selectedRules.length} rules selected`
            }
            addButtonLabel={'Add rule'}
            deleteButtonLabel={selectedRules.length === 1 ? `Delete rule` : `Delete rules`}
            labelWhenNotSelected={'Reassignment rules'}
          />
          <TableContainer>
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedRules.length === reassignmentRules.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Carrier</TableCell>
                  <TableCell align="center">Reassign To</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reassignmentRules?.map((rule, index) => (
                  <ReassignUserRow
                    rule={rule}
                    key={`reassignment-rule-${rule.id}-${index}`}
                    selected={rule.id ? selectedRules.includes(rule.id) : false}
                    onSelectRow={event => rule.id && onSelectRow(event, rule.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <AddRuleDialog
        isOpen={isAdminDialogOpen}
        handleClose={() => setIsAdminDialogOpen(false)}
        adminUsers={adminUsers}
      />
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveReassignmentRule}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want remove this rule?"
      />
    </Box>
  );
};

export default ReassignUsersContainer;
