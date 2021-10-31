import React, { useCallback, useState } from 'react';
import { Team } from '../../../model/Teams';
import TeamRow from './TeamRow';
import { Box, Checkbox, createStyles, TableContainer, Typography } from '@material-ui/core';
import { lighten, makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';
import { EnhancedTableToolbar } from '../../EnhancedTableToolbar';
import ConfirmationDialog from '../../ConfirmationDialog';
import { deleteTeams } from './TeamsTeamsContainer';
import { useSnackbar } from 'notistack';
import TeamsRowDrawer from './TeamsRowDrawer';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    table: {
      minWidth: 650,
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
  }),
);

interface Props {
  teams: Team[];
}

const TeamsTable: React.FC<Props> = ({ teams }) => {
  const classes = useStyles();

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleSelectDeselectAll = () => {
    if (selectedTeams.length !== teams.length) {
      setSelectedTeams(teams.map(team => team.id || ''));
    } else {
      setSelectedTeams([]);
    }
  };

  const handleDeleteTeams = useCallback(() => {
    return Promise.resolve(deleteTeams(selectedTeams))
      .then(_ => {
        setIsConfirmationDialogOpen(false);
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
      .finally(() => setSelectedTeams([]));
  }, [selectedTeams, enqueueSnackbar]);

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedTeams(prevState =>
        selectedTeams.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedTeams],
  );

  return (
    <>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Box
          component={Paper}
          display={'flex'}
          alignItems={'center'}
          className={clsx({
            [classes.toolbarHighlight]: selectedTeams.length > 0,
          })}
        >
          <Box ml={'4px'}>
            {teams.length > 0 && (
              <Checkbox
                checked={selectedTeams.length === teams.length}
                onClick={handleSelectDeselectAll}
                onFocus={event => event.stopPropagation()}
                color="primary"
              />
            )}
          </Box>
          <EnhancedTableToolbar
            numSelected={selectedTeams.length}
            handleAdd={() => setOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
            labelWhenSelected={
              selectedTeams.length === 1
                ? `${selectedTeams.length} team selected`
                : `${selectedTeams.length} teams selected`
            }
            addButtonLabel={'Add team'}
            deleteButtonLabel={selectedTeams.length === 1 ? `Delete team` : `Delete teams`}
            labelWhenNotSelected={''}
          />
        </Box>
        {teams.length > 0 ? (
          <Table className={classes.table} aria-label="a dense table">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '25%' }} />
            </colgroup>
            <TableBody>
              {teams?.map((team, index) => (
                <TeamRow
                  team={team}
                  key={`teams-${team.id}-${index}`}
                  selected={team.id ? selectedTeams.includes(team.id) : false}
                  onSelectRow={event => team.id && onSelectRow(event, team.id)}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box display={'flex'} justifyContent={'center'} m={4}>
            <Typography variant="h2">Empty</Typography>
          </Box>
        )}
      </TableContainer>
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm deletion'}
        handleConfirm={handleDeleteTeams}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description={'Are you sure you want to delete the selected teams?'}
      />
      <TeamsRowDrawer open={open} setOpen={setOpen} />
    </>
  );
};

export default TeamsTable;
