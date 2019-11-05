import React, { Fragment, useEffect, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import { Theme, makeStyles, Box, Container, Paper, Grid, Button } from '@material-ui/core';
import RouteSearchParams from '../model/route-search/RouteSearchParams';
import RouteSearchResults from '../model/route-search/RouteSearchResults';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  hero: {
    display: 'flex',
    background: `url(${require(`../assets/hero.${process.env.REACT_APP_BRAND}.jpg`)})`,
    padding: theme.spacing(10),
  },
  sidebar: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  route: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

const RouteSearch: React.FC<Props> = ({}) => {
  const classes = useStyles();
  const [params, setParams] = useState<RouteSearchParams>({ date: new Date(), weeks: 4 });
  const [results, setResults] = useState<RouteSearchResults | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [doSearch, setDoSearch] = useState(false);

  useEffect(() => {
    if (!doSearch) {
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
        });
        const response = await fetch(`http://localhost:8080/routes?${search}`, { signal });
        const body = await response.json();
        setResults(body as RouteSearchResults);
      } catch (e) {
        setError(e);
      } finally {
        setDoSearch(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [params, doSearch]);

  return (
    <Fragment>
      <Sticky enabled={true} top={50}>
        <Box className={classes.hero}>
          <Container maxWidth="lg">
            <RouteSearchBar value={params} onChange={setParams} onSearch={() => setDoSearch(true)} />
          </Container>
        </Box>
      </Sticky>
      {results && (
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item md={3}>
              <Paper className={classes.sidebar}>
                <RouteSearchFilters />
              </Paper>
            </Grid>
            <Grid item md={9}>
              {results.Routes.map(route => (
                <Paper className={classes.route}>
                  <dl>
                    <dt>TransitTime</dt>
                    <dd>{JSON.stringify(route.TransitTime)}</dd>
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
