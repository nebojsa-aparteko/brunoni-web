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
import useOpportunityCommodityWithDefinition from '../../hooks/useOpportunityCommodityWithDefinition';
import useOpportunityEquipmentWithDefinition from '../../hooks/useOpportunityEquipmentWithDefinition';
import useClients from '../../hooks/useClients';
import useAdminUsers from '../../hooks/useAdminUsers';
import { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import Client from '../../model/Client';
import UserRecord from '../../model/UserRecord';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { QUOTE_KIND_OPTIONS } from '../../model/Opportunity';
import useBookingPartyUsers from '../../hooks/useBookingPartyUsers';
import DateInput from '../inputs/DateInput';
import { OpportunityMatchDefinition } from '../../model/Opportunity';
import ContainerType from '../../model/ContainerType';
import useOpportunityPlacesWithDefinition from '../../hooks/useOpportunityPlacesWithDefinition';
import Port from '../../model/Port';

interface AddOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

const AddOpportunityDialog: React.FC<AddOpportunityDialogProps> = ({ open, onClose, onAdd }) => {
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
    value: OpportunityPortsGroup | string | Port;
  } | null>(null);
  const [portOfDischarge, setPortOfDischarge] = useState<{
    definition: OpportunityMatchDefinition<'groupId' | 'freeText' | 'portId'>;
    value: OpportunityPortsGroup | string | Port;
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

  const portsOptions = useOpportunityPortsWithDefinition();
  const placesOptions = useOpportunityPlacesWithDefinition();
  const opportunityTags = useOpportunityTags();
  const commodityOptions = useOpportunityCommodityWithDefinition();
  const equipmentOptions = useOpportunityEquipmentWithDefinition();
  const users = useAdminUsers(CUSTOMER_FACING_ROLES);
  const clients = useClients();
  const bookingPartyUsers = useBookingPartyUsers(bookingParty?.id);

  useEffect(() => {
    if (!open) {
      setSalesRep(null);
      setBookingParty(null);
      setBookingPartyRep(null);
      setStatisticalClient(null);
      setEquipment(null);
      setCommodity(null);
      setPlaceOfReceipt(null);
      setPortOfLoading(null);
      setPortOfDischarge(null);
      setPlaceOfDelivery(null);
      setTags([]);
      setNote('');
      setCapacityTEU('');
      setValidity(null);
      setValidityPickerOpen(false);
      setAgreementId('');
      setQuoteKind('');
    }
  }, [open]);

  // Reset booking party rep when booking party changes
  useEffect(() => {
    setBookingPartyRep(null);
  }, [bookingParty]);

  const tagIds = tags.map(tag => tag.id || tag);
  const handleAdd = async () => {
    const opportunityData = {
      salesRepId: salesRep?.id || '',
      bookingPartyId: bookingParty?.id || '',
      bookingPartyRepId: bookingPartyRep?.id || '',
      statisticalClientId: statisticalClient?.id || '',
      equipment: equipment?.definition || '',
      commodity: commodity?.definition || '',
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
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: salesRep?.id || '',
    };
    try {
      await firebase.firestore().collection('opportunities').add(opportunityData);
      console.debug('Adding new opportunity with data:', opportunityData);
      onClose();
    } catch (error) {
      console.error('Failed to add opportunity:', error, opportunityData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Opportunity</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <UserInput
              label="Sales Representative"
              users={users || []}
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
              label="Equipment Groups"
              options={equipmentOptions || []}
              value={equipment}
              onChange={group => setEquipment(group)}
              margin="dense"
            />
            <OpportunityCommodityGroupInput
              label="Commodity Groups"
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
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          color="primary"
          variant="contained"
          disabled={!bookingParty || Number(capacityTEU) <= 0}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOpportunityDialog;
