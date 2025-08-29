import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import OpportunityTagInput from '../inputs/OpportunityTagsInput';
import OpportunityEquipmentGroupInput from '../inputs/OpportunityEquipmentGroupInput';
import OpportunityCommodityGroupInput from '../inputs/OpportunityCommodityGroupInput';
import OpportunityPlacesGroupInput from '../inputs/OpportunityPlacesGroupInput';
import OpportunityPortsGroupInput from '../inputs/OpportunityPortsGroupInput';
import useOpportunityPortsWithDefinition from '../../hooks/useOpportunityPortsWithDefinition';
import useOpportunityTags from '../../hooks/useOpportunityTags';
import useOpportunityEquipmentWithDefinition from '../../hooks/useOpportunityEquipmentWithDefinition';
import useClients from '../../hooks/useClients';
import useAdminUsers from '../../hooks/useAdminUsers';
import { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import { NormalizedOpportunity, OpportunityMatchDefinition } from '../../model/Opportunity';
import Client from '../../model/Client';
import UserRecord from '../../model/UserRecord';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { QUOTE_KIND_OPTIONS } from '../../model/Opportunity';
import useBookingPartyUsers from '../../hooks/useBookingPartyUsers';
import DateInput from '../inputs/DateInput';
import ContainerType from '../../model/ContainerType';
import useOpportunityCommodityWithDefinition from '../../hooks/useOpportunityCommodityWithDefinition';
import useOpportunityPlacesWithDefinition from '../../hooks/useOpportunityPlacesWithDefinition';
import Port from '../../model/Port';
interface EditOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  opportunity: NormalizedOpportunity | null;
  onUpdate: (updatedOpportunity: NormalizedOpportunity) => void;
  onDelete: (opportunityId: string) => void;
}

const EditOpportunityDialog: React.FC<EditOpportunityDialogProps> = ({
  open,
  onClose,
  opportunity,
  onUpdate,
  onDelete,
}) => {
  const [salesRep, setSalesRep] = useState<UserRecord | null>(null);
  const [bookingParty, setBookingParty] = useState<Client | null>(null);
  const [bookingPartyRep, setBookingPartyRep] = useState<UserRecord | null>(null);
  const [statisticalClient, setStatisticalClient] = useState<Client | null>(null);
  const [equipment, setEquipment] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
    value: OpportunityEquipmentGroup | ContainerType;
  } | null>(null);
  const [placeOfReceipt, setPlaceOfReceipt] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null>(null);
  const [portOfLoading, setPortOfLoading] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'freeText' | 'portId'>;
    value: OpportunityPortsGroup | Port | string;
  } | null>(null);
  const [portOfDischarge, setPortOfDischarge] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'freeText' | 'portId'>;
    value: OpportunityPortsGroup | Port | string;
  } | null>(null);
  const [placeOfDelivery, setPlaceOfDelivery] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityPlacesGroup | string;
  } | null>(null);
  const [commodity, setCommodity] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
    value: OpportunityCommodityGroup | string;
  } | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [note, setNote] = useState<string>('');
  const [capacityTEU, setCapacityTEU] = useState<string>('');
  const [validity, setValidity] = useState<Date | null>(null);
  const [validityPickerOpen, setValidityPickerOpen] = useState(false);
  const [agreementId, setAgreementId] = useState<string>('');
  const [quoteKind, setQuoteKind] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const portsOptions = useOpportunityPortsWithDefinition();
  const placesOptions = useOpportunityPlacesWithDefinition();
  const opportunityTags = useOpportunityTags();
  const commodityOptions = useOpportunityCommodityWithDefinition();
  const equipmentOptions = useOpportunityEquipmentWithDefinition();
  const users = useAdminUsers(CUSTOMER_FACING_ROLES);
  const clients = useClients();
  const bookingPartyUsers = useBookingPartyUsers(bookingParty?.id);

  // Pre-populate form fields when opportunity changes
  useEffect(() => {
    console.debug('Editing opportunity:', opportunity);
    if (opportunity && open) {
      setSalesRep(opportunity.salesRepId || null);
      setBookingParty(opportunity.bookingPartyId || null);
      setBookingPartyRep(opportunity.bookingPartyRepId || null);
      setStatisticalClient(opportunity.statisticalClientId || null);
      setEquipment(opportunity.equipment || null);
      setCommodity(opportunity.commodity || null);
      setPlaceOfReceipt(opportunity.placeOfReceipt || null);
      setPortOfLoading(opportunity.portOfLoading || null);
      setPortOfDischarge(opportunity.portOfDischarge || null);
      setPlaceOfDelivery(opportunity.placeOfDelivery || null);
      setTags(opportunity.tagIds || []);
      setNote(opportunity.note || '');
      setCapacityTEU(opportunity.capacityTEU ? opportunity.capacityTEU.toString() : '');
      setValidity(opportunity.validity ? new Date(opportunity.validity) : null);
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
      bookingPartyRepId: bookingPartyRep?.id || '',
      statisticalClientId: statisticalClient?.id || '',
      equipment: equipment?.definition || null,
      commodity: commodity?.definition || null,
      placeOfReceipt: placeOfReceipt?.definition || '',
      portOfLoading: portOfLoading?.definition || '',
      portOfDischarge: portOfDischarge?.definition || '',
      placeOfDelivery: placeOfDelivery?.definition || '',
      tagIds,
      note,
      capacityTEU: capacityTEU === '' ? null : Number(capacityTEU) > 0 ? Number(capacityTEU) : null,
      validity: validity,
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

      // Create updated opportunity object for callback
      const updatedOpportunity: NormalizedOpportunity = {
        ...opportunity,
        salesRepId: salesRep,
        bookingPartyId: bookingParty,
        bookingPartyRepId: bookingPartyRep,
        statisticalClientId: statisticalClient,
        equipment: equipment,
        commodity: commodity,
        placeOfReceipt: placeOfReceipt,
        portOfLoading: portOfLoading,
        portOfDischarge: portOfDischarge,
        placeOfDelivery: placeOfDelivery,
        tagIds: tags,
        agreementId,
        quoteKind,
        note,
        capacityTEU:
          capacityTEU === '' ? null : Number(capacityTEU) > 0 ? Number(capacityTEU) : null,
        validity: validity,
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

  const handleDelete = async () => {
    if (!opportunity?.id) {
      console.error('No opportunity ID found:', opportunity);
      return;
    }

    setIsLoading(true);

    try {
      await firebase.firestore().collection('opportunities').doc(opportunity.id).delete();

      onDelete(opportunity.id);
      onClose();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
      alert('Failed to delete opportunity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Opportunity #{opportunity?.opportunityId}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <UserInput
              label="Sales Representative"
              users={users?.filter(user => user.role === 'sales') || []}
              onChange={(_, user) => setSalesRep(user)}
              value={salesRep}
            />
            <Autocomplete
              options={clients || []}
              getOptionLabel={option =>
                option?.name ? `${option.name} - ${option.city} (${option.id})` : ''
              }
              value={statisticalClient}
              onChange={(_, value) => setStatisticalClient(value)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Statistical Client"
                  margin="dense"
                  variant="outlined"
                />
              )}
            />
            <TextField
              margin="dense"
              label="Booking Party"
              type="text"
              fullWidth
              variant="outlined"
              value={
                bookingParty?.name
                  ? `${bookingParty.name} - ${bookingParty.city} (${bookingParty.id})`
                  : 'Not specified'
              }
              InputProps={{
                readOnly: true,
              }}
              disabled
            />
            <UserInput
              label="Booking Party Representative"
              users={bookingPartyUsers || []}
              onChange={(_, user) => setBookingPartyRep(user)}
              value={bookingPartyRep}
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
            <Autocomplete
              options={[...QUOTE_KIND_OPTIONS]}
              getOptionLabel={option => option}
              value={quoteKind || null}
              onChange={(_, value) => setQuoteKind(value || '')}
              renderInput={params => (
                <TextField {...params} label="Quote Kind" margin="dense" variant="outlined" />
              )}
            />
            <OpportunityEquipmentGroupInput
              label="Equipment"
              options={equipmentOptions || []}
              value={equipment}
              onChange={group => setEquipment(group)}
              margin="dense"
            />
            <OpportunityCommodityGroupInput
              label="Commodity"
              options={commodityOptions || []}
              value={commodity}
              onChange={group => setCommodity(group)}
              margin="dense"
            />
            <OpportunityTagInput
              label="Tags"
              options={opportunityTags || []}
              value={tags}
              onChange={(_, value) => setTags(Array.isArray(value) ? value : value ? [value] : [])}
            />
          </Grid>
          <Grid item xs={6}>
            <OpportunityPlacesGroupInput
              label="Place of Receipt"
              options={placesOptions || []}
              value={placeOfReceipt}
              onChange={group => setPlaceOfReceipt(group)}
              margin="dense"
            />
            <OpportunityPortsGroupInput
              label="Port of Loading"
              options={portsOptions || []}
              value={portOfLoading}
              onChange={group => setPortOfLoading(group)}
              margin="dense"
            />
            <OpportunityPortsGroupInput
              label="Port of Discharge"
              options={portsOptions || []}
              value={portOfDischarge}
              onChange={group => setPortOfDischarge(group)}
              margin="dense"
            />
            <OpportunityPlacesGroupInput
              label="Place of Delivery"
              options={placesOptions || []}
              value={placeOfDelivery}
              onChange={group => setPlaceOfDelivery(group)}
              margin="dense"
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
              label="Capacity TEU**"
              type="number"
              fullWidth
              variant="outlined"
              value={capacityTEU}
              onChange={e => setCapacityTEU(e.target.value)}
              error={capacityTEU !== '' && Number(capacityTEU) <= 0}
              helperText={
                capacityTEU !== '' && Number(capacityTEU) <= 0
                  ? 'Capacity must be greater than 0'
                  : ''
              }
              inputProps={{ min: 1 }}
            />
            <DateInput
              label="Validity"
              value={validity}
              onChange={date => setValidity(date)}
              open={validityPickerOpen}
              onOpen={() => setValidityPickerOpen(true)}
              onClose={() => setValidityPickerOpen(false)}
              margin="dense"
              format="dd.MM.yyyy"
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setShowDeleteConfirm(true)}
          color="secondary"
          disabled={isLoading}
          style={{ marginRight: 'auto' }}
        >
          Delete
        </Button>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          color="primary"
          variant="contained"
          disabled={isLoading || Number(capacityTEU) <= 0}
        >
          {isLoading ? 'Saving...' : 'Update'}
        </Button>
      </DialogActions>

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this opportunity? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default EditOpportunityDialog;
