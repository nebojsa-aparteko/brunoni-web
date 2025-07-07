import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';

import Meta from './Meta';
import OpportunitiesFiltersBar from './searchbar/OpportunitiesFiltersBar';
import { useOpportunitiesListFilterContext } from '../providers/OpportunitiesFilterProvider';

import useOpportunityPortsGroups from '../hooks/useOpportunityPortsGroups';
import useOpportunityPlacesGroups from '../hooks/useOpportunityPlacesGroups';
import useOpportunityTags from '../hooks/useOpportunityTags';
import useOpportunityCommodityGroups from '../hooks/useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from '../hooks/useOpportunityEquipmentGroups';

interface Props {
  isAdmin?: boolean;
  archived?: boolean;
  showDateRangeFilter?: boolean;
}

const OpportunitiesView: React.FC<Props> = ({ isAdmin, archived, showDateRangeFilter }) => {
  const [filters, setFilters] = useOpportunitiesListFilterContext();

  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();

  return (
    <Fragment>
      <Meta title={`Opportunities`} />
      <Grid container direction="row">
        <Grid item md={12}>
          <OpportunitiesFiltersBar
            filters={filters}
            setFilters={setFilters}
            showAssigneeFilter={isAdmin}
            portsGroups={portsGroups}
            placesGroups={placesGroups}
            opportunityTags={opportunityTags}
            commodityGroups={commodityGroups}
            equipmentGroups={equipmentGroups}
          />
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default OpportunitiesView;
