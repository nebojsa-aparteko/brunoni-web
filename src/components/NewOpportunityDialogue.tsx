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
  const [newSalesRep, setSalesRep] = useState<any>(null);
  const [newStatisticalClient, setStatisticalClient] = useState<any>(null);
  const [newEquipmentGroups, setEquipmentGroups] = useState<any[]>([]);
  const [newPlaceOfReceiptGroup, setPlaceOfReceiptGroup] = useState<any>(null);
  const [newPortOfLoadingGroup, setPortOfLoadingGroup] = useState<any>(null);
  const [newPortOfDischargeGroup, setPortOfDischargeGroup] = useState<any>(null);
  const [newPlaceOfDeliveryGroup, setPlaceOfDeliveryGroup] = useState<any>(null);
  const [newCommodityGroups, setCommodityGroups] = useState<any[]>([]);
  const [newTags, setTags] = useState<any[]>([]);
  const [newNote, setNote] = useState<string>('');
  const [newCapacityTEU, setCapacityTEU] = useState<string>('');
  const [newValidity, setValidity] = useState<string>('');

  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const users = useContext(userRecords);
  const clients = useClients();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setNewOpportunityName('');
      setSalesRep(null);
      setStatisticalClient(null);
      setEquipmentGroups([]);
      setCommodityGroups([]);
      setPlaceOfReceiptGroup(null);
      setPortOfLoadingGroup(null);
      setPortOfDischargeGroup(null);
      setPlaceOfDeliveryGroup(null);
      setTags([]);
      setNote('');
      setCapacityTEU('');
      setValidity('');
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
          onChange={(_, value) => setStatisticalClient(value)}
          renderInput={params => (
            <TextField {...params} label="Statistical Client" margin="dense" variant="outlined" />
          )}
        />
        <OpportunityEquipmentGroupInput
          label="Equipment Groups"
          options={equipmentGroups || []}
          value={newEquipmentGroups}
          onChange={setEquipmentGroups}
          margin="dense"
        />
        <OpportunityCommodityGroupInput
          label="Commodity Groups"
          options={commodityGroups || []}
          value={newCommodityGroups}
          onChange={setCommodityGroups}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Receipt"
          options={placesGroups || []}
          value={newPlaceOfReceiptGroup}
          onChange={setPlaceOfReceiptGroup}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Loading"
          options={portsGroups || []}
          value={newPortOfLoadingGroup}
          onChange={setPortOfLoadingGroup}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Discharge"
          options={portsGroups || []}
          value={newPortOfDischargeGroup}
          onChange={setPortOfDischargeGroup}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Delivery"
          options={placesGroups || []}
          value={newPlaceOfDeliveryGroup}
          onChange={setPlaceOfDeliveryGroup}
          margin="dense"
        />
        <OpportunityTagInput
          label="Tags"
          options={opportunityTags || []}
          value={newTags}
          onChange={(_, value) => setTags(value)}
        />
        <TextField
          margin="dense"
          label="Note"
          type="text"
          fullWidth
          value={newNote}
          onChange={e => setNote(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Capacity TEU"
          type="number"
          fullWidth
          value={newCapacityTEU}
          onChange={e => setCapacityTEU(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Validity"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={newValidity}
          onChange={e => setValidity(e.target.value)}
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
