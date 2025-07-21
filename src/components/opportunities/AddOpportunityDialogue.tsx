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
import OpportunityTagInput from '../inputs/OpportunityTagsInput';
import OpportunityEquipmentGroupInput from '../inputs/OpportunityEquipmentGroupInput';
import OpportunityCommodityGroupInput from '../inputs/OpportunityCommodityGroupInput';
import OpportunityPlacesGroupInput from '../inputs/OpportunityPlacesGroupInput';
import OpportunityPortsGroupInput from '../inputs/OpportunityPortsGroupInput';
import useOpportunityPortsGroups from '../../hooks/useOpportunityPortsGroups';
import useOpportunityPlacesGroups from '../../hooks/useOpportunityPlacesGroups';
import useOpportunityTags from '../../hooks/useOpportunityTags';
import useOpportunityCommodityGroups from '../../hooks/useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from '../../hooks/useOpportunityEquipmentGroups';
import useClients from '../../hooks/useClients';
import userRecords from '../../contexts/UserRecordsContext';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import Client from '../../model/Client';
import UserRecord from '../../model/UserRecord';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';

interface AddOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

const AddOpportunityDialog: React.FC<AddOpportunityDialogProps> = ({ open, onClose, onAdd }) => {
  const [salesRep, setSalesRep] = useState<UserRecord | null>(null);
  const [bookingParty, setBookingParty] = useState<Client | null>(null);
  const [statisticalClient, setStatisticalClient] = useState<Client | null>(null);
  const [equipmentGroups, setEquipmentGroups] = useState<OpportunityEquipmentGroup | null>(null);
  const [placeOfReceiptGroup, setPlaceOfReceiptGroup] = useState<OpportunityPlacesGroup | null>(
    null,
  );
  const [portOfLoadingGroup, setPortOfLoadingGroup] = useState<OpportunityPortsGroup | null>(null);
  const [portOfDischargeGroup, setPortOfDischargeGroup] = useState<OpportunityPortsGroup | null>(
    null,
  );
  const [placeOfDeliveryGroup, setPlaceOfDeliveryGroup] = useState<OpportunityPlacesGroup | null>(
    null,
  );
  const [commodityGroups, setCommodityGroups] = useState<OpportunityCommodityGroup | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [note, setNote] = useState<string>('');
  const [capacityTEU, setCapacityTEU] = useState<number>(0);
  const [validity, setValidity] = useState<Date>(new Date());
  const [agreementId, setAgreementId] = useState<string>('');
  const [quoteKind, setQuoteKind] = useState<string>('');

  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroupsOptions = useOpportunityCommodityGroups();
  const equipmentGroupsOptions = useOpportunityEquipmentGroups();
  const users = useContext(userRecords);
  const clients = useClients();

  useEffect(() => {
    if (!open) {
      setSalesRep(null);
      setBookingParty(null);
      setStatisticalClient(null);
      setEquipmentGroups(null);
      setCommodityGroups(null);
      setPlaceOfReceiptGroup(null);
      setPortOfLoadingGroup(null);
      setPortOfDischargeGroup(null);
      setPlaceOfDeliveryGroup(null);
      setTags([]);
      setNote('');
      setCapacityTEU(0);
      setValidity(new Date());
      setAgreementId('');
      setQuoteKind('');
    }
  }, [open]);

  const handleAdd = async () => {
    const opportunityData = {
      salesRepId: salesRep?.id || '',
      bookingPartyId: bookingParty?.id || '',
      statisticalClientId: statisticalClient?.id || '',
      equipmentGroupId: equipmentGroups?.id || '',
      commodityGroupId: commodityGroups?.id || '',
      placeOfReceiptGroupId: placeOfReceiptGroup?.id || '',
      portOfLoadingGroupId: portOfLoadingGroup?.id || '',
      portOfDischargeGroupId: portOfDischargeGroup?.id || '',
      placeOfDeliveryGroupId: placeOfDeliveryGroup?.id || '',
      tagIds: tags,
      note,
      capacityTEU,
      validity,
      agreementId,
      quoteKind,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: salesRep?.id || '',
    };
    try {
      await firebase.firestore().collection('opportunities').add(opportunityData);
      console.debug('Adding new opportunity with data:', opportunityData);
      onClose();
    } catch (error) {
      console.error('Failed to add opportunity:', error);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Opportunity</DialogTitle>
      <DialogContent>
        <UserInput
          label="Sales Representative"
          users={users || []}
          onChange={(_, user) => setSalesRep(user)}
          value={salesRep}
        />
        <Autocomplete
          options={clients || []}
          getOptionLabel={option => option?.name || ''}
          value={statisticalClient}
          onChange={(_, value) => setStatisticalClient(value)}
          renderInput={params => (
            <TextField {...params} label="Statistical Client" margin="dense" variant="outlined" />
          )}
        />
        <Autocomplete
          options={clients || []}
          getOptionLabel={option => option?.name || ''}
          value={bookingParty}
          onChange={(_, value) => setBookingParty(value)}
          renderInput={params => (
            <TextField
              {...params}
              label="Booking Party *"
              margin="dense"
              variant="outlined"
              required
            />
          )}
        />
        <TextField
          margin="dense"
          label="Agreement ID"
          type="text"
          fullWidth
          variant="outlined"
          value={agreementId}
          onChange={e => setAgreementId(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Quote Kind"
          type="text"
          fullWidth
          variant="outlined"
          value={quoteKind}
          onChange={e => setQuoteKind(e.target.value)}
        />
        <OpportunityEquipmentGroupInput
          label="Equipment Groups"
          options={equipmentGroupsOptions || []}
          value={equipmentGroups}
          onChange={group => setEquipmentGroups(group)}
          margin="dense"
        />
        <OpportunityCommodityGroupInput
          label="Commodity Groups"
          options={commodityGroupsOptions || []}
          value={commodityGroups}
          onChange={group => setCommodityGroups(group)}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Receipt"
          options={placesGroups || []}
          value={placeOfReceiptGroup}
          onChange={group => setPlaceOfReceiptGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Loading"
          options={portsGroups || []}
          value={portOfLoadingGroup}
          onChange={group => setPortOfLoadingGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityPortsGroupInput
          label="Port of Discharge"
          options={portsGroups || []}
          value={portOfDischargeGroup}
          onChange={group => setPortOfDischargeGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityPlacesGroupInput
          label="Place of Delivery"
          options={placesGroups || []}
          value={placeOfDeliveryGroup}
          onChange={group => setPlaceOfDeliveryGroup(group ?? null)}
          margin="dense"
        />
        <OpportunityTagInput
          label="Tags"
          options={opportunityTags || []}
          value={tags}
          onChange={(_, value) => setTags(Array.isArray(value) ? value : value ? [value] : [])}
        />
        <TextField
          margin="dense"
          label="Note"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          minRows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Capacity TEU"
          type="number"
          fullWidth
          variant="outlined"
          value={capacityTEU}
          onChange={e => setCapacityTEU(Number(e.target.value))}
        />
        <TextField
          margin="dense"
          label="Validity"
          type="date"
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={formatDateForInput(validity)}
          onChange={e => setValidity(new Date(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} color="primary" variant="contained" disabled={!bookingParty}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOpportunityDialog;
