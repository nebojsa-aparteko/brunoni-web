import React, { Fragment, useEffect, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import uniq from 'lodash/fp/uniq';
import { Box, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import RouteSearchParams from '../model/route-search/RouteSearchParams';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';
import RouteSearchSorting, { Sorting, sortingOptions } from './RouteSearchSorting';
import Container from './Container';
import Typography from '@material-ui/core/Typography';
import { useSnackbar } from 'notistack';
import Route from './routeSearch/Route';
import RouteSearchResults from '../model/route-search/RouteSearchResults';
import SearchHowTo from './routeSearch/SearchHowTo';
import SearchEmptyResults from './routeSearch/SearchEmptyResults';
import useTestData from '../utilities/useTestData';

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
  const { enqueueSnackbar } = useSnackbar();
  const [params, setParams] = useState<RouteSearchParams>({ date: new Date(), weeks: 4 });
  const [sorting, setSorting] = useState<Sorting>(sortingOptions[0]);
  const [results, setResults] = useState<RouteSearchResults | null | undefined>(
    useTestData('routesSearch', update('Routes', sortingOptions[0].sort)),
  );
  const [action, setAction] = useState<{ callback?: () => void } | undefined>();
  const [visibility, setVisibility] = useState(false);

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

    if (results === undefined) {
      setResults(null);
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const search = querySting.stringify({
          origin: params.originPort!.id,
          destination: params.destinationPort!.id,
          date: formatDate(params.date, 'yyyy-MM-dd'),
          weeks: params.weeks.toString(),
          carrier: params.carrier,
        });
        const response = await fetch(`${process.env.REACT_APP_API_URL}/routes?${search}`, { signal });
        const body = await response.json();
        setResults(update('Routes', sorting.sort)(body as RouteSearchResults));
        setAction(undefined);
      } catch (e) {
        if (e.code !== e.ABORT_ERR) {
          console.error('Failed to load routes', e);
          setAction(undefined);
          enqueueSnackbar(<Typography>Failed to load routes.</Typography>, { variant: 'error' });
        }
      } finally {
        if (action.callback) {
          action.callback();
        }
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
      setResults(update('Routes', s.sort)(results!));
    }
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
                onSearch={callback => setAction({ callback })}
                paperVisibility={handleVisibility(!visibility)}
              />
            </Container>
          </Paper>
        </Sticky>
      </Box>
      <Container>
        {results !== undefined ? (
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
                <Paper className={classes.sorting}>
                  <RouteSearchSorting value={sorting} onChange={handleSortingChange} />
                </Paper>
                {results ? (
                  results.Routes.map((route, i) => <Route key={i} route={route} />)
                ) : (
                  <Fragment>
                    <Route />
                  </Fragment>
                )}
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
