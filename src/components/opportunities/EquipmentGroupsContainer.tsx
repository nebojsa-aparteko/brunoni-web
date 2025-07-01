import React, { useCallback, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import EquipmentGroupRow from './EquipmentGroupRow';
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
import { EquipmentGroup } from '../../model/EquipmentGroup';
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

interface AddEquipmentGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedGroups?: UserRecordMin[];
}

const AddGroupDialog: React.FC<AddEquipmentGroupDialogProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);

  const handleEquipmentChange = (selectedEquipment: string[]) => {
    setEquipment(selectedEquipment);
  };

  const handleAddGroup = useCallback(() => {
    const filteredEquipment = equipment.filter(item => item.trim() !== '');
    console.debug('Adding equipment group:', { name: groupName, equipment: filteredEquipment });
    // Reset form
    setGroupName('');
    setEquipment([]);
    handleClose();
  }, [groupName, equipment, handleClose]);

  const handleDialogClose = () => {
    setGroupName('');
    setEquipment([]);
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
            <EquipmentMultiInput selectedEquipment={equipment} onChange={handleEquipmentChange} />
          </div>
        </div>

        <Button
          color="primary"
          variant="contained"
          onClick={handleAddGroup}
          disabled={!groupName.trim() || equipment.length === 0}
          style={{ width: 120 }}
        >
          Add Group
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const EquipmentGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isEquipmentGroupDialogOpen, setIsEquipmentGroupDialogOpen] = useState(false);

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
    if (selectedGroups.length !== equipmentGroups.length) {
      setSelectedGroups(equipmentGroups.map(group => group.id || ''));
    } else {
      setSelectedGroups([]);
    }
  };

  const equipmentGroups = [
    {
      id: '1',
      name: 'Standard Containers',
      equipment: [
        '20ft Standard Container (Container)',
        '40ft Standard Container (Container)',
        '40ft High Cube Container (Container)',
      ],
    } as EquipmentGroup,
    {
      id: '2',
      name: 'Refrigerated Equipment',
      equipment: [
        '20ft Refrigerated Container (Container)',
        '40ft Refrigerated Container (Container)',
        'Refrigerated Trailer (Trailer)',
      ],
    } as EquipmentGroup,
    {
      id: '3',
      name: 'Port Handling Equipment',
      equipment: [
        'Reach Stacker (Handling Equipment)',
        'Container Crane (Handling Equipment)',
        'Mobile Harbor Crane (Handling Equipment)',
      ],
    } as EquipmentGroup,
    {
      id: '4',
      name: 'Specialized Transport',
      equipment: [
        'Flatbed Trailer (Trailer)',
        'Lowboy Trailer (Trailer)',
        'Tank Trailer (Trailer)',
        'Car Carrier Trailer (Trailer)',
      ],
    } as EquipmentGroup,
    {
      id: '5',
      name: 'Rail Transport',
      equipment: [
        'Standard Rail Car (Rail Car)',
        'Refrigerated Rail Car (Rail Car)',
        'Tank Rail Car (Rail Car)',
        'Flatcar (Rail Car)',
      ],
    } as EquipmentGroup,
  ];

  return (
    <Box flexGrow={1}>
      {!equipmentGroups ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedGroups.length}
            handleAdd={() => setIsEquipmentGroupDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
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
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedGroups.length === equipmentGroups.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Equipment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentGroups?.map((group, index) => (
                  <EquipmentGroupRow
                    equipmentGroup={group}
                    key={`equipment-group-${group.id}-${index}`}
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
        isOpen={isEquipmentGroupDialogOpen}
        handleClose={() => setIsEquipmentGroupDialogOpen(false)}
      />
      {/* <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveGroups}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want to delete the selected equipment groups?"
      /> */}
    </Box>
  );
};

export default EquipmentGroupsContainer;
