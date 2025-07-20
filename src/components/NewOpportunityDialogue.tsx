import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import OpportunityTagInput from './inputs/OpportunityTagsInput';
import OpportunityEquipmentGroupInput from './inputs/OpportunityEquipmentGroupInput';
import OpportunityCommodityGroupInput from './inputs/OpportunityCommodityGroupInput';
import OpportunityPlacesGroupInput from './inputs/OpportunityPlacesGroupInput';
import OpportunityPortsGroupInput from './inputs/OpportunityPortsGroupInput';
import useOpportunityPortsGroups from '../hooks/useOpportunityPortsGroups';
import useOpportunityPlacesGroups from '../hooks/useOpportunityPlacesGroups';
import useOpportunityTags from '../hooks/useOpportunityTags';
import useOpportunityCommodityGroups from '../hooks/useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from '../hooks/useOpportunityEquipmentGroups';
import useClients from '../hooks/useClients';
import userRecords from '../contexts/UserRecordsContext';
import UserInput from './inputs/UserInput';
interface NewOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

const NewOpportunityDialog: React.FC<NewOpportunityDialogProps> = ({ open, onClose, onAdd }) => {
  const [newOpportunityName, setNewOpportunityName] = useState<string>('');
  const [newSalesRep, setNewSalesRep] = useState<any>(null);
  const [newStatisticalClient, setNewStatisticalClient] = useState<any>(null);
  const [newEquipmentGroups, setNewEquipmentGroups] = useState<any[]>([]);
  const [newPlaceOfReceiptGroup, setNewPlaceOfReceiptGroup] = useState<any>(null);
  const [newPortOfLoadingGroup, setNewPortOfLoadingGroup] = useState<any>(null);
  const [newPortOfDischargeGroup, setNewPortOfDischargeGroup] = useState<any>(null);
  const [newPlaceOfDeliveryGroup, setNewPlaceOfDeliveryGroup] = useState<any>(null);
  const [newCommodityGroups, setNewCommodityGroups] = useState<any[]>([]);
  const [newTags, setNewTags] = useState<any[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [newCapacityTEU, setNewCapacityTEU] = useState<string>('');
  const [newValidity, setNewValidity] = useState<string>('');

  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const users = useContext(userRecords);
  const clients = useClients();

  useEffect(() => {
    if (!open) {
      setNewOpportunityName('');
      setNewSalesRep(null);
      setNewStatisticalClient(null);
      setNewEquipmentGroups([]);
      setNewCommodityGroups([]);
      setNewPlaceOfReceiptGroup(null);
      setNewPortOfLoadingGroup(null);
      setNewPortOfDischargeGroup(null);
      setNewPlaceOfDeliveryGroup(null);
      setNewTags([]);
      setNewNote('');
      setNewCapacityTEU('');
      setNewValidity('');
    }
  }, [open]);

  const handleAdd = () => {
    onAdd({
      name: newOpportunityName,
      salesRep: newSalesRep,
      statisticalClient: newStatisticalClient,
      equipmentGroups: newEquipmentGroups,
      commodityGroups: newCommodityGroups,
      placeOfReceiptGroup: newPlaceOfReceiptGroup,
      portOfLoadingGroup: newPortOfLoadingGroup,
      portOfDischargeGroup: newPortOfDischargeGroup,
      placeOfDeliveryGroup: newPlaceOfDeliveryGroup,
      tags: newTags,
      note: newNote,
      capacityTEU: newCapacityTEU,
      validity: newValidity,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Opportunity</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Opportunity Name"
          type="text"
          fullWidth
          value={newOpportunityName}
          onChange={e => setNewOpportunityName(e.target.value)}
        />
        <UserInput
          label="Choose User"
          users={users || []}
          onChange={(_, user) => setNewSalesRep(user)}
          value={newSalesRep}
        />
        <Autocomplete
          options={clients || []}
          getOptionLabel={option => option?.name || ''}
          value={newStatisticalClient}
          onChange={(_, value) => setNewStatisticalClient(value)}
          renderInput={params => (
            <TextField {...params} label="Statistical Client" margin="dense" variant="outlined" />
          )}
        />
        <OpportunityEquipmentGroupInput
          label="Equipment Groups"
          options={equipmentGroups || []}
          value={newEquipmentGroups}
          onChange={groups => setNewEquipmentGroups(groups || [])}
          margin="dense"
        />
        <OpportunityCommodityGroupInput
          label="Commodity Groups"
          options={commodityGroups || []}
          value={newCommodityGroups}
          onChange={groups => setNewCommodityGroups(groups || [])}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Receipt"
          options={placesGroups || []}
          value={newPlaceOfReceiptGroup}
          onChange={setNewPlaceOfReceiptGroup}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Loading"
          options={portsGroups || []}
          value={newPortOfLoadingGroup}
          onChange={setNewPortOfLoadingGroup}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Discharge"
          options={portsGroups || []}
          value={newPortOfDischargeGroup}
          onChange={setNewPortOfDischargeGroup}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Delivery"
          options={placesGroups || []}
          value={newPlaceOfDeliveryGroup}
          onChange={setNewPlaceOfDeliveryGroup}
          margin="dense"
        />
        <OpportunityTagInput
          label="Tags"
          options={opportunityTags || []}
          value={newTags}
          onChange={(_, value) => setNewTags(Array.isArray(value) ? value : value ? [value] : [])}
        />
        <TextField
          margin="dense"
          label="Note"
          type="text"
          fullWidth
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Capacity TEU"
          type="number"
          fullWidth
          value={newCapacityTEU}
          onChange={e => setNewCapacityTEU(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Validity"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={newValidity}
          onChange={e => setNewValidity(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          color="primary"
          variant="contained"
          disabled={!newOpportunityName || !newSalesRep || !newStatisticalClient}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewOpportunityDialog;
