import React, { useContext } from 'react';
import { Box, Grid } from '@material-ui/core';
import set from 'lodash/fp/set';
import { OpportunitiesContextFilters } from '../../providers/OpportunitiesFilterProvider';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityTag } from '../../model/OpportunityTag';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import UserRecord from '../../model/UserRecord';
import OpportunityPortsGroupInput from '../inputs/OpportunityPortsGroupInput';
import OpportunityPlacesGroupInput from '../inputs/OpportunityPlacesGroupInput';
import OpportunityCommodityGroupInput from '../inputs/OpportunityCommodityGroupInput';
import OpportunityEquipmentGroupInput from '../inputs/OpportunityEquipmentGroupInput';
import OpportunityTagInput from '../inputs/OpportunityTagsInput';
import useOpportunityPortsWithDefinition from '../../hooks/useOpportunityPortsWithDefinition';
import useOpportunityPlacesWithDefinition from '../../hooks/useOpportunityPlacesWithDefinition';
import useOpportunityTags from '../../hooks/useOpportunityTags';
import useOpportunityCommodityWithDefinition from '../../hooks/useOpportunityCommodityWithDefinition';
import useOpportunityEquipmentWithDefinition from '../../hooks/useOpportunityEquipmentWithDefinition';
import UserInput from '../inputs/UserInput';
import Client from '../../model/Client';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import { OpportunityMatchDefinition, QUOTE_KIND_OPTIONS, QuoteKind } from '../../model/Opportunity';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Port from '../../model/Port';
import ContainerType from '../../model/ContainerType';

interface Props {
  filters: OpportunitiesContextFilters;
  setFilters: any;
  showAssigneeFilter?: boolean;
  portsGroups?:
    | {
        definition: OpportunityMatchDefinition<'groupId' | 'portId' | 'freeText'>;
        value: OpportunityPortsGroup | Port | string;
      }[]
    | null;
  placesGroups?:
    | {
        definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
        value: OpportunityPlacesGroup | string;
      }[]
    | null;
  opportunityTags?: OpportunityTag[];
  commodityGroups?:
    | {
        definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
        value: OpportunityCommodityGroup | string;
      }[]
    | null;
  equipmentGroups?:
    | {
        definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
        value: OpportunityEquipmentGroup | ContainerType;
      }[]
    | null;
}

const OpportunitiesFiltersBar: React.FC<Props> = ({ filters, setFilters }) => {
  const portsOptions = useOpportunityPortsWithDefinition();
  const placesOptions = useOpportunityPlacesWithDefinition();
  const opportunityTags = useOpportunityTags();
  const commodityOptions = useOpportunityCommodityWithDefinition();
  const equipmentOptions = useOpportunityEquipmentWithDefinition();
  const users = useAdminUsers(CUSTOMER_FACING_ROLES);
  const clients = useClients();
  const {
    statisticalClient,
    bookingParty,
    bookingPartyRep,
    portsOfLoading,
    portsOfDischarge,
    placesOfDelivery,
    placesOfReceipt,
    tags: selectedOpportunityTags,
    commodity: selectedCommodity,
    equipment: selectedEquipment,
    assignee,
    quoteKind,
    opportunityId,
  } = filters;

  const setStatisticalClient = (client: Client | null | undefined) =>
    setFilters && setFilters(set('statisticalClient', client || undefined)(filters));

  const setBookingPartyFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('bookingParty', client || undefined)(filters));

  const setPortsOfLoadingFilter = (portsGroup: any | null | undefined) =>
    setFilters && setFilters(set('portsOfLoading', portsGroup || undefined)(filters));

  const setPortsOfDischargeFilter = (portsGroup: any | null | undefined) =>
    setFilters && setFilters(set('portsOfDischarge', portsGroup || undefined)(filters));

  const setPlacesOfDeliveryFilter = (placesGroup: any | null | undefined) =>
    setFilters && setFilters(set('placesOfDelivery', placesGroup || undefined)(filters));

  const setPlacesOfReceiptFilter = (placesGroup: any | null | undefined) =>
    setFilters && setFilters(set('placesOfReceipt', placesGroup || undefined)(filters));

  const setOpportunityTagsFilter = (tags: OpportunityTag[] | null | undefined) =>
    setFilters && setFilters(set('tags', tags || [])(filters));

  const setCommodityFilter = (group: any | null | undefined) =>
    setFilters && setFilters(set('commodity', group || undefined)(filters));

  const setEquipmentFilter = (group: any | null | undefined) =>
    setFilters && setFilters(set('equipment', group || undefined)(filters));

  const setUserFilter = (user: UserRecord | null | undefined) =>
    setFilters && setFilters(set('assignee', user || undefined)(filters));

  const setQuoteKindFilter = (quoteKind: QuoteKind | null | undefined) =>
    setFilters && setFilters(set('quoteKind', quoteKind || undefined)(filters));

  const setOpportunityIdFilter = (opportunityId: string) =>
    setFilters && setFilters(set('opportunityId', opportunityId || undefined)(filters));

  const setBookingPartyRepFilter = (bookingPartyRep: UserRecord | null | undefined) =>
    setFilters && setFilters(set('bookingPartyRep', bookingPartyRep || undefined)(filters));

  return (
    <Box
      display="flex"
      flexDirection="row-reverse"
      flexWrap="wrap"
      my={2}
      justifyContent="space-between"
      alignContent="space-around"
    >
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <TextField
            label="Opportunity ID"
            variant="outlined"
            fullWidth
            value={opportunityId || ''}
            onChange={e => setOpportunityIdFilter(e.target.value)}
            placeholder="Search by ID..."
          />
        </Grid>
        {clients && (
          <Grid item sm={3} xs={12}>
            <Box display="flex">
              <ClientInput
                label="Statistical Client"
                clients={clients || []}
                onChange={setStatisticalClient}
                value={statisticalClient}
              />
            </Box>
          </Grid>
        )}
        {clients && (
          <Grid item sm={3} xs={12}>
            <Box display="flex">
              <ClientInput
                label="Booking Party"
                clients={clients || []}
                onChange={setBookingPartyFilter}
                value={bookingParty}
              />
            </Box>
          </Grid>
        )}
        {portsOptions && (
          <Grid item sm={3} xs={12}>
            <OpportunityPortsGroupInput
              label="Port of Loading"
              options={portsOptions}
              onChange={setPortsOfLoadingFilter}
              value={portsOfLoading}
            />
          </Grid>
        )}
        {portsOptions && (
          <Grid item sm={3} xs={12}>
            <OpportunityPortsGroupInput
              label="Port of Discharge"
              options={portsOptions}
              onChange={setPortsOfDischargeFilter}
              value={portsOfDischarge}
            />
          </Grid>
        )}
        {placesOptions && (
          <Grid item sm={3} xs={12}>
            <OpportunityPlacesGroupInput
              label="Place of Delivery"
              options={placesOptions}
              onChange={setPlacesOfDeliveryFilter}
              value={placesOfDelivery}
            />
          </Grid>
        )}{' '}
        {placesOptions && (
          <Grid item sm={3} xs={12}>
            <OpportunityPlacesGroupInput
              label="Place of Receipt"
              options={placesOptions}
              onChange={setPlacesOfReceiptFilter}
              value={placesOfReceipt}
            />
          </Grid>
        )}
        {opportunityTags && (
          <Grid item sm={3} xs={12}>
            <OpportunityTagInput
              label="Opportunity Tags"
              options={opportunityTags}
              onChange={(_, value) =>
                setOpportunityTagsFilter(Array.isArray(value) ? value : value ? [value] : [])
              }
              value={selectedOpportunityTags || []}
              multiple
            />
          </Grid>
        )}
        {commodityOptions && (
          <Grid item sm={3} xs={12}>
            <OpportunityCommodityGroupInput
              label="Commodity Groups"
              options={commodityOptions}
              onChange={setCommodityFilter}
              value={selectedCommodity}
            />
          </Grid>
        )}
        {equipmentOptions && (
          <Grid item sm={3} xs={12}>
            <OpportunityEquipmentGroupInput
              label="Equipment Groups"
              options={equipmentOptions}
              onChange={setEquipmentFilter}
              value={selectedEquipment}
            />
          </Grid>
        )}
        {users && (
          <Grid item sm={3} xs={12}>
            <UserInput
              label="Choose Sales Representative"
              users={users || []}
              onChange={(_, user) => setUserFilter(user)}
              value={assignee}
            />
          </Grid>
        )}
        {users && (
          <Grid item sm={3} xs={12}>
            <UserInput
              label="Booking Party Representative"
              users={users || []}
              onChange={(_, user) => setBookingPartyRepFilter(user)}
              value={bookingPartyRep}
            />
          </Grid>
        )}
        <Grid item sm={3} xs={12}>
          <Autocomplete
            options={[...QUOTE_KIND_OPTIONS]}
            getOptionLabel={(option: string) => option}
            value={quoteKind || null}
            onChange={(_, value: string | null) => setQuoteKindFilter(value as QuoteKind)}
            renderInput={(params: any) => (
              <TextField {...params} label="Quote Kind" variant="outlined" />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunitiesFiltersBar;
