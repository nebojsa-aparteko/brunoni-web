import React, { useContext } from 'react';
import { Box, Grid } from '@material-ui/core';
import set from 'lodash/fp/set';
import ActingAs from '../../contexts/ActingAs';
import { OpportunitiesContextFilters } from '../../providers/OpportunitiesFilterProvider';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';
import { OpportunityTag } from '../../model/OpportunityTag';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';

import OpportunityPortsGroupInput from '../inputs/OpportunityPortsGroupInput';
import OpportunityPlacesGroupInput from '../inputs/OpportunityPlacesGroupInput';
import OpportunityCommodityGroupInput from '../inputs/OpportunityCommodityGroupInput';
import OpportunityEquipmentGroupInput from '../inputs/OpportunityEquipmentGroupInput';
import OpportunityTagInput from '../inputs/OpportunityTagsInput';

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

const OpportunitiesFiltersBar: React.FC<Props> = ({
  filters,
  setFilters,
  portsGroups,
  placesGroups,
  opportunityTags,
  commodityGroups,
  equipmentGroups,
}) => {
  const [actingAs] = useContext(ActingAs);

  const {
    portsGroup,
    placesGroup,
    tags: selectedOpportunityTags,
    commodityGroups: selectedCommodityGroups,
    equipmentGroups: selectedEquipmentGroups,
  } = filters;

  const setPortsGroup = (portsGroup: OpportunityPortsGroup | null) =>
    setFilters && setFilters(set('portsGroup', portsGroup || undefined)(filters));

  const setPlacesGroup = (placesGroup: OpportunityPlacesGroup | null) =>
    setFilters && setFilters(set('placesGroup', placesGroup || undefined)(filters));

  const setOpportunityTags = (tags: OpportunityTag[] | null) =>
    setFilters && setFilters(set('tags', tags || [])(filters));

  const setCommodityGroups = (groups: OpportunityCommodityGroup[] | null) =>
    setFilters && setFilters(set('commodityGroups', groups || [])(filters));

  const setEquipmentGroups = (groups: OpportunityEquipmentGroup[] | null) =>
    setFilters && setFilters(set('equipmentGroups', groups || [])(filters));

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
              multiple
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
              multiple
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OpportunitiesFiltersBar;
