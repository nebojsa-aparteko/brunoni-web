import React, { Fragment, useCallback, useContext, useState } from 'react';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamUserRow from './TeamUserRow';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import useClientUsers from '../../hooks/useClientUsers';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import UserInput from '../inputs/UserInput';
import { ADMIN_ROLES, UserRecordMin } from '../../model/UserRecord';
import firebase from '../../firebase';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import clsx from 'clsx';
import ConfirmationDialog from '../ConfirmationDialog';
import { GlobalContext } from '../../store/GlobalStore';
import { useSnackbar } from 'notistack';

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
    toolbarRoot: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    toolbarHighlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.error.main,
            backgroundColor: lighten(theme.palette.error.light, 0.85),
          }
        : {
            color: theme.palette.error.dark,
            backgroundColor: theme.palette.error.dark,
          },
    toolbarTitle: {
      flex: '1 1 100%',
    },
  }),
);

interface AddAdminsDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedUsers?: UserRecordMin[];
}

const AddAdminDialog: React.FC<AddAdminsDialogProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const clientUsers = useClientUsers(process.env.REACT_APP_BRAND === 'brunoni' ? '001772' : '005905');
  const nonAdminUsers = clientUsers?.filter(user => !user.isAdmin && !user.role) || [];
  const [selectedUser, setSelectedUser] = useState<UserRecordMin | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState(ADMIN_ROLES[0]);
  const [, dispatch] = useContext(GlobalContext);

  const handleAddAdmin = useCallback(() => {
    if (selectedUser) {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      firebase
        .firestore()
        .collection('users')
        .doc(selectedUser.id)
        .set({ isAdmin: true, role: selectedRole }, { merge: true })
        .then(_ => {
          console.log('Saved');
          setSelectedUser(undefined);
          handleClose();
          dispatch({ type: 'STOP_GLOBAL_LOADING' });
        });
    }
  }, [selectedUser, selectedRole, handleClose]);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="addAdminsDialogTitle" maxWidth="md">
      <DialogTitle disableTypography id="addAdminsDialogTitle">
        <Typography variant="h4">Assign admin role</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box minWidth={250} maxWidth={400} margin={1} paddingRight={1}>
          <UserInput
            label="Assign to"
            users={nonAdminUsers || []}
            onChange={(_, user) => setSelectedUser(user || undefined)}
            value={selectedUser}
          />
        </Box>
        <FormControl variant="outlined" style={{ minWidth: 250, maxWidth: 400, margin: 8, paddingRight: 8 }}>
          <InputLabel id="roleInputLabel">Role</InputLabel>
          <Select
            labelId="roleInputLabel"
            label="Role"
            value={selectedRole}
            onChange={event => setSelectedRole(event.target.value ? (event.target.value as string) : ADMIN_ROLES[0])}
          >
            {ADMIN_ROLES.map(role => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          color="primary"
          variant="contained"
          onClick={handleAddAdmin}
          style={{ minWidth: 120, margin: 8, height: 54 }}
        >
          Add admin user
        </Button>
      </DialogContent>
    </Dialog>
  );
};

interface EnhancedTableToolbarProps {
  numSelected: number;
  addAdmin: () => void;
  deleteSelectedUsers: () => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const classes = useStyles();
  const { numSelected, addAdmin, deleteSelectedUsers } = props;

  return (
    <Toolbar
      className={clsx(classes.toolbarRoot, {
        [classes.toolbarHighlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.toolbarTitle} color="error" variant="subtitle1" component="div">
          {numSelected === 1 ? `${numSelected} admin selected` : `${numSelected} admins selected`}
        </Typography>
      ) : (
        <Typography className={classes.toolbarTitle} variant="h5" id="tableTitle" component="div">
          Admins
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete admins">
          <IconButton aria-label="delete" onClick={deleteSelectedUsers}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Add new admin">
          <IconButton aria-label="filter list" onClick={addAdmin}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const removeAdminRights = async (userIds: string[]): Promise<any> => {
  const removeAdmin = async (userId: string): Promise<any> => {
    return firebase
      .firestore()
      .collection('users')
      .doc(userId)
      .set({ isAdmin: false, role: null }, { merge: true });
  };

  const requests = userIds.map((userId: string) => {
    return removeAdmin(userId).then(user => {
      return user;
    });
  });

  return Promise.all(requests);
};

const TeamsUsersContainer: React.FC = () => {
  const classes = useStyles();
  const adminUsers = useAdminUsers();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedUsers(prevState =>
        selectedUsers.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedUsers],
  );

  const handleSelectDeselectAll = () => {
    if (selectedUsers.length !== adminUsers.length) {
      setSelectedUsers(adminUsers.map(user => user.id || ''));
    } else {
      setSelectedUsers([]);
    }
  };
  const handleRemoveAdminRights = useCallback(() => {
    dispatch({ type: 'START_GLOBAL_LOADING' });

    return Promise.resolve(removeAdminRights(selectedUsers))
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
      .finally(() => setSelectedUsers([]));
  }, [selectedUsers, enqueueSnackbar, dispatch]);

  return (
    <Fragment>
      {!adminUsers ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedUsers.length}
            addAdmin={() => setIsAdminDialogOpen(true)}
            deleteSelectedUsers={() => setIsConfirmationDialogOpen(true)}
          />
          <TableContainer>
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedUsers.length === adminUsers.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Email</TableCell>
                  <TableCell align="right">Role</TableCell>
                  <TableCell align="right">Last Login</TableCell>
                  <TableCell align="center">Vacation</TableCell>
                  <TableCell align="center">Redirect To</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminUsers?.map((user, index) => (
                  <TeamUserRow
                    user={user}
                    key={`adminuser-${user.alphacomId}-${index}`}
                    selected={user.id ? selectedUsers.includes(user.id) : false}
                    onSelectRow={event => user.id && onSelectRow(event, user.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <AddAdminDialog isOpen={isAdminDialogOpen} handleClose={() => setIsAdminDialogOpen(false)} />
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveAdminRights}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want remove admin rights from selected users?"
      />
    </Fragment>
  );
};

export default TeamsUsersContainer;
