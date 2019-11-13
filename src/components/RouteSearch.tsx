import React, { Fragment, useEffect, useState } from 'react';
import Sticky from 'react-stickynode';
import querySting from 'querystring';
import formatDate from 'date-fns/format';
import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import { Theme, makeStyles, Box, Paper, Grid, Divider } from '@material-ui/core';
import RouteSearchParams from '../model/route-search/RouteSearchParams';
import RouteSearchResults from '../model/route-search/RouteSearchResults';
import RouteSearchBar from './RouteSearchBar';
import RouteSearchFilters from './RouteSearchFilters';
import RouteSearchSorting, { Sorting, sortingOptions } from './RouteSearchSorting';
import Container from './Container';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
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
  chip: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
  },
}));

const RouteSearch: React.FC<Props> = () => {
  const classes = useStyles();
  const [params, setParams] = useState<RouteSearchParams>({ date: new Date(), weeks: 4 });
  const [sorting, setSorting] = useState<Sorting>(sortingOptions[0]);
  const [results, setResults] = useState<RouteSearchResults | undefined>();
  const [error, setError] = useState<Error | undefined>();
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
        <Sticky enabled={true} top={8} innerZ={1} onStateChange={handleStateChange}>
          <Paper square className={handleVisibility(visibility)}>
            <Container>
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
      {error}
      {results && (
        <Container>
          <Grid container spacing={4}>
            <Grid item md={3}>
              <Paper className={classes.sidebar}>
                <RouteSearchFilters value={params.carrier} onChange={handleFiltersChange} />
              </Paper>
            </Grid>
            <Grid item md={9}>
              <Paper className={classes.sorting}>
                <RouteSearchSorting value={sorting} onChange={handleSortingChange} />
              </Paper>
              {results.Routes.map((route, i) => (
                <Paper key={i} className={classes.route}>
                  <Grid container spacing={2}>
                    <Grid item md={8} sm={6} xs={12}>
                      <Typography variant="subtitle2" display="block" gutterBottom>
                        Carrier
                      </Typography>
                      <Typography variant="h5" display="block" gutterBottom>
                        {route.OriginInfo.VoyageInfo.Carrier}
                      </Typography>
                    </Grid>
                    <Grid item md={4} sm={6} xs={12}>
                      <Typography variant="subtitle2" display="block" gutterBottom>
                        Space Availability
                      </Typography>
                      <Chip
                        label={route.SpaceInfo}
                        style={{ backgroundColor: route.SpaceInfoColor }}
                        className={classes.chip}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider light />
                    </Grid>

                    <Grid item md={4} sm={6} xs={12}>
                      <Typography variant="subtitle2" display="block" gutterBottom>
                        Departure
                      </Typography>
                      <Typography variant="body1" display="block">
                        ETS {route.OriginInfo.DepartureDate}
                      </Typography>
                      <Typography variant="body2" display="block">
                        From {route.OriginInfo.Port.HarbourName}, {route.OriginInfo.Port.Land}
                      </Typography>
                    </Grid>
                    <Grid item md={4} sm={6} xs={12}>
                      <Typography variant="subtitle2" display="block" gutterBottom>
                        Arrival
                      </Typography>
                      <Typography variant="body1" display="block">
                        ETA {route.DestinationInfo.ArrivalDate}
                      </Typography>
                      <Typography variant="body2" display="block">
                        To {route.DestinationInfo.Port.HarbourName}, {route.DestinationInfo.Port.Land}
                      </Typography>
                    </Grid>
                    <Grid item md={2} sm={6} xs={6}>
                      <Typography variant="subtitle2" display="block" gutterBottom>
                        Transit Time
                      </Typography>
                      <Typography variant="body1" display="block" gutterBottom>
                        {route.TransitTime} days
                      </Typography>
                    </Grid>
                    <Grid item md={2} sm={6} xs={6}>
                      <Typography variant="subtitle2" display="block" gutterBottom>
                        Routing
                      </Typography>
                      <Typography variant="body1" display="block" gutterBottom>
                        {route.Routing}
                      </Typography>
                    </Grid>
                  </Grid>
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
