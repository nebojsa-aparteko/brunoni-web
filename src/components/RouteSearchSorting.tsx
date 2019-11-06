import React from 'react';
import sortBy from 'lodash/sortBy';
import { Theme, makeStyles, Grid, Box, Typography, Radio, Button } from '@material-ui/core';
import { RouteSearchResult } from '../model/route-search/RouteSearchResults';

export interface Sorting {
  name: string;
  sort: (routes: RouteSearchResult[]) => RouteSearchResult[];
}

export const sortingOptions: Sorting[] = [
  {
    name: 'Shortest transit time',
    sort: (routes: RouteSearchResult[]) => sortBy(routes, (route: RouteSearchResult) => route.TransitTime),
  },
  {
    name: 'Earliest arrival date',
    sort: (routes: RouteSearchResult[]) =>
      sortBy(routes, (route: RouteSearchResult) => route.DestinationInfo.ArrivalDate),
  },
  {
    name: 'Earliest departure date',
    sort: (routes: RouteSearchResult[]) => sortBy(routes, (route: RouteSearchResult) => route.OriginInfo.DepartureDate),
  },
];

interface Props {
  value: Sorting;
  onChange: (sorting: Sorting) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    display: 'flex',
  },
  button: {
    flex: 1,
    justifyContent: 'start',
  },
  label: {
    textTransform: 'initial',
  },
}));

const RouteSearchSorting: React.FC<Props> = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <Box>
      <Typography variant="subtitle2">Sorting</Typography>
      <Grid container spacing={2}>
        {sortingOptions.map((sortingOption, i) => (
          <Grid item sm={Math.floor(12 / sortingOptions.length) as any} className={classes.item}>
            <Button className={classes.button} onClick={() => onChange(sortingOption)}>
              <Radio
                checked={value === sortingOption}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': i.toString() }}
              />
              <Typography id={i.toString()} variant="body2" className={classes.label}>
                {sortingOption.name}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RouteSearchSorting;
