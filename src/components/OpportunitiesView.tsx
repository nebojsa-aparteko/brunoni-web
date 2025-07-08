import React, { Fragment, useCallback, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  makeStyles,
  Paper,
  TablePagination,
  Typography,
} from '@material-ui/core';
import { flow, set } from 'lodash/fp';
import Meta from './Meta';
import OpportunitiesFiltersBar from './searchbar/OpportunitiesFiltersBar';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import { useOpportunitiesListFilterContext } from '../providers/OpportunitiesFilterProvider';
import useOpportunityPortsGroups from '../hooks/useOpportunityPortsGroups';
import useOpportunityPlacesGroups from '../hooks/useOpportunityPlacesGroups';
import useOpportunityTags from '../hooks/useOpportunityTags';
import useOpportunityCommodityGroups from '../hooks/useOpportunityCommodityGroups';
import useOpportunityEquipmentGroups from '../hooks/useOpportunityEquipmentGroups';
import { useOpportunityListPaginationContext } from '../providers/OpportunityListPaginationProvider';
import Search from './searchbar/Search';
import OpportunitiesEmptyResults from './opportunities/OpportunitisEmptyResults';

interface Props {
  isAdmin?: boolean;
  archived?: boolean;
  showDateRangeFilter?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),
  },
}));

const OpportunitiesView: React.FC<Props> = ({ isAdmin, archived, showDateRangeFilter }) => {
  const classes = useStyles();
  const [filters, setFilters] = useOpportunitiesListFilterContext();
  const [opportunityPaginationContextData, setOpportnityPaginationContextData] =
    useOpportunityListPaginationContext();
  const { searchString, page, rowsPerPage } = opportunityPaginationContextData;
  const portsGroups = useOpportunityPortsGroups();
  const placesGroups = useOpportunityPlacesGroups();
  const opportunityTags = useOpportunityTags();
  const commodityGroups = useOpportunityCommodityGroups();
  const equipmentGroups = useOpportunityEquipmentGroups();

  // TODO: Replace with real API call when backend is ready
  // const { data: allOpportunities, loading } = useOpportunities();

  // Filter opportunities based on selected filters
  const { assignee } = filters;
  const opportunities = [
    {
      name: 'Europe to Asia Container Route',
    },
  ];
  const isLoading = false;
  const handleSearch = useCallback(
    (searchStringNew: string) => {
      if (searchStringNew !== searchString && setOpportnityPaginationContextData) {
        setOpportnityPaginationContextData(
          flow(
            set('searchString', searchStringNew),
            set('page', 0),
          )(opportunityPaginationContextData),
        );
      }
    },
    [opportunityPaginationContextData, searchString, setOpportnityPaginationContextData],
  );
  // const filteredOpportunities = useMemo(() => {
  //   return allOpportunities.filter(opportunity => {
  //     // Filter by archived status
  //     if (archived !== undefined && opportunity.archived !== archived) {
  //       return false;
  //     }

  //     // Filter by ports group
  //     if (filters.portsGroup && opportunity.portsGroup?.id !== filters.portsGroup.id) {
  //       return false;
  //     }

  //     // Filter by places group
  //     if (filters.placesGroup && opportunity.placesGroup?.id !== filters.placesGroup.id) {
  //       return false;
  //     }

  //     // Filter by tags
  //     if (filters.tags && filters.tags.length > 0) {
  //       const opportunityTagIds = opportunity.tags?.map(tag => tag.id) || [];
  //       const hasMatchingTag = filters.tags.some(filterTag =>
  //         opportunityTagIds.includes(filterTag.id),
  //       );
  //       if (!hasMatchingTag) {
  //         return false;
  //       }
  //     }

  //     // Filter by commodity groups
  //     if (filters.commodityGroups && filters.commodityGroups.length > 0) {
  //       const opportunityCommodityIds = opportunity.commodityGroups?.map(group => group.id) || [];
  //       const hasMatchingCommodity = filters.commodityGroups.some(filterGroup =>
  //         opportunityCommodityIds.includes(filterGroup.id),
  //       );
  //       if (!hasMatchingCommodity) {
  //         return false;
  //       }
  //     }

  //     // Filter by equipment groups
  //     if (filters.equipmentGroups && filters.equipmentGroups.length > 0) {
  //       const opportunityEquipmentIds = opportunity.equipmentGroups?.map(group => group.id) || [];
  //       const hasMatchingEquipment = filters.equipmentGroups.some(filterGroup =>
  //         opportunityEquipmentIds.includes(filterGroup.id),
  //       );
  //       if (!hasMatchingEquipment) {
  //         return false;
  //       }
  //     }

  //     return true;
  //   });
  // }, [allOpportunities, archived, filters]);

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
        <Grid item md={12}></Grid>
      </Grid>
      <div>
        {opportunities && !isLoading ? (
          <Fragment>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" display="inline">
                      Opportunity {archived && '- Archive'}
                    </Typography>
                    <Divider orientation="vertical" style={{ height: '100%' }} />
                    <div id="exportImportBkgView"></div>

                    <Box flex={1} />

                    <Search
                      onSearch={handleSearch}
                      localStorageKey={'bookingSearchQuery'}
                      style={{
                        visibility:
                          opportunities && opportunities.length > 0 ? 'initial' : 'hidden',
                      }}
                    />
                  </Box>
                }
              />
            </Card>

            {opportunities.length === 0 && (
              <OpportunitiesEmptyResults
                message={
                  assignee
                    ? 'There are no opportunities that might need your attention at the moment. ' +
                      'You can use filters bar or quick search (ctrl+g on keyboard) to find what you might be looking for.'
                    : 'No bookings found for your filter criteria. Try changing filters.'
                }
              />
            )}
          </Fragment>
        ) : (
          <Paper className={classes.root}>
            <ChartsCircularProgress />
          </Paper>
        )}
      </div>
    </Fragment>
  );
};

export default OpportunitiesView;
