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
import useOpportunityPortsGroups from '../../hooks/useOpportunityPortsGroups';
import useOpportunityPlacesGroups from '../../hooks/useOpportunityPlacesGroups';
import useOpportunityTags from '../../hooks/useOpportunityTags';
import useOpportunityCommodityGroups from '../../hooks/useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from '../../hooks/useOpportunityEquipmentGroups';
import UserInput from '../inputs/UserInput';
import Client from '../../model/Client';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import { CUSTOMER_FACING_ROLES } from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import { QUOTE_KIND_OPTIONS, QuoteKind } from '../../model/Opportunity';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  filters: OpportunitiesContextFilters;
  setFilters: any;
  showAssigneeFilter?: boolean;
  portsGroups?: OpportunityPortsGroup[];
  placesGroups?: OpportunityPlacesGroup[];
  opportunityTags?: OpportunityTag[];
  commodityGroups?: OpportunityCommodityGroup[];
  equipmentGroups?: OpportunityEquipmentGroup[];
}

const OpportunitiesFiltersBar: React.FC<Props> = ({ filters, setFilters }) => {
  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();
  const users = useAdminUsers(CUSTOMER_FACING_ROLES);
  const clients = useClients();
  const {
    statisticalClient,
    bookingParty,
    bookingPartyRep,
    portsOfLoadingGroup,
    portsOfDischargeGroup,
    placesOfDeliveryGroup,
    placesOfReceiptGroup,
    tags: selectedOpportunityTags,
    commodityGroup: selectedCommodityGroup,
    equipmentGroup: selectedEquipmentGroup,
    assignee,
    quoteKind,
    opportunityId,
  } = filters;

  const setStatisticalClient = (client: Client | null | undefined) =>
    setFilters && setFilters(set('statisticalClient', client || undefined)(filters));

  const setBookingPartyFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('bookingParty', client || undefined)(filters));

  const setPortsOfLoadingGroupFilter = (portsGroup: OpportunityPortsGroup | null | undefined) =>
    setFilters && setFilters(set('portsOfLoadingGroup', portsGroup || undefined)(filters));

  const setPortsOfDischargeGroupFilter = (portsGroup: OpportunityPortsGroup | null | undefined) =>
    setFilters && setFilters(set('portsOfDischargeGroup', portsGroup || undefined)(filters));

  const setPlacesOfDeliveryGroupFilter = (placesGroup: OpportunityPlacesGroup | null | undefined) =>
    setFilters && setFilters(set('placesOfDeliveryGroup', placesGroup || undefined)(filters));

  const setPlacesOfReceiptGroupFilter = (placesGroup: OpportunityPlacesGroup | null | undefined) =>
    setFilters && setFilters(set('placesOfReceiptGroup', placesGroup || undefined)(filters));

  const setOpportunityTagsFilter = (tags: OpportunityTag[] | null | undefined) =>
    setFilters && setFilters(set('tags', tags || [])(filters));

  const setCommodityGroupFilter = (group: OpportunityCommodityGroup | null | undefined) =>
    setFilters && setFilters(set('commodityGroup', group || undefined)(filters));

  const setEquipmentGroupFilter = (group: OpportunityEquipmentGroup | null | undefined) =>
    setFilters && setFilters(set('equipmentGroup', group || undefined)(filters));

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
        {portsGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityPortsGroupInput
              label="Port of Loading"
              options={portsGroups}
              onChange={setPortsOfLoadingGroupFilter}
              value={portsOfLoadingGroup}
            />
          </Grid>
        )}
        {portsGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityPortsGroupInput
              label="Port of Discharge"
              options={portsGroups}
              onChange={setPortsOfDischargeGroupFilter}
              value={portsOfDischargeGroup}
            />
          </Grid>
        )}
        {placesGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityPlacesGroupInput
              label="Place of Delivery"
              options={placesGroups}
              onChange={setPlacesOfDeliveryGroupFilter}
              value={placesOfDeliveryGroup}
            />
          </Grid>
        )}{' '}
        {placesGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityPlacesGroupInput
              label="Place of Receipt"
              options={placesGroups}
              onChange={setPlacesOfReceiptGroupFilter}
              value={placesOfReceiptGroup}
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
        {commodityGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityCommodityGroupInput
              label="Commodity Groups"
              options={commodityGroups}
              onChange={setCommodityGroupFilter}
              value={selectedCommodityGroup || null}
            />
          </Grid>
        )}
        {equipmentGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityEquipmentGroupInput
              label="Equipment Groups"
              options={equipmentGroups}
              onChange={setEquipmentGroupFilter}
              value={selectedEquipmentGroup || null}
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
