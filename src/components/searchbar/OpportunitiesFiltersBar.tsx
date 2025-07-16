import React, { useContext } from 'react';
import { Box, Grid } from '@material-ui/core';
import set from 'lodash/fp/set';
import { OpportunitiesContextFilters } from '../../providers/OpportunitiesFilterProvider';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityTag } from '../../model/OpportunityTag';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';
import UserRecord, { isSuperAdmin } from '../../model/UserRecord';
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
import useAdminUsers from '../../hooks/useAdminUsers';
import Client from '../../model/Client';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import OpportunityQuoteKindInput from '../inputs/OpportunityQuoteKindInput';
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
  const users = useAdminUsers();
  const clients = useClients();
  const {
    clientFilter,
    portsGroup,
    placesGroup,
    tags: selectedOpportunityTags,
    commodityGroups: selectedCommodityGroups,
    equipmentGroups: selectedEquipmentGroups,
    assignee,
  } = filters;

  const setClientFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('clientFilter', client || undefined)(filters));

  const setPortsGroup = (portsGroup: OpportunityPortsGroup | null | undefined) =>
    setFilters && setFilters(set('portsGroup', portsGroup || undefined)(filters));

  const setPlacesGroup = (placesGroup: OpportunityPlacesGroup | null | undefined) =>
    setFilters && setFilters(set('placesGroup', placesGroup || undefined)(filters));

  const setOpportunityTags = (tags: OpportunityTag[] | null | undefined) =>
    setFilters && setFilters(set('tags', tags || [])(filters));

  const setCommodityGroups = (groups: OpportunityCommodityGroup[] | null | undefined) =>
    setFilters && setFilters(set('commodityGroups', groups || [])(filters));

  const setEquipmentGroups = (groups: OpportunityEquipmentGroup[] | null | undefined) =>
    setFilters && setFilters(set('equipmentGroups', groups || [])(filters));

  const setUserFilter = (user: UserRecord | null | undefined) =>
    setFilters && setFilters(set('assignee', user || undefined)(filters));

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
        {clients && (
          <Grid item sm={3} xs={12}>
            <Box display="flex">
              <ClientInput
                label="Choose Client"
                clients={clients || []}
                onChange={setClientFilter}
                value={clientFilter}
              />
            </Box>
          </Grid>
        )}

        {portsGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityPortsGroupInput
              label="Ports Group"
              options={portsGroups}
              onChange={setPortsGroup}
              value={portsGroup}
            />
          </Grid>
        )}

        {placesGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityPlacesGroupInput
              label="Delivery Group"
              options={placesGroups}
              onChange={setPlacesGroup}
              value={placesGroup}
            />
          </Grid>
        )}

        {opportunityTags && (
          <Grid item sm={3} xs={12}>
            <OpportunityTagInput
              label="Opportunity Tags"
              options={opportunityTags}
              onChange={setOpportunityTags}
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
              onChange={setCommodityGroups}
              value={selectedCommodityGroups || []}
            />
          </Grid>
        )}

        {equipmentGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityEquipmentGroupInput
              label="Equipment Groups"
              options={equipmentGroups}
              onChange={setEquipmentGroups}
              value={selectedEquipmentGroups || []}
            />
          </Grid>
        )}

        {users && (
          <Grid item sm={3} xs={12}>
            <UserInput
              label="Choose User"
              users={users || []}
              onChange={(_, user) => setUserFilter(user)}
              value={assignee}
            />
          </Grid>
        )}
        <Grid item sm={3} xs={12}>
          <OpportunityQuoteKindInput
            label="Kind of Quote"
            value={filters.kindOfQuote}
            onChange={value => setFilters(f => ({ ...f, kindOfQuote: value || [] }))}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunitiesFiltersBar;
