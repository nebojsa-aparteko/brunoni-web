import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import uniq from 'lodash/fp/uniq';
import { Box, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';
import RouteSearchSorting, { Sorting, sortingOptions } from './RouteSearchSorting';
import Container from './Container';
import Route from './routeSearch/Route';
import RouteSearchResults from '../model/route-search/RouteSearchResults';
import SearchHowTo from './routeSearch/SearchHowTo';
import SearchEmptyResults from './routeSearch/SearchEmptyResults';
import withTestData from '../utilities/withTestData';
import useRequest, { Callback, RequestError } from '../hooks/useRequest';
import useErrorMessage from '../utilities/useErrorMessage';
import { RouteSearchContext } from '../contexts/RouteSearchContext';
import ScrollToTop from './ScrollToTop';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  containerRoot: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(0),
    },
  },
  hideSearch: {
    width: '100%',
    background: 'transparent',
    boxShadow: 'none',
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
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
    padding: theme.spacing(4),
  },
  stepsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  wrapper: {
    position: 'relative',
  },
  goTop: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
  },
}));

const RouteSearch: React.FC<Props> = () => {
  const classes = useStyles();

  const [params, setParams] = useContext(RouteSearchContext);
  console.log('remembered search', params);
  const [sorting, setSorting] = useState<Sorting>(sortingOptions[0]);
  const [visibility, setVisibility] = useState(false);

  useEffect(() => {
    console.log('params', params);
  });

  const [busy, error, result, search] = useRequest(() => {
    const search = querySting.stringify({
      origin: params.originPort?.id,
      destination: params.destinationPort?.id,
      date: formatDate(params.date, 'yyyy-MM-dd'),
      weeks: params.weeks.toString(),
      carrier: params.carrier,
    });

    return `${process.env.REACT_APP_API_URL}/routes?${search}`;
  }, [params]);

  useErrorMessage(error, error =>
    error instanceof RequestError && error.response.status === 504
      ? 'Service is unavailable at the moment. Please try again later.'
      : 'Unexpected error occurred.',
  );

  const results = useMemo(
    () =>
      result
        ? update('Routes', sorting.sort)(result)
        : withTestData('routesSearch', update('Routes', sortingOptions[0].sort)),
    [result, sorting.sort],
  ) as RouteSearchResults;

  const handleFiltersChange = (carrier: string | undefined, callback: Callback) => {
    setParams(set('carrier', carrier)(params));
    search(callback);
  };

  const handleVisibility = (isVisible: boolean) => {
    return isVisible ? '' : classes.hideSearch;
  };

  const handleStateChange = (status: any) => {
    if (status.status === Sticky.STATUS_FIXED) {
      setVisibility(true);
    } else {
      setVisibility(false);
    }
  };

  return (
    <Fragment>
      <Box className={classes.hero}>
        <Sticky enabled={true} top={0} innerZ={3} onStateChange={handleStateChange}>
          <Paper square className={handleVisibility(visibility)}>
            <Container className={classes.containerRoot}>
              <RouteSearchBar
                value={params}
                onChange={setParams}
                onSearch={search}
                paperVisibility={handleVisibility(!visibility)}
              />
            </Container>
          </Paper>
        </Sticky>
      </Box>
      <Container className={classes.content}>
        {busy || results ? (
          results?.Routes.length === 0 ? (
            <SearchEmptyResults />
          ) : (
            <Grid container spacing={4}>
              <Grid item md={3}>
                <Paper className={classes.sidebar}>
                  <RouteSearchFilters
                    only={uniq(results?.Routes.map(route => route.OriginInfo.VoyageInfo.Carrier))}
                    value={params.carrier}
                    onChange={handleFiltersChange}
                  />
                </Paper>
              </Grid>
              <Grid item md={9}>
                <Grid container>
                  <Grid item xs={12}>
                    <Paper className={classes.sorting}>
                      <RouteSearchSorting value={sorting} onChange={setSorting} />
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    {results ? results.Routes.map((route, i) => <Route key={i} route={route} />) : <Route />}
                    <ScrollToTop scrollStepInPx={50} delayInMs={30} className={classes.goTop} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )
        ) : (
          <SearchHowTo />
        )}
      </Container>
    </Fragment>
  );
};

export default RouteSearch;
