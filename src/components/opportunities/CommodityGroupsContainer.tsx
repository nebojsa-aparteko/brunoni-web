import React, { useCallback, useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CommodityGroupRow from './CommodityGroupRow';
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
import { CommodityGroup } from '../../model/CommodityGroup';
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

interface AddCommodityGroupDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedGroups?: UserRecordMin[];
}

const AddGroupDialog: React.FC<AddCommodityGroupDialogProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const [groupName, setGroupName] = useState('');
  const [commodities, setCommodities] = useState<string[]>([]);

  const handleCommoditiesChange = (selectedCommodities: string[]) => {
    setCommodities(selectedCommodities);
  };

  const handleAddGroup = useCallback(() => {
    const filteredCommodities = commodities.filter(commodity => commodity.trim() !== '');
    console.debug('Adding commodity group:', { name: groupName, commodities: filteredCommodities });
    // Reset form
    setGroupName('');
    setCommodities([]);
    handleClose();
  }, [groupName, commodities, handleClose]);

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
              data={[]}
              selectedCommodities={commodities}
              onChange={handleCommoditiesChange}
            />
          </div>
        </div>

        <Button
          color="primary"
          variant="contained"
          onClick={handleAddGroup}
          disabled={!groupName.trim() || commodities.length === 0}
          style={{ width: 120 }}
        >
          Add Group
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const CommodityGroupsContainer: React.FC = () => {
  const classes = useStyles();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isCommodityGroupDialogOpen, setIsCommodityGroupDialogOpen] = useState(false);

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
    if (selectedGroups.length !== commodityGroups.length) {
      setSelectedGroups(commodityGroups.map(group => group.id || ''));
    } else {
      setSelectedGroups([]);
    }
  };

  const commodityGroups = [
    {
      id: '1',
      name: 'Agricultural Products',
      commodities: ['Wheat', 'Corn', 'Rice', 'Soybeans'],
    } as CommodityGroup,
    {
      id: '2',
      name: 'Energy Products',
      commodities: ['Crude Oil', 'Natural Gas', 'Coal', 'Gasoline', 'Diesel'],
    } as CommodityGroup,
    {
      id: '3',
      name: 'Metals',
      commodities: ['Steel', 'Aluminum', 'Copper', 'Iron Ore'],
    } as CommodityGroup,
  ];

  return (
    <Box flexGrow={1}>
      {!commodityGroups ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedGroups.length}
            handleAdd={() => setIsCommodityGroupDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
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
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={selectedGroups.length === commodityGroups.length}
                      onClick={handleSelectDeselectAll}
                      onFocus={event => event.stopPropagation()}
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
                    commodityGroup={group}
                    key={`commodity-group-${group.id}-${index}`}
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
        isOpen={isCommodityGroupDialogOpen}
        handleClose={() => setIsCommodityGroupDialogOpen(false)}
      />
      {/* <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveGroups}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want to delete the selected commodity groups?"
      /> */}
    </Box>
  );
};

export default CommodityGroupsContainer;
