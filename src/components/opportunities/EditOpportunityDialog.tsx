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
import UserRecordsContext from '../../contexts/UserRecordsContext';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import { NormalizedOpportunity } from '../../model/Opportunity';
import Client from '../../model/Client';
import UserRecord from '../../model/UserRecord';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';

interface EditOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  opportunity: NormalizedOpportunity | null;
  onUpdate: (updatedOpportunity: NormalizedOpportunity) => void;
}

const EditOpportunityDialog: React.FC<EditOpportunityDialogProps> = ({
  open,
  onClose,
  opportunity,
  onUpdate,
}) => {
  const [salesRep, setSalesRep] = useState<UserRecord | null>(null);
  const [bookingParty, setBookingParty] = useState<Client | null>(null);
  const [statisticalClient, setStatisticalClient] = useState<Client | null>(null);
  const [equipmentGroup, setEquipmentGroup] = useState<OpportunityEquipmentGroup | null>(null);
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
  const [commodityGroup, setCommodityGroup] = useState<OpportunityCommodityGroup | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [note, setNote] = useState<string>('');
  const [capacityTEU, setCapacityTEU] = useState<number>(0);
  const [validity, setValidity] = useState<Date>(new Date());
  const [agreementId, setAgreementId] = useState<string>('');
  const [quoteKind, setQuoteKind] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const users = useContext(UserRecordsContext);
  const clients = useClients();

  // Pre-populate form fields when opportunity changes
  useEffect(() => {
    if (opportunity && open) {
      setSalesRep(opportunity.salesRepId || null);
      setBookingParty(opportunity.bookingPartyId || null);
      setStatisticalClient(opportunity.statisticalClientId || null);
      setEquipmentGroup(opportunity.equipmentGroupId || null);
      setCommodityGroup(opportunity.commodityGroupId || null);
      setPlaceOfReceiptGroup(opportunity.placeOfReceiptGroupId || null);
      setPortOfLoadingGroup(opportunity.portOfLoadingGroupId || null);
      setPortOfDischargeGroup(opportunity.portOfDischargeGroupId || null);
      setPlaceOfDeliveryGroup(opportunity.placeOfDeliveryGroupId || null);
      setTags(opportunity.tagIds || []);
      setNote(opportunity.note || '');
      setCapacityTEU(opportunity.capacityTEU || 0);
      setValidity(opportunity.validity ? new Date(opportunity.validity) : new Date());
      setAgreementId(opportunity.agreementId || '');
      setQuoteKind(opportunity.quoteKind || '');
    }
  }, [opportunity, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setIsLoading(false);
      // Form fields will be reset when dialog opens again via the above useEffect
    }
  }, [open]);

  const handleUpdate = async () => {
    if (!opportunity?.id) {
      console.error('No opportunity ID found:', opportunity);
      return;
    }

    setIsLoading(true);

    // Convert tag objects to tag IDs for storage
    const tagIds = tags.map(tag => tag.id || tag);

    const updatedData = {
      salesRepId: salesRep?.id || '',
      // bookingPartyId is intentionally excluded - not editable
      statisticalClientId: statisticalClient?.id || '',
      equipmentGroupId: equipmentGroup?.id || '',
      commodityGroupId: commodityGroup?.id || '',
      placeOfReceiptGroupId: placeOfReceiptGroup?.id || '',
      portOfLoadingGroupId: portOfLoadingGroup?.id || '',
      portOfDischargeGroupId: portOfDischargeGroup?.id || '',
      placeOfDeliveryGroupId: placeOfDeliveryGroup?.id || '',
      tagIds,
      note,
      capacityTEU,
      validity,
      agreementId,
      quoteKind,
      updatedAt: new Date(),
      updatedBy: salesRep?.id || '',
    };

    try {
      await firebase
        .firestore()
        .collection('opportunities')
        .doc(opportunity.id)
        .update(updatedData);
      console.debug('Successfully updated opportunity:', opportunity.id);

      // Create updated opportunity object for callback
      const updatedOpportunity: NormalizedOpportunity = {
        ...opportunity,
        salesRepId: salesRep,
        bookingPartyId: bookingParty,
        statisticalClientId: statisticalClient,
        equipmentGroupId: equipmentGroup,
        commodityGroupId: commodityGroup,
        placeOfReceiptGroupId: placeOfReceiptGroup,
        portOfLoadingGroupId: portOfLoadingGroup,
        portOfDischargeGroupId: portOfDischargeGroup,
        placeOfDeliveryGroupId: placeOfDeliveryGroup,
        tagIds: tags,
        agreementId,
        quoteKind,
        note,
        capacityTEU,
        validity,
      };

      onUpdate(updatedOpportunity);
      onClose();
    } catch (error) {
      console.error('Failed to update opportunity:', error);
      alert('Failed to update opportunity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Opportunity</DialogTitle>
      <DialogContent>
        <UserInput
          label="Choose User"
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
        <TextField
          margin="dense"
          label="Booking Party"
          type="text"
          fullWidth
          variant="outlined"
          value={bookingParty?.name || 'Not specified'}
          InputProps={{
            readOnly: true,
          }}
          disabled
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
          options={equipmentGroups || []}
          value={equipmentGroup}
          onChange={group => setEquipmentGroup(group)}
          margin="dense"
        />
        <OpportunityCommodityGroupInput
          label="Commodity Groups"
          options={commodityGroups || []}
          value={commodityGroup}
          onChange={group => setCommodityGroup(group)}
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
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          color="primary"
          variant="contained"
          disabled={!salesRep || !statisticalClient || isLoading}
          title={
            !salesRep
              ? 'Sales Rep required'
              : !statisticalClient
                ? 'Statistical Client required'
                : ''
          }
        >
          {isLoading ? 'Saving...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOpportunityDialog;
