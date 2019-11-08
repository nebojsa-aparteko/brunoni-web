import React, { Fragment, useEffect, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import { Theme, makeStyles, Box, Paper, Grid } from '@material-ui/core';
import RouteSearchParams from '../model/route-search/RouteSearchParams';
import RouteSearchResults from '../model/route-search/RouteSearchResults';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';
import RouteSearchSorting, { Sorting, sortingOptions } from './RouteSearchSorting';
import Container from './Container';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  stickyActive: {
    '> div': {
      padding: 0,
    },
  },
  hero: {
    '> .sticky-outer-wrapper > .sticky-inner-wrapper': {
      display: 'flex',
    },
    background: `url(${require(`../assets/hero.${process.env.REACT_APP_BRAND}.jpg`)})`,
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
  sidebar: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  sorting: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  route: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const RouteSearch: React.FC<Props> = () => {
  const classes = useStyles();
  const [params, setParams] = useState<RouteSearchParams>({ date: new Date(), weeks: 4 });
  const [sorting, setSorting] = useState<Sorting>(sortingOptions[0]);
  const [results, setResults] = useState<RouteSearchResults | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [action, setAction] = useState<{ callback?: () => void } | undefined>();

  useEffect(() => {
    if (!action) {
      return undefined;
    }

    if (!params.originPort || !params.destinationPort || !params.date || !params.weeks) {
      if (action && action.callback) {
        action.callback();
      }
      return undefined;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const search = querySting.stringify({
          origin: params.originPort!.ID,
          destination: params.destinationPort!.ID,
          date: formatDate(params.date, 'yyyy-MM-dd'),
          weeks: params.weeks.toString(),
          carrier: params.carrier,
        });
        const response = await fetch(`${process.env.REACT_APP_API_URL}/routes?${search}`, { signal });
        const body = await response.json();
        setResults(update('Routes', sorting.sort)(body as RouteSearchResults));
      } catch (e) {
        console.error('Failed to load routes', e);
        setError(e);
      } finally {
        if (action.callback) {
          action.callback();
        }
        setAction(undefined);
      }
    })();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, action]);

  const handleFiltersChange = (carrier: string | undefined, callback: () => void) => {
    setParams(set('carrier', carrier)(params));
    setAction({ callback });
  };

  const handleSortingChange = (s: Sorting) => {
    setSorting(s);
    if (results) {
      setResults(update('Routes', sorting.sort)(results!));
    }
  };

  return (
    <Fragment>
      <Sticky enabled={true} top={50}>
        <Box className={classes.hero}>
          <Container>
            <RouteSearchBar value={params} onChange={setParams} onSearch={callback => setAction({ callback })} />
          </Container>
        </Box>
      </Sticky>
      {results && (
        <Container>
          <Grid container spacing={2}>
            <Grid item md={3}>
              <Paper className={classes.sidebar}>
                <RouteSearchFilters value={params.carrier} onChange={handleFiltersChange} />
              </Paper>
            </Grid>
            <Grid item md={9}>
              <Paper className={classes.sorting}>
                <RouteSearchSorting value={sorting} onChange={handleSortingChange} />
              </Paper>
              {results.Routes.map(route => (
                <Paper key={route.OriginInfo.VoyageInfo.VoyageNr} className={classes.route}>
                  <dl>
                    <dt>TransitTime</dt>
                    <dd>{JSON.stringify(route.TransitTime)}</dd>
                    <dt>DepartureDate</dt>
                    <dd>{JSON.stringify(route.OriginInfo.DepartureDate)}</dd>
                    <dt>ArrivalDate</dt>
                    <dd>{JSON.stringify(route.DestinationInfo.ArrivalDate)}</dd>
                    <dt>Service</dt>
                    <dd>{JSON.stringify(route.Service)}</dd>
                    <dt>Routing</dt>
                    <dd>{JSON.stringify(route.Routing)}</dd>
                    <dt>SpaceInfo</dt>
                    <dd>{JSON.stringify(route.SpaceInfo)}</dd>
                    <dt>SpaceInfoColor</dt>
                    <dd>{JSON.stringify(route.SpaceInfoColor)}</dd>
                    <dt>idRequest</dt>
                    <dd>{JSON.stringify(route.idRequest)}</dd>
                    <dt>idRoute</dt>
                    <dd>{JSON.stringify(route.idRoute)}</dd>
                  </dl>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </Container>
      )}
    </Fragment>
  );
};

export default RouteSearch;
