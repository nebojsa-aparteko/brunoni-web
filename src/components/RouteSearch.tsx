import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import isObject from 'lodash/fp/isObject';
import update from 'lodash/fp/update';
import uniq from 'lodash/fp/uniq';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import { Box, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';
import RouteSearchSorting, { Sorting, sortingOptions } from './RouteSearchSorting';
import Container from './Container';
import Route from './routeSearch/Route';
import RouteSearchResults, { RouteSearchResult } from '../model/route-search/RouteSearchResults';
import SearchHowTo from './routeSearch/SearchHowTo';
import SearchEmptyResults from './routeSearch/SearchEmptyResults';
import withTestData from '../utilities/withTestData';
import useRequest, { RequestError } from '../hooks/useRequest';
import useErrorMessage from '../utilities/useErrorMessage';
import { RouteSearchContext } from '../contexts/RouteSearchContext';
import SpecialOffers from './SpecialOffers';
import useUser from '../hooks/useUser';
import firebase from '../firebase';

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
}));

const RouteSearch: React.FC<Props> = () => {
  const classes = useStyles();

  const [params, setParams] = useContext(RouteSearchContext);
  const [sorting, setSorting] = useState<Sorting>(sortingOptions[0]);
  const [carrierFilter, setCarrierFilter] = useState(
    isObject(params.carrier) ? (params.carrier as any).name : params.carrier,
  );
  const [visibility, setVisibility] = useState(false);

  const [busy, error, result, search] = useRequest(() => {
    const search = querySting.stringify({
      origin: params.originPort?.id,
      destination: params.destinationPort?.id,
      date: formatDate(params.date, 'yyyy-MM-dd'),
      weeks: params.weeks.toString(),
      carrier: carrierFilter,
    });

    return `${process.env.REACT_APP_API_URL}/routes?${search}`;
  }, [params]);

  const [user, userData] = useUser();

  useEffect(() => {
    if (!busy || error || result) {
      return;
    }

    Intercom('trackEvent', 'searched-schedule', {
      origin: params.originPort?.id || null,
      destination: params.destinationPort?.id || null,
      date: formatDate(params.date, 'yyyy-MM-dd') || null,
      weeks: params.weeks.toString() || null,
      carrier: carrierFilter || null,
    });

    firebase
      .firestore()
      .collection('schedule-searches')
      .add({
        origin: params.originPort?.id || null,
        destination: params.destinationPort?.id || null,
        date: formatDate(params.date, 'yyyy-MM-dd') || null,
        weeks: params.weeks.toString() || null,
        carrier: carrierFilter || null,
        userId: get('uid')(user) || null,
        alphacomId: get('alphacomId')(userData) || null,
        alphacomClientId: get('alphacomClientId')(userData) || null,
        timestamp: new Date() || null,
      });
  }, [busy, error, result, search, user]);

  useErrorMessage(error, error =>
    error instanceof RequestError && error.response.status === 504
      ? 'Service is unavailable at the moment. Please try again later.'
      : 'Unexpected error occurred.',
  );

  const carrierFilterFn = (carrierId?: string) => (routes: RouteSearchResult[]) =>
    carrierId
      ? routes &&
        routes.filter(
          (route: RouteSearchResult) => route.OriginInfo.VoyageInfo.Carrier.toLowerCase() === carrierId.toLowerCase(),
        )
      : routes;

  const results = useMemo(() => {
    return result
      ? update('Routes', flow(carrierFilterFn(carrierFilter), sorting.sort))(result)
      : withTestData('routesSearch', update('Routes', sortingOptions[0].sort));
  }, [result, sorting.sort, carrierFilter]) as RouteSearchResults;

  const carriers = useMemo(() => {
    return uniq(result?.Routes.map((route: RouteSearchResult) => route.OriginInfo.VoyageInfo.Carrier)) as string[];
  }, [result]);

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

  // const handleFiltersChange = (carrier: string | undefined) => {
  //   setCarrierFilter(carrierFilterFn(carrier));
  // };

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
              <Grid item md={3} xs={12}>
                <Paper className={classes.sidebar}>
                  <RouteSearchFilters only={carriers} value={carrierFilter} onChange={setCarrierFilter} />
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
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )
        ) : (
          <Fragment>
            <SpecialOffers />
            <SearchHowTo />
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};

export default RouteSearch;
