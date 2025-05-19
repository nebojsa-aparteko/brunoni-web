import React, { useCallback, useContext, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TeamTeamRow from './TeamTeamRow';
import TableContainer from '@material-ui/core/TableContainer';
import { makeStyles } from '@material-ui/core/styles';
import { TeamType } from '../../model/Teams';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import { GlobalContext } from '../../store/GlobalStore';
import { useSnackbar } from 'notistack';
import { Checkbox, Typography } from '@material-ui/core';
import { deleteTeams } from './TeamsTeamsContainer';
import ConfirmationDialog from '../ConfirmationDialog';
import useTeams from '../../hooks/useTeams';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import { tryGetErrorMessage } from '../../utilities/errorHelper';

const useStyles = makeStyles({
  tableContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  table: {
    minWidth: 650,
    maxWidth: '100%',
  },
});

const AccountingTeamsTable = ({ onAdd }: Props) => {
  const classes = useStyles();

  const teams = useTeams(TeamType.ACCOUNTING);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  const handleSelectDeselectAll = () => {
    if (selectedTeams.length !== teams.length) {
      setSelectedTeams(teams.map(team => team.id || ''));
    } else {
      setSelectedTeams([]);
    }
  };

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedTeams(prevState =>
        selectedTeams.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedTeams],
  );

  const handleDeleteTeams = useCallback(() => {
    dispatch({ type: 'START_GLOBAL_LOADING' });

    return Promise.resolve(deleteTeams(selectedTeams))
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
        enqueueSnackbar(<Typography color="inherit"> {tryGetErrorMessage(error)}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      })
      .finally(() => setSelectedTeams([]));
  }, [selectedTeams, enqueueSnackbar, dispatch]);

  return (
    <>
      {!teams ? (
        <ChartsCircularProgress />
      ) : (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <EnhancedTableToolbar
            numSelected={selectedTeams.length}
            handleAdd={() => onAdd(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
            labelWhenSelected={
              selectedTeams.length === 1
                ? `${selectedTeams.length} admin selected`
                : `${selectedTeams.length} admins selected`
            }
            addButtonLabel={'Add admin'}
            deleteButtonLabel={selectedTeams.length === 1 ? `Delete admin` : `Delete admins`}
            labelWhenNotSelected={''}
          />
          <Table className={classes.table} aria-label="a dense table">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell align="left" style={{ paddingLeft: 4 }}>
                  <Checkbox
                    checked={selectedTeams.length === teams.length}
                    onClick={handleSelectDeselectAll}
                    onFocus={event => event.stopPropagation()}
                    color="primary"
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell align="center">Carriers</TableCell>
                <TableCell align="center">Categories</TableCell>
                <TableCell align="center">Task types</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map(team => (
                <TeamTeamRow
                  team={team}
                  key={`teams-${team.id}`}
                  selected={team.id ? selectedTeams.includes(team.id) : false}
                  onSelectRow={event => team.id && onSelectRow(event, team.id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm deletion'}
        handleConfirm={handleDeleteTeams}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description={'Are you sure you want to delete the selected teams?'}
      />
    </>
  );
};

interface Props {
  onAdd: (isAccounting: boolean) => void;
}

export default AccountingTeamsTable;
