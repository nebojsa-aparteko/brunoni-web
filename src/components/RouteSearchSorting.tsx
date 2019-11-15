import React from 'react';
import sortBy from 'lodash/sortBy';
import { Grid, Box, Typography } from '@material-ui/core';
import { RouteSearchResult } from '../model/route-search/RouteSearchResults';
import RouteSearchSortingOption from './RouteSearchSortingOption';

export interface Sorting {
  name: string;
  sort: (routes: RouteSearchResult[]) => RouteSearchResult[];
}

export const sortingOptions: Sorting[] = [
  {
    name: 'Earliest departure date',
    sort: (routes: RouteSearchResult[]) => sortBy(routes, (route: RouteSearchResult) => route.OriginInfo.DepartureDate),
  },
  {
    name: 'Earliest arrival date',
    sort: (routes: RouteSearchResult[]) =>
      sortBy(routes, (route: RouteSearchResult) => route.DestinationInfo.ArrivalDate),
  },
  {
    name: 'Shortest transit time',
    sort: (routes: RouteSearchResult[]) => sortBy(routes, (route: RouteSearchResult) => route.TransitTime),
  },
];

interface Props {
  value: Sorting;
  onChange: (sorting: Sorting) => void;
}

const RouteSearchSorting: React.FC<Props> = ({ value, onChange }) => (
  <Box>
    <Typography variant="subtitle2">Sorting</Typography>
    <Grid container spacing={2}>
      {sortingOptions.map((sortingOption, i) => (
        <RouteSearchSortingOption
          key={i}
          value={sortingOption}
          selected={value === sortingOption}
          onSelect={() => onChange(sortingOption)}
        />
      ))}
    </Grid>
  </Box>
);

export default RouteSearchSorting;
