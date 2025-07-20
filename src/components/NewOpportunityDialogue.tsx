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
import firebase from '../firebase';
import Client from '../model/Client';
import UserRecord from '../model/UserRecord';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
interface NewOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

const NewOpportunityDialog: React.FC<NewOpportunityDialogProps> = ({ open, onClose, onAdd }) => {
  const [newSalesRep, setNewSalesRep] = useState<UserRecord | null>(null);
  const [newBookingParty, setNewBookingParty] = useState<Client | null>(null);
  const [newStatisticalClient, setNewStatisticalClient] = useState<Client | null>(null);
  const [newEquipmentGroups, setNewEquipmentGroups] = useState<OpportunityEquipmentGroup | null>(
    null,
  );
  const [newPlaceOfReceiptGroup, setNewPlaceOfReceiptGroup] =
    useState<OpportunityPlacesGroup | null>(null);
  const [newPortOfLoadingGroup, setNewPortOfLoadingGroup] = useState<OpportunityPortsGroup | null>(
    null,
  );
  const [newPortOfDischargeGroup, setNewPortOfDischargeGroup] =
    useState<OpportunityPortsGroup | null>(null);
  const [newPlaceOfDeliveryGroup, setNewPlaceOfDeliveryGroup] =
    useState<OpportunityPlacesGroup | null>(null);
  const [newCommodityGroups, setNewCommodityGroups] = useState<OpportunityCommodityGroup | null>(
    null,
  );
  const [newTags, setNewTags] = useState<any[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [newCapacityTEU, setNewCapacityTEU] = useState<number>(0);
  const [newValidity, setNewValidity] = useState<Date>(new Date());

  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const users = useContext(userRecords);
  const clients = useClients();

  useEffect(() => {
    if (!open) {
      setNewSalesRep(null);
      setNewStatisticalClient(null);
      setNewEquipmentGroups(null);
      setNewCommodityGroups(null);
      setNewPlaceOfReceiptGroup(null);
      setNewPortOfLoadingGroup(null);
      setNewPortOfDischargeGroup(null);
      setNewPlaceOfDeliveryGroup(null);
      setNewTags([]);
      setNewNote('');
      setNewCapacityTEU(0);
      setNewValidity(new Date());
    }
  }, [open]);

  const handleAdd = async () => {
    const opportunityData = {
      salesRepId: newSalesRep?.id || '',
      bookingPartyId: newBookingParty?.id || '',
      statisticalClientId: newStatisticalClient?.id || '',
      equipmentGroupId: newEquipmentGroups?.id || '',
      commodityGroupId: newCommodityGroups?.id || '',
      placeOfReceiptGroupId: newPlaceOfReceiptGroup?.id || '',
      portOfLoadingGroupId: newPortOfLoadingGroup?.id || '',
      portOfDischargeGroupId: newPortOfDischargeGroup?.id || '',
      placeOfDeliveryGroupId: newPlaceOfDeliveryGroup?.id || '',
      tagIds: newTags,
      note: newNote,
      capacityTEU: newCapacityTEU,
      validity: newValidity,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: newSalesRep?.id || null,
    };
    try {
      await firebase.firestore().collection('opportunities').add(opportunityData);
      console.debug('Adding new opportunity with data:', opportunityData);
      onClose();
    } catch (error) {
      console.error('Failed to add opportunity:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Opportunity</DialogTitle>
      <DialogContent>
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
        <Autocomplete
          options={clients || []}
          getOptionLabel={option => option?.name || ''}
          value={newBookingParty}
          onChange={(_, value) => setNewBookingParty(value)}
          renderInput={params => (
            <TextField {...params} label="Booking Party" margin="dense" variant="outlined" />
          )}
        />
        <OpportunityEquipmentGroupInput
          label="Equipment Groups"
          options={equipmentGroups || []}
          value={newEquipmentGroups}
          onChange={group => setNewEquipmentGroups(group)}
          margin="dense"
        />
        <OpportunityCommodityGroupInput
          label="Commodity Groups"
          options={commodityGroups || []}
          value={newCommodityGroups}
          onChange={group => setNewCommodityGroups(group)}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Receipt"
          options={placesGroups || []}
          value={newPlaceOfReceiptGroup}
          onChange={group => setNewPlaceOfReceiptGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Loading"
          options={portsGroups || []}
          value={newPortOfLoadingGroup}
          onChange={group => setNewPortOfLoadingGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Discharge"
          options={portsGroups || []}
          value={newPortOfDischargeGroup}
          onChange={group => setNewPortOfDischargeGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Delivery"
          options={placesGroups || []}
          value={newPlaceOfDeliveryGroup}
          onChange={group => setNewPlaceOfDeliveryGroup(group ?? null)}
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
          disabled={!newSalesRep || !newStatisticalClient}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewOpportunityDialog;
