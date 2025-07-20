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
import Client from '../../model/Client';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import OpportunityQuoteKindInput from '../inputs/OpportunityQuoteKindInput';
import userRecords from '../../contexts/UserRecordsContext';
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
  const users = useContext(userRecords);
  const clients = useClients();
  const {
    clientFilter,
    portsOfLoadingGroup,
    portsOfDischargeGroup,
    placesOfDeliveryGroup,
    placesOfReceiptGroup,
    tags: selectedOpportunityTags,
    commodityGroups: selectedCommodityGroups,
    equipmentGroups: selectedEquipmentGroups,
    assignee,
  } = filters;

  const setClientFilter = (client: Client | null | undefined) =>
    setFilters && setFilters(set('clientFilter', client || undefined)(filters));

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

  const setCommodityGroupsFilter = (groups: OpportunityCommodityGroup[] | null | undefined) =>
    setFilters && setFilters(set('commodityGroups', groups || [])(filters));

  const setEquipmentGroupsFilter = (groups: OpportunityEquipmentGroup[] | null | undefined) =>
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
                label="Statistical Client"
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
              onChange={setCommodityGroupsFilter}
              value={selectedCommodityGroups || []}
            />
          </Grid>
        )}
        {equipmentGroups && (
          <Grid item sm={3} xs={12}>
            <OpportunityEquipmentGroupInput
              label="Equipment Groups"
              options={equipmentGroups}
              onChange={setEquipmentGroupsFilter}
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
      </Grid>
    </Box>
  );
};

export default OpportunitiesFiltersBar;
