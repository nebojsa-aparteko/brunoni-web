import React, { useCallback, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PortGroupRow from './PortGroupRow';
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
import { UserRecordMin } from '../../model/UserRecord';
import CloseIcon from '@material-ui/icons/Close';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import { PortGroup } from '../../model/PortGroup';
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

interface AddPortGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedGroups?: UserRecordMin[];
}

const AddGroupDialog: React.FC<AddPortGroupDialogProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [ports, setPorts] = useState<string[]>([]);

  const handlePortsChange = (selectedPorts: string[]) => {
    setPorts(selectedPorts);
  };

  const handleAddGroup = useCallback(() => {
    const filteredPorts = ports.filter(port => port.trim() !== '');
    console.debug('Adding port group:', { name: groupName, ports: filteredPorts });
    // Reset form
    setGroupName('');
    setPorts([]);
    handleClose();
  }, [groupName, ports, handleClose]);

  const handleDialogClose = () => {
    setGroupName('');
    setPorts([]);
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
            <PortsMultiInput selectedPorts={ports} onChange={handlePortsChange} />
          </div>
        </div>

        <Button
          color="primary"
          variant="contained"
          onClick={handleAddGroup}
          disabled={!groupName.trim() || ports.length === 0}
          style={{ width: 120 }}
        >
          Add Group
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const PortGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isPortGroupDialogOpen, setIsPortGroupDialogOpen] = useState(false);

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
    if (selectedGroups.length !== portGroups.length) {
      setSelectedGroups(portGroups.map(group => group.id || ''));
    } else {
      setSelectedGroups([]);
    }
  };

  const portGroups = [
    {
      id: '1',
      name: 'European Major Ports',
      ports: ['Rotterdam, Netherlands', 'Hamburg, Germany', 'Antwerp, Belgium', 'Bremen, Germany'],
    } as PortGroup,
    {
      id: '2',
      name: 'Asian Hub Ports',
      ports: [
        'Singapore, Singapore',
        'Shanghai, China',
        'Hong Kong, China',
        'Busan, South Korea',
        'Port Klang, Malaysia',
      ],
    } as PortGroup,
    {
      id: '3',
      name: 'US West Coast',
      ports: ['Los Angeles, USA', 'Long Beach, USA', 'Oakland, USA', 'Seattle, USA'],
    } as PortGroup,
    {
      id: '4',
      name: 'Mediterranean Ports',
      ports: ['Valencia, Spain', 'Piraeus, Greece', 'Genoa, Italy', 'Barcelona, Spain'],
    } as PortGroup,
  ];

  return (
    <Box flexGrow={1}>
      {!portGroups ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedGroups.length}
            handleAdd={() => setIsPortGroupDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
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
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedGroups.length === portGroups.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
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
                    portGroup={group}
                    key={`port-group-${group.id}-${index}`}
                    selected={group.id ? selectedGroups.includes(group.id) : false}
                    onSelectRow={event => group.id && onSelectRow(event, group.id)}
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
      />
      {/* <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveGroups}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want to delete the selected port groups?"
      /> */}
    </Box>
  );
};

export default PortGroupsContainer;
